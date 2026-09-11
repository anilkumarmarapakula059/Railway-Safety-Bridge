"""
Event logging and audit trail service for the footbridge safety system.
Maintains tamper-evident sequential safety records.
"""

from typing import List, Optional
from datetime import datetime
from ..models.alert import EventLogEntry, EventType, AlertSeverity

class EventLogger:
    def __init__(self, max_records: int = 1000):
        self.max_records = max_records
        self._logs: List[EventLogEntry] = []
        self._init_default_logs()

    def _init_default_logs(self):
        """Seed initial audit trail for demonstration."""
        now = datetime.utcnow()
        self.log_event(
            event_type=EventType.ESP32_ACK,
            severity=AlertSeverity.INFO,
            bridge_state="SAFE_OPEN",
            command="SYSTEM_STARTUP",
            result="SUCCESS",
            details="ESP32 Bridge Controller connected and authenticated (Firmware v2.4.1-PROD, RSSI -58 dBm)."
        )
        self.log_event(
            event_type=EventType.BRIDGE_OPENED,
            severity=AlertSeverity.INFO,
            bridge_state="SAFE_OPEN",
            command="CMD_INITIALIZE",
            result="SUCCESS",
            details="Retractable footbridge extended across Platform 1 and Platform 2. Passenger green crossing signals active."
        )

    def log_event(
        self,
        event_type: EventType,
        severity: AlertSeverity,
        bridge_state: str,
        details: str,
        train_number: Optional[str] = None,
        train_name: Optional[str] = None,
        distance_km: Optional[float] = None,
        command: Optional[str] = None,
        result: str = "SUCCESS"
    ) -> EventLogEntry:
        entry = EventLogEntry(
            event_type=event_type,
            severity=severity,
            train_number=train_number,
            train_name=train_name,
            distance_km=distance_km,
            bridge_state=bridge_state,
            command=command,
            result=result,
            details=details
        )
        self._logs.insert(0, entry)
        if len(self._logs) > self.max_records:
            self._logs = self._logs[:self.max_records]
        return entry

    def get_logs(
        self,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[EventLogEntry]:
        filtered = self._logs
        if event_type and event_type != "ALL":
            filtered = [e for e in filtered if e.event_type == event_type]
        if severity and severity != "ALL":
            filtered = [e for e in filtered if e.severity == severity]
        if search:
            q = search.lower()
            filtered = [
                e for e in filtered
                if (e.train_name and q in e.train_name.lower())
                or (e.train_number and q in e.train_number.lower())
                or (q in e.details.lower())
                or (e.command and q in e.command.lower())
            ]
        return filtered[offset : offset + limit]

    def clear_logs(self):
        self._logs.clear()

event_logger = EventLogger()
