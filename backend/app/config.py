"""
System Configuration for RAILSAFE - Automatic Footbridge Control System
Ongole Railway Station (OGL), South Central Railway, India
"""

import os
from pydantic import BaseModel

class StationConfig(BaseModel):
    station_code: str = "OGL"
    station_name: str = "Ongole Railway Station"
    division: str = "Vijayawada (BZA)"
    zone: str = "South Central Railway (SCR)"
    # Real-world coordinates of Ongole Railway Station
    latitude: float = 15.5034
    longitude: float = 80.0505
    platform_a_name: str = "Platform 1 (Main Building Side)"
    platform_b_name: str = "Platform 2/3 (Island Platform)"
    track_direction_up: str = "Up Line (Towards Chennai Central)"
    track_direction_down: str = "Down Line (Towards Vijayawada / Howrah)"

class SafetyThresholds(BaseModel):
    # Proximity thresholds in kilometers
    passenger_local_km: float = 2.0
    express_superfast_km: float = 5.0
    freight_km: float = 6.0
    # Safe clearance buffer after train has crossed the station (km)
    train_cleared_buffer_km: float = 0.8
    # Stale data warning threshold in seconds
    stale_data_timeout_sec: int = 30
    # ESP32 heartbeat timeout in seconds
    esp32_timeout_sec: int = 5

class Settings(BaseModel):
    app_name: str = "RAILSAFE Footbridge Safety Controller"
    version: str = "1.0.0"
    debug: bool = True
    station: StationConfig = StationConfig()
    thresholds: SafetyThresholds = SafetyThresholds()
    secret_key: str = os.getenv("RAILSAFE_SECRET_KEY", "railsafe_secret_jwt_key_ongole_scr_2026")
    api_key: str = os.getenv("TRAIN_API_KEY", "rg_874fe1703f654373bd3fdef5840ad1ee")
    cors_origins: list[str] = ["*"]
    ws_broadcast_interval_ms: int = 1000

settings = Settings()
