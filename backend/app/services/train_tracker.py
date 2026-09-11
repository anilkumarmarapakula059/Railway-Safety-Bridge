"""
Train tracking service for Ongole Railway Station corridor.
Maintains live train positions, calculates real-time distances via Haversine,
and tracks API freshness.
"""

from typing import List, Optional, Dict
from datetime import datetime, timedelta
import random
from ..models.train import Train, TrainType, FreshnessStatus, Direction, SafetyZone, StationHalt
from .geo_utils import calculate_haversine_distance, calculate_bearing
from ..config import settings

class TrainTrackerService:
    def __init__(self):
        self._trains: Dict[str, Train] = {}
        self._api_offline = False
        self._api_delayed = False
        self._last_api_fetch = datetime.utcnow()
        self._init_corridor_trains()

    def _init_corridor_trains(self):
        """Initialize realistic Indian Railways trains on Vijayawada - Chennai corridor passing Ongole."""
        station_lat = settings.station.latitude
        station_lon = settings.station.longitude

        # 1. 12711 Pinakini Express (Approaching Ongole from Singarayakonda - South/Up line)
        pinakini_route = [
            StationHalt(station_code="MAS", station_name="Chennai Central", arrival_time="14:10", departure_time="14:10", distance_km=0.0, latitude=13.0827, longitude=80.2707, is_completed=True),
            StationHalt(station_code="GDR", station_name="Gudur Jn", arrival_time="16:18", departure_time="16:20", distance_km=138.0, latitude=14.1463, longitude=79.8504, is_completed=True),
            StationHalt(station_code="NLR", station_name="Nellore", arrival_time="16:48", departure_time="16:50", distance_km=176.0, latitude=14.4426, longitude=79.9865, is_completed=True),
            StationHalt(station_code="SKM", station_name="Singarayakonda", arrival_time="17:48", departure_time="17:50", distance_km=255.0, latitude=15.2500, longitude=80.0300, is_completed=True, is_current=True),
            StationHalt(station_code="OGL", station_name="Ongole", arrival_time="18:18", departure_time="18:20", distance_km=292.0, platform="1", latitude=station_lat, longitude=station_lon),
            StationHalt(station_code="CLX", station_name="Chirala", arrival_time="18:58", departure_time="19:00", distance_km=342.0, latitude=15.8246, longitude=80.3521),
            StationHalt(station_code="BPP", station_name="Bapatla", arrival_time="19:13", departure_time="19:15", distance_km=357.0, latitude=15.9042, longitude=80.4674),
            StationHalt(station_code="TEL", station_name="Tenali Jn", arrival_time="19:53", departure_time="19:55", distance_km=400.0, latitude=16.2436, longitude=80.6401),
            StationHalt(station_code="BZA", station_name="Vijayawada Jn", arrival_time="20:45", departure_time="20:45", distance_km=431.0, latitude=16.5186, longitude=80.6200)
        ]

        # Initial coords ~4.2 km south of Ongole
        pinakini_lat = 15.4660
        pinakini_lon = 80.0460
        pinakini_dist = calculate_haversine_distance(pinakini_lat, pinakini_lon, station_lat, station_lon)

        self._trains["12711"] = Train(
            train_number="12711",
            train_name="Pinakini Express",
            train_type=TrainType.EXPRESS,
            origin_station="Chennai Central (MAS)",
            destination_station="Vijayawada Jn (BZA)",
            current_latitude=pinakini_lat,
            current_longitude=pinakini_lon,
            current_station="Singarayakonda (SKM)",
            previous_station="Nellore (NLR)",
            next_station="Ongole (OGL)",
            eta_ongole="18:18 IST",
            etd_ongole="18:20 IST",
            current_speed_kmh=88.0,
            distance_from_bridge_km=pinakini_dist,
            direction_of_travel=Direction.DOWN,
            platform_assigned="Platform 1",
            freshness_status=FreshnessStatus.LIVE,
            is_approaching=True,
            route=pinakini_route
        )

        # 2. 07576 Guntur - Tirupati Passenger (Local / Passenger) ~ 1.8 km North of Ongole
        passenger_route = [
            StationHalt(station_code="GNT", station_name="Guntur Jn", arrival_time="15:30", departure_time="15:30", distance_km=0.0, latitude=16.2997, longitude=80.4417, is_completed=True),
            StationHalt(station_code="CLX", station_name="Chirala", arrival_time="16:45", departure_time="16:47", distance_km=70.0, latitude=15.8246, longitude=80.3521, is_completed=True),
            StationHalt(station_code="ANB", station_name="Ammanabrolu", arrival_time="17:15", departure_time="17:16", distance_km=98.0, latitude=15.6200, longitude=80.1200, is_completed=True, is_current=True),
            StationHalt(station_code="OGL", station_name="Ongole", arrival_time="17:35", departure_time="17:40", distance_km=116.0, platform="2", latitude=station_lat, longitude=station_lon),
            StationHalt(station_code="SKM", station_name="Singarayakonda", arrival_time="18:10", departure_time="18:12", distance_km=145.0, latitude=15.2500, longitude=80.0300),
            StationHalt(station_code="TPTY", station_name="Tirupati", arrival_time="21:15", departure_time="21:15", distance_km=302.0, latitude=13.6288, longitude=79.4192)
        ]
        pass_lat = 15.5180
        pass_lon = 80.0540
        pass_dist = calculate_haversine_distance(pass_lat, pass_lon, station_lat, station_lon)

        self._trains["07576"] = Train(
            train_number="07576",
            train_name="GNT - TPTY Express Special",
            train_type=TrainType.PASSENGER,
            origin_station="Guntur Jn (GNT)",
            destination_station="Tirupati (TPTY)",
            current_latitude=pass_lat,
            current_longitude=pass_lon,
            current_station="Ammanabrolu (ANB)",
            previous_station="Chirala (CLX)",
            next_station="Ongole (OGL)",
            eta_ongole="17:35 IST",
            etd_ongole="17:40 IST",
            current_speed_kmh=42.0,
            distance_from_bridge_km=pass_dist,
            direction_of_travel=Direction.UP,
            platform_assigned="Platform 2",
            freshness_status=FreshnessStatus.LIVE,
            is_approaching=True,
            route=passenger_route
        )

        # 3. 20677 Vande Bharat Express (Superfast, further out ~ 18.5 km)
        vb_lat = 15.3400
        vb_lon = 80.0100
        vb_dist = calculate_haversine_distance(vb_lat, vb_lon, station_lat, station_lon)

        self._trains["20677"] = Train(
            train_number="20677",
            train_name="Chennai - Vijayawada Vande Bharat",
            train_type=TrainType.VANDE_BHARAT,
            origin_station="Chennai Central (MAS)",
            destination_station="Vijayawada Jn (BZA)",
            current_latitude=vb_lat,
            current_longitude=vb_lon,
            current_station="Kavali (KVZ)",
            previous_station="Nellore (NLR)",
            next_station="Ongole (OGL)",
            eta_ongole="18:45 IST",
            etd_ongole="18:47 IST",
            current_speed_kmh=120.0,
            distance_from_bridge_km=vb_dist,
            direction_of_travel=Direction.DOWN,
            platform_assigned="Platform 1",
            freshness_status=FreshnessStatus.LIVE,
            is_approaching=True,
            route=[]
        )

        # 4. 12604 Chennai Express (Superfast, ~ 34.0 km North)
        c_lat = 15.7800
        c_lon = 80.2900
        c_dist = calculate_haversine_distance(c_lat, c_lon, station_lat, station_lon)

        self._trains["12604"] = Train(
            train_number="12604",
            train_name="Chennai Express",
            train_type=TrainType.SUPERFAST,
            origin_station="Hyderabad (HYB)",
            destination_station="Chennai Central (MAS)",
            current_latitude=c_lat,
            current_longitude=c_lon,
            current_station="Bapatla (BPP)",
            previous_station="Tenali Jn (TEL)",
            next_station="Chirala (CLX)",
            eta_ongole="19:15 IST",
            etd_ongole="19:20 IST",
            current_speed_kmh=105.0,
            distance_from_bridge_km=c_dist,
            direction_of_travel=Direction.UP,
            platform_assigned="Platform 2",
            freshness_status=FreshnessStatus.LIVE,
            is_approaching=False,
            route=[]
        )

    def get_all_trains(self) -> List[Train]:
        return list(self._trains.values())

    def get_train_by_number(self, train_number: str) -> Optional[Train]:
        return self._trains.get(train_number)

    def search_trains(
        self,
        train_number: Optional[str] = None,
        train_name: Optional[str] = None,
        from_station: Optional[str] = None,
        to_station: Optional[str] = None
    ) -> List[Train]:
        results = list(self._trains.values())
        if train_number:
            results = [t for t in results if train_number.strip() in t.train_number]
        if train_name:
            results = [t for t in results if train_name.strip().lower() in t.train_name.lower()]
        if from_station:
            results = [t for t in results if from_station.strip().lower() in t.origin_station.lower()]
        if to_station:
            results = [t for t in results if to_station.strip().lower() in t.destination_station.lower()]
        return results

    def update_train_position(self, train_number: str, distance_km: float, speed_kmh: Optional[float] = None):
        """Update train distance directly (used by developer simulation panel)."""
        train = self._trains.get(train_number)
        if not train:
            return

        station_lat = settings.station.latitude
        station_lon = settings.station.longitude
        train.distance_from_bridge_km = round(distance_km, 2)
        if speed_kmh is not None:
            train.current_speed_kmh = speed_kmh

        # Update synthetic coordinates along the corridor line
        # Vijayawada-Chennai line at Ongole runs approximately SSW to NNE (bearing ~25 deg)
        lat_offset = (distance_km / 111.0) * (-1.0 if train.direction_of_travel == Direction.DOWN else 1.0)
        lon_offset = (distance_km / 111.0) * 0.15 * (-1.0 if train.direction_of_travel == Direction.DOWN else 1.0)
        train.current_latitude = round(station_lat + lat_offset, 5)
        train.current_longitude = round(station_lon + lon_offset, 5)

        # Update ETA dynamically
        if train.current_speed_kmh > 0 and distance_km > 0:
            eta_mins = round((distance_km / train.current_speed_kmh) * 60)
            train.eta_ongole = f"In {eta_mins} min" if eta_mins > 0 else "Arriving now"
        elif distance_km <= 0:
            train.eta_ongole = "At Platform"

        train.last_updated = datetime.utcnow()

    def set_api_status(self, is_offline: bool = False, is_delayed: bool = False):
        self._api_offline = is_offline
        self._api_delayed = is_delayed
        status = FreshnessStatus.UNAVAILABLE if is_offline else (FreshnessStatus.DELAYED if is_delayed else FreshnessStatus.LIVE)
        for t in self._trains.values():
            t.freshness_status = status

    def get_freshness_status(self) -> FreshnessStatus:
        if self._api_offline:
            return FreshnessStatus.UNAVAILABLE
        if self._api_delayed:
            return FreshnessStatus.DELAYED
        return FreshnessStatus.LIVE

train_tracker = TrainTrackerService()
