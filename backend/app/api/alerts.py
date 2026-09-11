"""
Safety Alerts and Event Audit Trail REST API.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.alert import SafetyAlert, EventLogEntry
from ..services.safety_engine import safety_engine
from ..services.event_logger import event_logger

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Events"])

@router.get("", response_model=List[SafetyAlert])
async def get_alerts():
    """Get active safety alerts and alert history."""
    return safety_engine.get_all_alerts()

@router.get("/active", response_model=Optional[SafetyAlert])
async def get_active_alert():
    """Get currently active high-priority warning alert, if any."""
    return safety_engine.get_active_alert()

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, user_id: str = "OPERATOR"):
    """Staff acknowledgement of active safety alert."""
    safety_engine.acknowledge_active_alert(user_id)
    return {"status": "SUCCESS", "message": f"Alert {alert_id} acknowledged by {user_id}"}

@router.get("/events", response_model=List[EventLogEntry])
async def get_event_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity (INFO, WARNING, CRITICAL, FAULT)"),
    search: Optional[str] = Query(None, description="Search keyword in logs"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Retrieve audit trail of system events with filtering."""
    return event_logger.get_logs(event_type=event_type, severity=severity, search=search, limit=limit, offset=offset)
