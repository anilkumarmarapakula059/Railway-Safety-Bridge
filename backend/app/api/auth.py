"""
Authentication and Role-Based Access Control (RBAC) API.
Roles:
- PASSENGER: Read-only access to bridge status, train tracking, alerts.
- OPERATOR: Authorized to send bridge manual commands (with confirmation) and acknowledge alerts.
- ADMINISTRATOR: Full system access, threshold configuration, fault injection, logs.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "demo123"
    role: str = "PASSENGER"  # PASSENGER, OPERATOR, ADMINISTRATOR

class AuthUser(BaseModel):
    user_id: str
    username: str
    full_name: str
    role: str
    token: str
    badge_number: Optional[str] = None
    permissions: list[str]

ROLE_PERMISSIONS = {
    "PASSENGER": ["VIEW_DASHBOARD", "VIEW_TRAINS", "SEARCH_TRAINS", "VIEW_BRIDGE_STATUS"],
    "OPERATOR": [
        "VIEW_DASHBOARD", "VIEW_TRAINS", "SEARCH_TRAINS", "VIEW_BRIDGE_STATUS",
        "MANUAL_BRIDGE_CONTROL", "ACKNOWLEDGE_ALERTS", "VIEW_AUDIT_LOGS", "VIEW_ESP32_TELEMETRY"
    ],
    "ADMINISTRATOR": [
        "VIEW_DASHBOARD", "VIEW_TRAINS", "SEARCH_TRAINS", "VIEW_BRIDGE_STATUS",
        "MANUAL_BRIDGE_CONTROL", "ACKNOWLEDGE_ALERTS", "VIEW_AUDIT_LOGS", "VIEW_ESP32_TELEMETRY",
        "CONFIGURE_THRESHOLDS", "INJECT_SIMULATION_FAULTS", "MANAGE_STATION_SETTINGS"
    ]
}

@router.post("/login", response_model=AuthUser)
async def login(req: LoginRequest):
    role = req.role.upper()
    if role not in ROLE_PERMISSIONS:
        role = "PASSENGER"

    token = f"jwt_sim_{role.lower()}_{datetime.utcnow().timestamp()}"

    role_names = {
        "PASSENGER": "Public Commuter",
        "OPERATOR": "Station Master - Ongole",
        "ADMINISTRATOR": "Divisional Safety Officer (BZA)"
    }

    badge_numbers = {
        "PASSENGER": "N/A",
        "OPERATOR": "SM-OGL-4819",
        "ADMINISTRATOR": "DSO-SCR-9021"
    }

    return AuthUser(
        user_id=f"USR-{role[:3]}-01",
        username=req.username or role.lower(),
        full_name=role_names[role],
        role=role,
        token=token,
        badge_number=badge_numbers[role],
        permissions=ROLE_PERMISSIONS[role]
    )
