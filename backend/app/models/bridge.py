"""
Pydantic models for retractable footbridge state machine, IoT commands, and ESP32 telemetry.
"""

from enum import Enum
from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class BridgeState(str, Enum):
    SAFE_OPEN = "SAFE_OPEN"
    TRAIN_APPROACHING = "TRAIN_APPROACHING"
    WARNING = "WARNING"
    CLOSURE_REQUESTED = "CLOSURE_REQUESTED"
    CLOSING = "CLOSING"
    CLOSED = "CLOSED"
    TRAIN_PASSING = "TRAIN_PASSING"
    SAFE_TO_OPEN = "SAFE_TO_OPEN"
    OPENING = "OPENING"
    FAULT = "FAULT"
    EMERGENCY_STOP = "EMERGENCY_STOP"
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE"

class BridgeCommandType(str, Enum):
    OPEN = "OPEN"
    CLOSE = "CLOSE"
    STOP = "STOP"
    EMERGENCY_STOP = "EMERGENCY_STOP"
    LOCK = "LOCK"
    RESET_FAULT = "RESET_FAULT"

class CommandSource(str, Enum):
    AUTO_SAFETY_ENGINE = "AUTO_SAFETY_ENGINE"
    OPERATOR_MANUAL = "OPERATOR_MANUAL"
    ADMIN_OVERRIDE = "ADMIN_OVERRIDE"
    ESP32_HARDWARE = "ESP32_HARDWARE"

class AckStatus(str, Enum):
    PENDING = "PENDING"
    ACK_SUCCESS = "ACK_SUCCESS"
    REJECTED_UNSAFE = "REJECTED_UNSAFE"
    TIMEOUT = "TIMEOUT"
    FAILED = "FAILED"

class MotorStatus(str, Enum):
    IDLE = "IDLE"
    EXTENDING = "EXTENDING"
    RETRACTING = "RETRACTING"
    BRAKED = "BRAKED"
    OVERCURRENT = "OVERCURRENT"

class ESP32ConnectionStatus(str, Enum):
    ONLINE = "ONLINE"
    DEGRADED = "DEGRADED"
    OFFLINE = "OFFLINE"

class BridgeCommand(BaseModel):
    command_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    command_type: BridgeCommandType
    source: CommandSource
    authorization: str = "SYSTEM_AUTO"
    current_bridge_state: BridgeState
    acknowledgement_status: AckStatus = AckStatus.PENDING
    details: Optional[str] = None
    target_position_pct: Optional[float] = None

class BridgeStatus(BaseModel):
    state: BridgeState = BridgeState.SAFE_OPEN
    position_pct: float = 100.0  # 100% = Extended (Platform A to Platform B), 0% = Retracted (Platform A safe park)
    motor_status: MotorStatus = MotorStatus.IDLE
    esp32_status: ESP32ConnectionStatus = ESP32ConnectionStatus.ONLINE
    last_command: Optional[BridgeCommand] = None
    last_acknowledgement: Optional[datetime] = None
    emergency_status: bool = False
    lock_engaged: bool = False
    pedestrian_crossing_active: bool = True
    active_threat_train: Optional[str] = None
    threat_distance_km: Optional[float] = None
    last_state_change: datetime = Field(default_factory=datetime.utcnow)

class ESP32Telemetry(BaseModel):
    device_id: str = "ESP32_OGL_BRIDGE_01"
    firmware_version: str = "v2.4.1-PROD"
    ip_address: str = "192.168.1.145"
    wifi_rssi_dbm: int = -58
    free_heap_kb: int = 184
    uptime_seconds: int = 86420
    position_pct: float = 100.0
    limit_switch_extended: bool = True
    limit_switch_retracted: bool = False
    motor_current_amps: float = 0.0
    supply_voltage: float = 24.1
    enclosure_temp_c: float = 34.5
    obstacle_detected_radar: bool = False
    emergency_button_depressed: bool = False
    connection_status: ESP32ConnectionStatus = ESP32ConnectionStatus.ONLINE
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)
