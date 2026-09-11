"""
WebSocket Connection Manager and Real-Time Event Broadcaster.
Pushes real-time train positions, bridge transitions, and alerts to connected dashboards.
"""

from typing import List, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging
from datetime import datetime

logger = logging.getLogger("railsafe_ws")

class WebSocketHub:
    def __init__(self):
        self._active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self._active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self._active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active: {len(self._active_connections)}")

    async def broadcast(self, data: dict):
        """Broadcast payload to all connected clients."""
        if not self._active_connections:
            return

        message = json.dumps(data, default=str)
        dead_connections = set()

        for conn in self._active_connections:
            try:
                await conn.send_text(message)
            except Exception as e:
                logger.warning(f"Error sending message to websocket: {e}")
                dead_connections.add(conn)

        for dead in dead_connections:
            self._active_connections.discard(dead)

    def get_active_count(self) -> int:
        return len(self._active_connections)

ws_hub = WebSocketHub()
