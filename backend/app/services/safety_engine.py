"""
Safety Decision Engine for RAILSAFE Footbridge System.
Enforces proximity safety rules, deterministic state transitions,
fail-safe interlocks, and automated ESP32 command dispatch.
"""

from typing import List, Optional, Tuple
from datetime import datetime
import asyncio
from ..models.train import Train, TrainType, SafetyZone, FreshnessStatus
from ..models.bridge import (
    BridgeState, BridgeCommandType, CommandSource, AckStatus, BridgeStatus, ESP32ConnectionStatus
)
from ..models.alert import SafetyAlert, AlertSeverity, EventType
from .bridge_controller import bridge_controller
from .event_logger import event_logger
from .train_tracker import train_tracker
from ..config import settings

class SafetyEngine:
    def __init__(self):
        self._active_alert: Optional[SafetyAlert] = None
        self._alerts_history: List[SafetyAlert] = []
        self._critical_lock = False

    def get_threshold_for_train(self, train: Train) -> float:
        """Return proximity threshold based on train velocity classification."""
        if train.train_type == TrainType.PASSENGER:
            return settings.thresholds.passenger_local_km
        elif train.train_type in [TrainType.EXPRESS, TrainType.SUPERFAST, TrainType.VANDE_BHARAT]:
            return settings.thresholds.express_superfast_km
        elif train.train_type == TrainType.FREIGHT:
            return settings.thresholds.freight_km
        return settings.thresholds.express_superfast_km

    def get_active_alert(self) -> Optional[SafetyAlert]:
        return self._active_alert

    def get_all_alerts(self) -> List[SafetyAlert]:
        return self._alerts_history

    def acknowledge_active_alert(self, user_id: str = "OPERATOR"):
        if self._active_alert:
            self._active_alert.acknowledged = True
            self._active_alert.acknowledged_by = user_id

    async def evaluate_safety_cycle(self) -> Tuple[BridgeStatus, Optional[SafetyAlert]]:
        """
        Primary continuous safety loop. Evaluates approaching trains against
        proximity thresholds and dispatches fail-safe bridge commands.
        """
        bridge_status = bridge_controller.get_status()
        freshness = train_tracker.get_freshness_status()

        # 1. Fail-safe Check: If train API is unavailable, never auto-reopen
        if freshness == FreshnessStatus.UNAVAILABLE:
            if bridge_status.state in [BridgeState.SAFE_OPEN, BridgeState.OPENING]:
                # In prototype mode, warn clearly
                pass
            return bridge_status, self._active_alert

        # 2. Evaluate all approaching corridor trains
        trains = train_tracker.get_all_trains()
        most_critical_train: Optional[Train] = None
        min_distance = 999.0
        active_threat_threshold = 5.0

        for train in trains:
            if not train.is_approaching:
                continue

            threshold = self.get_threshold_for_train(train)
            dist = train.distance_from_bridge_km

            # Classify zone
            if dist > 10.0:
                train.safety_zone = SafetyZone.SAFE
            elif dist > threshold:
                train.safety_zone = SafetyZone.APPROACHING
            elif dist > 0.0:
                train.safety_zone = SafetyZone.WARNING
                if dist < min_distance:
                    min_distance = dist
                    most_critical_train = train
                    active_threat_threshold = threshold
            elif dist == 0.0:
                train.safety_zone = SafetyZone.CRITICAL_PASSING
                most_critical_train = train
                min_distance = 0.0
                active_threat_threshold = threshold
            else:
                train.safety_zone = SafetyZone.PASSED

        # 3. Action Logic based on Critical Threat
        if most_critical_train:
            bridge_status.active_threat_train = f"{most_critical_train.train_number} {most_critical_train.train_name}"
            bridge_status.threat_distance_km = min_distance

            # Trigger WARNING & CLOSURE if train is at or within threshold
            if min_distance <= active_threat_threshold:
                if bridge_status.state in [BridgeState.SAFE_OPEN, BridgeState.OPENING, BridgeState.TRAIN_APPROACHING]:
                    # Create High-Priority Safety Alert
                    alert = SafetyAlert(
                        severity=AlertSeverity.CRITICAL,
                        title="⚠️ TRAIN APPROACHING SAFETY THRESHOLD",
                        message=f"Train {most_critical_train.train_number} ({most_critical_train.train_name}) detected at {min_distance} km. Safety threshold is {active_threat_threshold} km.",
                        train_number=most_critical_train.train_number,
                        train_name=most_critical_train.train_name,
                        distance_km=min_distance,
                        threshold_km=active_threat_threshold,
                        action_taken="BRIDGE CLOSURE INITIATED",
                        bridge_state="CLOSING"
                    )
                    self._active_alert = alert
                    self._alerts_history.insert(0, alert)

                    event_logger.log_event(
                        event_type=EventType.WARNING_GENERATED,
                        severity=AlertSeverity.CRITICAL,
                        train_number=most_critical_train.train_number,
                        train_name=most_critical_train.train_name,
                        distance_km=min_distance,
                        bridge_state="CLOSURE_REQUESTED",
                        command="CMD_CLOSE",
                        result="ISSUED",
                        details=f"Proximity breach ({min_distance}km <= {active_threat_threshold}km). Automatic closure initiated."
                    )

                    # Send signed closure command to ESP32 controller
                    await bridge_controller.execute_command(
                        command_type=BridgeCommandType.CLOSE,
                        source=CommandSource.AUTO_SAFETY_ENGINE,
                        authorization="SAFETY_ENGINE_RULE_01"
                    )

                elif bridge_status.state == BridgeState.CLOSED and min_distance == 0.0:
                    bridge_status.state = BridgeState.TRAIN_PASSING

        else:
            # No train currently inside safety threshold
            bridge_status.active_threat_train = None
            bridge_status.threat_distance_km = None

            # Reopening candidate: Check if bridge is CLOSED or TRAIN_PASSING and safe to reopen
            if bridge_status.state in [BridgeState.CLOSED, BridgeState.TRAIN_PASSING]:
                # Confirm track area clear
                if bridge_status.esp32_status == ESP32ConnectionStatus.ONLINE and not bridge_status.emergency_status:
                    # Clear active alert
                    if self._active_alert:
                        self._active_alert.is_active = False

                    event_logger.log_event(
                        event_type=EventType.REOPENING_AUTHORIZED,
                        severity=AlertSeverity.INFO,
                        bridge_state="SAFE_TO_OPEN",
                        command="CMD_OPEN",
                        result="AUTHORIZED",
                        details="Approaching corridor clear. Backend safety engine authorized bridge reopening."
                    )

                    await bridge_controller.execute_command(
                        command_type=BridgeCommandType.OPEN,
                        source=CommandSource.AUTO_SAFETY_ENGINE,
                        authorization="SAFETY_ENGINE_CLEARANCE"
                    )

        return bridge_status, self._active_alert

    async def validate_manual_command(
        self,
        command_type: BridgeCommandType,
        source: CommandSource,
        user_role: str
    ) -> Tuple[bool, str]:
        """
        Fail-safe interlock validation for manual staff controls.
        Strictly prevents unsafe bridge opening if a train is in the danger zone.
        """
        if user_role not in ["OPERATOR", "ADMINISTRATOR"]:
            return False, "Access Denied: Manual bridge control requires Railway Operator or Administrator authorization."

        if command_type == BridgeCommandType.EMERGENCY_STOP:
            # Emergency Stop is always permitted unconditionally
            return True, "Emergency Stop authorized."

        if command_type == BridgeCommandType.OPEN:
            # Check if any train is within threshold
            trains = train_tracker.get_all_trains()
            for train in trains:
                if train.is_approaching:
                    thresh = self.get_threshold_for_train(train)
                    if train.distance_from_bridge_km <= thresh:
                        return False, f"SAFETY INTERLOCK BLOCKED: Train {train.train_number} is approaching at {train.distance_from_bridge_km} km (Safety Threshold: {thresh} km). Manual opening forbidden!"

        return True, "Command safety interlock validated."

safety_engine = SafetyEngine()
