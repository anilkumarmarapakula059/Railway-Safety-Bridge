"""
Pydantic data models for trains, stations, routes, and tracking status.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class TrainType(str, Enum):
    PASSENGER = "Passenger / Local"
    EXPRESS = "Express"
    SUPERFAST = "Superfast Express"
    VANDE_BHARAT = "Vande Bharat Express"
    FREIGHT = "Freight / Goods"

class FreshnessStatus(str, Enum):
    LIVE = "LIVE"
    DELAYED = "DELAYED"
    STALE = "STALE"
    UNAVAILABLE = "UNAVAILABLE"

class Direction(str, Enum):
    UP = "UP"      # Towards Chennai Central
    DOWN = "DOWN"  # Towards Vijayawada / Howrah

class SafetyZone(str, Enum):
    SAFE = "SAFE"                  # Outside monitoring zone (> 10 km)
    APPROACHING = "APPROACHING"    # Inside advance monitoring zone (5 - 10 km)
    WARNING = "WARNING"            # Breached threshold (2km or 5km)
    CRITICAL_PASSING = "CRITICAL"  # Passing station track area (0 - 0.8 km)
    PASSED = "PASSED"              # Train cleared station safe zone

class StationHalt(BaseModel):
    station_code: str
    station_name: str
    arrival_time: str
    departure_time: str
    distance_km: float
    platform: Optional[str] = "1"
    halt_minutes: int = 2
    latitude: float
    longitude: float
    is_completed: bool = False
    is_current: bool = False

class Train(BaseModel):
    train_number: str
    train_name: str
    train_type: TrainType
    origin_station: str
    destination_station: str
    current_latitude: float
    current_longitude: float
    current_station: str
    previous_station: str
    next_station: str
    eta_ongole: str
    etd_ongole: str
    current_speed_kmh: float
    distance_from_bridge_km: float
    direction_of_travel: Direction
    platform_assigned: str = "Platform 1"
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    freshness_status: FreshnessStatus = FreshnessStatus.LIVE
    safety_zone: SafetyZone = SafetyZone.SAFE
    is_approaching: bool = False
    route: List[StationHalt] = []

class TrainSearchQuery(BaseModel):
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    from_station: Optional[str] = None
    to_station: Optional[str] = None
