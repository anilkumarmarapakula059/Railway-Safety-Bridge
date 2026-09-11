"""
Main FastAPI application for RAILSAFE - Automatic Footbridge Control System.
Ongole Railway Station, South Central Railway.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
from datetime import datetime

from .config import settings
from .api import auth, trains, bridge, alerts, system
from .services.safety_engine import safety_engine
from .services.bridge_controller import bridge_controller
from .services.train_tracker import train_tracker
from .websocket.hub import ws_hub

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("railsafe_app")

# Background task flag
_worker_running = True

async def safety_and_broadcast_worker():
    """Background worker that continuously evaluates safety thresholds and pushes live updates."""
    logger.info("Safety and real-time broadcast background worker started.")
    while _worker_running:
        try:
            # 1. Run safety cycle
            bridge_status, active_alert = await safety_engine.evaluate_safety_cycle()

            # 2. Build live dashboard payload
            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": datetime.utcnow().isoformat(),
                "bridge": bridge_status.dict(),
                "esp32": bridge_controller.get_telemetry().dict(),
                "trains": [t.dict() for t in train_tracker.get_all_trains()],
                "active_alert": active_alert.dict() if active_alert else None,
                "freshness": train_tracker.get_freshness_status().value
            }

            # 3. Broadcast to all active WebSocket clients
            await ws_hub.broadcast(payload)

        except Exception as e:
            logger.error(f"Error in safety worker loop: {e}", exc_info=True)

        await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _worker_running
    _worker_running = True
    task = asyncio.create_task(safety_and_broadcast_worker())
    yield
    _worker_running = False
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    logger.info("Background worker stopped.")

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Backend Safety Decision Engine & ESP32 IoT Controller for Ongole Railway Station Footbridge",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routers
app.include_router(auth.router)
app.include_router(trains.router)
app.include_router(bridge.router)
app.include_router(alerts.router)
app.include_router(system.router)

@app.get("/")
async def root():
    return {
        "system": "RAILSAFE - Automatic Retractable Footbridge Controller",
        "station": settings.station.station_name,
        "station_code": settings.station.station_code,
        "division": settings.station.division,
        "version": settings.version,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_hub.connect(websocket)
    try:
        while True:
            # Receive client ping or client commands
            data = await websocket.receive_text()
            # Send immediate ACK or heartbeat
            await websocket.send_text('{"type": "PONG", "status": "ALIVE"}')
    except WebSocketDisconnect:
        ws_hub.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_hub.disconnect(websocket)
