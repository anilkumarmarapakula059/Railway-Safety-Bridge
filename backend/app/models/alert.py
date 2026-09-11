"""
Pydantic models for safety alerts, audit events, and system health status.
"""

from enum import Enum
from typing import Optional, List, Dict
from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    FAULT = "FAULT"

class EventType(str, Enum):
    TRAIN_DETECTED = "TRAIN_DETECTED"
    ZONE_ENTERED_5KM = "ZONE_ENTERED_5KM"
    ZONE_ENTERED_2KM = "ZONE_ENTERED_2KM"
    WARNING_GENERATED = "WARNING_GENERATED"
    CLOSURE_COMMAND_SENT = "CLOSURE_COMMAND_SENT"
    ESP32_ACK = "ESP32_ACK"
    CLOSING_STARTED = "CLOSING_STARTED"
    BRIDGE_CLOSED = "BRIDGE_CLOSED"
    TRAIN_PASSING_STATION = "TRAIN_PASSING_STATION"
    TRAIN_PASSED = "TRAIN_PASSED"
    REOPENING_AUTHORIZED = "REOPENING_AUTHORIZED"
    OPENING_STARTED = "OPENING_STARTED"
    BRIDGE_OPENED = "BRIDGE_OPENED"
    API_FAILURE = "API_FAILURE"
    ESP32_DISCONNECTED = "ESP32_DISCONNECTED"
    EMERGENCY_STOP = "EMERGENCY_STOP"
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE"
    OBSTACLE_DETECTED = "OBSTACLE_DETECTED"
    THRESHOLD_UPDATED = "THRESHOLD_UPDATED"

class SafetyAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: f"ALT-{uuid.uuid4().hex[:6].upper()}")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    severity: AlertSeverity
    title: str
    message: str
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    distance_km: Optional[float] = None
    threshold_km: Optional[float] = None
    action_taken: str
    bridge_state: str
    is_active: bool = True
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None

class EventLogEntry(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: EventType
    severity: AlertSeverity
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    distance_km: Optional[float] = None
    bridge_state: str
    command: Optional[str] = None
    result: str = "SUCCESS"
    details: str

class ComponentHealth(BaseModel):
    name: str
    status: str  # ONLINE, DEGRADED, OFFLINE
    latency_ms: Optional[int] = None
    last_communication: datetime = Field(default_factory=datetime.utcnow)
    details: str

class SystemHealthOverview(BaseModel):
    overall_status: str  # HEALTHY, WARNING, CRITICAL
    train_api: ComponentHealth
    backend_safety_engine: ComponentHealth
    database: ComponentHealth
    websocket_service: ComponentHealth
    esp32_controller: ComponentHealth
    bridge_actuators: ComponentHealth
    track_sensors: ComponentHealth
    optical_crossing_barrier: ComponentHealth
    active_connections_count: int = 1
    last_updated: datetime = Field(default_factory=datetime.utcnow)
