"""
Bridge Control & IoT Hardware Telemetry REST API.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from ..models.bridge import (
    BridgeStatus, BridgeCommand, BridgeCommandType, CommandSource, AckStatus, ESP32Telemetry
)
from ..services.bridge_controller import bridge_controller
from ..services.safety_engine import safety_engine

router = APIRouter(prefix="/api/bridge", tags=["Bridge Controller"])

class CommandRequest(BaseModel):
    command: BridgeCommandType
    user_role: str = "OPERATOR"
    user_id: Optional[str] = "OP-OGL-01"
    force: bool = False
    confirmation_token: Optional[str] = None

@router.get("/status", response_model=BridgeStatus)
async def get_bridge_status():
    """Get current bridge state, extension position, motor status, and safety alerts."""
    return bridge_controller.get_status()

@router.get("/telemetry", response_model=ESP32Telemetry)
async def get_esp32_telemetry():
    """Get real-time low-level ESP32 actuator metrics, limit switch states, and voltages."""
    return bridge_controller.get_telemetry()

@router.post("/command", response_model=BridgeCommand)
async def dispatch_bridge_command(req: CommandRequest):
    """
    Dispatch manual staff command to retractable footbridge.
    Enforces fail-safe safety interlocks: rejects opening if a train is in danger threshold.
    """
    # 1. Validate authorization and safety interlock via SafetyEngine
    is_allowed, reason = await safety_engine.validate_manual_command(
        command_type=req.command,
        source=CommandSource.OPERATOR_MANUAL,
        user_role=req.user_role
    )

    if not is_allowed:
        raise HTTPException(status_code=403, detail=reason)

    # 2. Execute command via BridgeController
    cmd = await bridge_controller.execute_command(
        command_type=req.command,
        source=CommandSource.OPERATOR_MANUAL,
        authorization=f"{req.user_role}:{req.user_id}",
        force=req.force
    )

    return cmd

@router.post("/esp32/heartbeat")
async def esp32_heartbeat():
    """Hardware heartbeat endpoint called by physical ESP32."""
    bridge_controller.heartbeat()
    return {"status": "ACK", "server_time": "OK"}
