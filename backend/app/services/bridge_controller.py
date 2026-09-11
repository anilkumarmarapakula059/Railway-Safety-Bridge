"""
ESP32 Bridge Controller service.
Manages physical / simulated actuator commands, limits, safety locks, and telemetry.
"""

from typing import Optional
from datetime import datetime, timedelta
import asyncio
from ..models.bridge import (
    BridgeStatus, BridgeState, BridgeCommand, BridgeCommandType,
    CommandSource, AckStatus, MotorStatus, ESP32ConnectionStatus, ESP32Telemetry
)
from ..models.alert import EventType, AlertSeverity
from .event_logger import event_logger
from ..config import settings

class BridgeController:
    def __init__(self):
        self.status = BridgeStatus()
        self.telemetry = ESP32Telemetry()
        self._is_actuating = False
        self._manual_lock = False
        self._last_heartbeat = datetime.utcnow()
        self._offline_simulated = False

    def get_status(self) -> BridgeStatus:
        # Check watchdog for ESP32 connection
        if self._offline_simulated or (datetime.utcnow() - self._last_heartbeat).total_seconds() > settings.thresholds.esp32_timeout_sec:
            self.status.esp32_status = ESP32ConnectionStatus.OFFLINE
            self.telemetry.connection_status = ESP32ConnectionStatus.OFFLINE
        else:
            self.status.esp32_status = ESP32ConnectionStatus.ONLINE
            self.telemetry.connection_status = ESP32ConnectionStatus.ONLINE
        return self.status

    def get_telemetry(self) -> ESP32Telemetry:
        self.telemetry.position_pct = self.status.position_pct
        self.telemetry.last_heartbeat = self._last_heartbeat
        return self.telemetry

    def heartbeat(self):
        self._last_heartbeat = datetime.utcnow()
        self._offline_simulated = False
        self.status.esp32_status = ESP32ConnectionStatus.ONLINE
        self.telemetry.connection_status = ESP32ConnectionStatus.ONLINE

    def simulate_disconnect(self, is_disconnected: bool = True):
        self._offline_simulated = is_disconnected
        if is_disconnected:
            self.status.esp32_status = ESP32ConnectionStatus.OFFLINE
            self.telemetry.connection_status = ESP32ConnectionStatus.OFFLINE
            event_logger.log_event(
                event_type=EventType.ESP32_DISCONNECTED,
                severity=AlertSeverity.CRITICAL,
                bridge_state=self.status.state.value,
                command="WATCHDOG_TRIP",
                result="OFFLINE",
                details="ESP32 Bridge Controller heartbeat timed out. Fail-safe locked."
            )

    async def execute_command(
        self,
        command_type: BridgeCommandType,
        source: CommandSource,
        authorization: str = "SYSTEM_AUTO",
        force: bool = False
    ) -> BridgeCommand:
        """
        Executes a bridge command after validating fail-safe preconditions.
        """
        now = datetime.utcnow()
        cmd = BridgeCommand(
            command_type=command_type,
            source=source,
            authorization=authorization,
            current_bridge_state=self.status.state,
            timestamp=now
        )

        # Fail-safe check: Cannot operate if ESP32 is offline
        if self.status.esp32_status == ESP32ConnectionStatus.OFFLINE and not force:
            cmd.acknowledgement_status = AckStatus.FAILED
            cmd.details = "Command rejected: ESP32 Controller is OFFLINE."
            self.status.last_command = cmd
            return cmd

        # Emergency Stop Handler
        if command_type == BridgeCommandType.EMERGENCY_STOP:
            self.status.state = BridgeState.EMERGENCY_STOP
            self.status.motor_status = MotorStatus.BRAKED
            self.status.emergency_status = True
            self.status.pedestrian_crossing_active = False
            self.telemetry.emergency_button_depressed = True
            cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
            cmd.details = "EMERGENCY STOP engaged. Actuators halted immediately with solenoid brake."
            self.status.last_command = cmd
            self.status.last_acknowledgement = now
            event_logger.log_event(
                event_type=EventType.EMERGENCY_STOP,
                severity=AlertSeverity.CRITICAL,
                bridge_state=self.status.state.value,
                command="EMERGENCY_STOP",
                result="SUCCESS",
                details="Emergency Stop triggered. Mechanical brakes locked in current position."
            )
            return cmd

        # Reset Fault Handler
        if command_type == BridgeCommandType.RESET_FAULT:
            self.status.emergency_status = False
            self.telemetry.emergency_button_depressed = False
            self.telemetry.obstacle_detected_radar = False
            self.status.state = BridgeState.SAFE_OPEN if self.status.position_pct >= 95 else BridgeState.CLOSED
            cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
            cmd.details = "Faults reset. Bridge returned to monitored state."
            self.status.last_command = cmd
            return cmd

        # STOP command
        if command_type == BridgeCommandType.STOP:
            self.status.motor_status = MotorStatus.IDLE
            cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
            cmd.details = "Actuator motion stopped in position."
            self.status.last_command = cmd
            return cmd

        # CLOSE command (Retract to Platform A)
        if command_type == BridgeCommandType.CLOSE:
            if self.status.state == BridgeState.CLOSED:
                cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
                cmd.details = "Bridge is already fully retracted and closed."
                self.status.last_command = cmd
                return cmd

            self.status.state = BridgeState.CLOSING
            self.status.motor_status = MotorStatus.RETRACTING
            self.status.pedestrian_crossing_active = False
            self.telemetry.motor_current_amps = 2.4
            cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
            cmd.details = "ESP32 ACK received: Linear actuators retracting bridge to Platform A."
            self.status.last_command = cmd
            self.status.last_acknowledgement = now

            event_logger.log_event(
                event_type=EventType.CLOSING_STARTED,
                severity=AlertSeverity.WARNING,
                bridge_state=self.status.state.value,
                command="CMD_CLOSE",
                result="ACK_SUCCESS",
                details="Bridge retraction started. Warning beacons flashing. Gates down."
            )

            # Initiate async physical movement simulation
            asyncio.create_task(self._simulate_retraction(cmd))
            return cmd

        # OPEN command (Extend to Platform B)
        if command_type == BridgeCommandType.OPEN:
            # Reopening must not occur if in EMERGENCY_STOP or actively blocked
            if self.status.emergency_status:
                cmd.acknowledgement_status = AckStatus.REJECTED_UNSAFE
                cmd.details = "Command rejected: System is in EMERGENCY STOP state."
                self.status.last_command = cmd
                return cmd

            self.status.state = BridgeState.OPENING
            self.status.motor_status = MotorStatus.EXTENDING
            self.telemetry.motor_current_amps = 2.1
            cmd.acknowledgement_status = AckStatus.ACK_SUCCESS
            cmd.details = "ESP32 ACK received: Linear actuators extending bridge to Platform B."
            self.status.last_command = cmd
            self.status.last_acknowledgement = now

            event_logger.log_event(
                event_type=EventType.OPENING_STARTED,
                severity=AlertSeverity.INFO,
                bridge_state=self.status.state.value,
                command="CMD_OPEN",
                result="ACK_SUCCESS",
                details="Bridge extension initiated towards Platform 2/3 Island."
            )

            asyncio.create_task(self._simulate_extension(cmd))
            return cmd

        return cmd

    async def _simulate_retraction(self, cmd: BridgeCommand):
        """Simulate smooth retraction from current position down to 0%."""
        while self.status.position_pct > 0 and self.status.state == BridgeState.CLOSING:
            await asyncio.sleep(0.3)
            self.status.position_pct = max(0.0, round(self.status.position_pct - 20.0, 1))
            self.telemetry.position_pct = self.status.position_pct
            if self.status.position_pct <= 0:
                self.status.position_pct = 0.0
                self.status.state = BridgeState.CLOSED
                self.status.motor_status = MotorStatus.IDLE
                self.telemetry.motor_current_amps = 0.0
                self.telemetry.limit_switch_retracted = True
                self.telemetry.limit_switch_extended = False
                self.status.last_state_change = datetime.utcnow()
                event_logger.log_event(
                    event_type=EventType.BRIDGE_CLOSED,
                    severity=AlertSeverity.WARNING,
                    bridge_state=self.status.state.value,
                    command="CMD_CLOSE",
                    result="SUCCESS",
                    details="Footbridge 100% retracted into Platform 1 safe bay. Limit switch LS1 verified."
                )
                break

    async def _simulate_extension(self, cmd: BridgeCommand):
        """Simulate smooth extension from current position up to 100%."""
        while self.status.position_pct < 100 and self.status.state == BridgeState.OPENING:
            await asyncio.sleep(0.3)
            self.status.position_pct = min(100.0, round(self.status.position_pct + 20.0, 1))
            self.telemetry.position_pct = self.status.position_pct
            if self.status.position_pct >= 100:
                self.status.position_pct = 100.0
                self.status.state = BridgeState.SAFE_OPEN
                self.status.motor_status = MotorStatus.IDLE
                self.status.pedestrian_crossing_active = True
                self.telemetry.motor_current_amps = 0.0
                self.telemetry.limit_switch_extended = True
                self.telemetry.limit_switch_retracted = False
                self.status.last_state_change = datetime.utcnow()
                event_logger.log_event(
                    event_type=EventType.BRIDGE_OPENED,
                    severity=AlertSeverity.INFO,
                    bridge_state=self.status.state.value,
                    command="CMD_OPEN",
                    result="SUCCESS",
                    details="Footbridge extended across Platform 1 and Platform 2. Safe pedestrian crossing restored."
                )
                break

bridge_controller = BridgeController()
