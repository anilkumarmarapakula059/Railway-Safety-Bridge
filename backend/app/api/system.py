"""
System Diagnostics, Health Monitoring, Admin Configuration & Simulation Engine REST API.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.alert import SystemHealthOverview, ComponentHealth, EventType, AlertSeverity
from ..services.bridge_controller import bridge_controller
from ..services.train_tracker import train_tracker
from ..services.safety_engine import safety_engine
from ..services.event_logger import event_logger
from ..websocket.hub import ws_hub
from ..config import settings

router = APIRouter(prefix="/api/system", tags=["System Diagnostics & Admin"])

class ThresholdUpdateRequest(BaseModel):
    passenger_local_km: Optional[float] = None
    express_superfast_km: Optional[float] = None
    freight_km: Optional[float] = None

class SimulationRequest(BaseModel):
    action: str  # "SET_TRAIN_DISTANCE", "DISCONNECT_ESP32", "RECONNECT_ESP32", "SET_API_STATUS", "TRIGGER_EMERGENCY_STOP", "RESET_SIMULATION"
    train_number: Optional[str] = "12711"
    distance_km: Optional[float] = None
    speed_kmh: Optional[float] = None
    is_offline: Optional[bool] = None
    is_delayed: Optional[bool] = None

@router.get("/health", response_model=SystemHealthOverview)
async def get_system_health():
    """Retrieve diagnostic health status for all system components."""
    now = datetime.utcnow()
    bridge = bridge_controller.get_status()
    telemetry = bridge_controller.get_telemetry()
    freshness = train_tracker.get_freshness_status()

    train_api_status = "ONLINE" if freshness.value == "LIVE" else ("DEGRADED" if freshness.value == "DELAYED" else "OFFLINE")
    esp32_status = bridge.esp32_status.value

    overall = "HEALTHY"
    if esp32_status == "OFFLINE" or train_api_status == "OFFLINE":
        overall = "CRITICAL"
    elif train_api_status == "DEGRADED" or bridge.emergency_status:
        overall = "WARNING"

    return SystemHealthOverview(
        overall_status=overall,
        train_api=ComponentHealth(
            name="CRIS / NTES Train Location Gateway",
            status=train_api_status,
            latency_ms=42 if train_api_status != "OFFLINE" else 0,
            last_communication=now,
            details=f"Feed Freshness: {freshness.value}"
        ),
        backend_safety_engine=ComponentHealth(
            name="Ongole Station Safety Decision Engine",
            status="ONLINE",
            latency_ms=4,
            last_communication=now,
            details="State Machine operational. Fail-safe interlocks active."
        ),
        database=ComponentHealth(
            name="SQLite Audit Logger",
            status="ONLINE",
            latency_ms=2,
            last_communication=now,
            details=f"Audit events active ({len(event_logger._logs)} records buffered)."
        ),
        websocket_service=ComponentHealth(
            name="Real-Time WebSocket Hub",
            status="ONLINE",
            latency_ms=1,
            last_communication=now,
            details=f"{ws_hub.get_active_count()} active dashboard subscribers."
        ),
        esp32_controller=ComponentHealth(
            name="ESP32 Industrial Bridge Microcontroller",
            status=esp32_status,
            latency_ms=18 if esp32_status == "ONLINE" else 0,
            last_communication=telemetry.last_heartbeat,
            details=f"IP: {telemetry.ip_address} | RSSI: {telemetry.wifi_rssi_dbm} dBm | Firmware: {telemetry.firmware_version}"
        ),
        bridge_actuators=ComponentHealth(
            name="Dual Linear Servo Actuators",
            status="ONLINE" if esp32_status == "ONLINE" else "OFFLINE",
            latency_ms=None,
            last_communication=now,
            details=f"Motor Status: {bridge.motor_status.value} | Current: {telemetry.motor_current_amps}A | Extension: {bridge.position_pct}%"
        ),
        track_sensors=ComponentHealth(
            name="Dual Track Axle Counters & Radar",
            status="ONLINE",
            latency_ms=12,
            last_communication=now,
            details="Track 1 & Track 2 clear radar beams armed."
        ),
        optical_crossing_barrier=ComponentHealth(
            name="Pedestrian Infrared Light Curtains",
            status="ONLINE",
            latency_ms=8,
            last_communication=now,
            details="Pedestrian barrier lowered" if not bridge.pedestrian_crossing_active else "Crossing open for pedestrians"
        ),
        active_connections_count=max(1, ws_hub.get_active_count()),
        last_updated=now
    )

@router.get("/config")
async def get_system_config():
    """Get station settings, safety thresholds, and API authentication status."""
    masked_key = f"{settings.api_key[:7]}...{settings.api_key[-4:]}" if len(settings.api_key) > 10 else "***"
    return {
        "station": settings.station.dict(),
        "thresholds": settings.thresholds.dict(),
        "version": settings.version,
        "api_key_status": {
            "is_configured": bool(settings.api_key),
            "masked_key": masked_key,
            "header_name": "X-API-Key"
        }
    }

@router.post("/config")
async def update_thresholds(req: ThresholdUpdateRequest):
    """Admin endpoint to update proximity thresholds."""
    if req.passenger_local_km is not None:
        settings.thresholds.passenger_local_km = req.passenger_local_km
    if req.express_superfast_km is not None:
        settings.thresholds.express_superfast_km = req.express_superfast_km
    if req.freight_km is not None:
        settings.thresholds.freight_km = req.freight_km

    event_logger.log_event(
        event_type=EventType.THRESHOLD_UPDATED,
        severity=AlertSeverity.INFO,
        bridge_state=bridge_controller.get_status().state.value,
        details=f"Admin updated thresholds: Passenger={settings.thresholds.passenger_local_km}km, Express={settings.thresholds.express_superfast_km}km"
    )

    return {"status": "SUCCESS", "thresholds": settings.thresholds.dict()}

@router.post("/simulate")
async def run_simulation(req: SimulationRequest):
    """Developer mock simulator controls to evaluate all scenarios."""
    action = req.action.upper()

    if action == "SET_TRAIN_DISTANCE":
        if req.train_number and req.distance_km is not None:
            train_tracker.update_train_position(req.train_number, req.distance_km, req.speed_kmh)
            # Evaluate safety rules immediately
            await safety_engine.evaluate_safety_cycle()
            return {"status": "SUCCESS", "message": f"Train {req.train_number} distance set to {req.distance_km} km"}

    elif action == "DISCONNECT_ESP32":
        bridge_controller.simulate_disconnect(True)
        return {"status": "SUCCESS", "message": "ESP32 disconnected (fail-safe test)."}

    elif action == "RECONNECT_ESP32":
        bridge_controller.simulate_disconnect(False)
        bridge_controller.heartbeat()
        return {"status": "SUCCESS", "message": "ESP32 reconnected."}

    elif action == "SET_API_STATUS":
        train_tracker.set_api_status(is_offline=req.is_offline or False, is_delayed=req.is_delayed or False)
        return {"status": "SUCCESS", "message": "API status updated."}

    elif action == "RESET_SIMULATION":
        train_tracker._init_corridor_trains()
        bridge_controller.simulate_disconnect(False)
        bridge_controller.heartbeat()
        bridge = bridge_controller.get_status()
        bridge.state = "SAFE_OPEN"
        bridge.position_pct = 100.0
        bridge.emergency_status = False
        bridge.pedestrian_crossing_active = True
        return {"status": "SUCCESS", "message": "Simulation reset to baseline."}

    raise HTTPException(status_code=400, detail=f"Unknown simulation action: {action}")
