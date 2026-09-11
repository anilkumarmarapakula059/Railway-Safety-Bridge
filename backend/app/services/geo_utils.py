"""
Geospatial calculation engine using the Haversine formula and bearing calculation
for accurate train-to-bridge distance and approach vector determination.
"""

import math

EARTH_RADIUS_KM = 6371.0088

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth
    using the Haversine formula. Result is in kilometers, rounded to 2 decimals.
    """
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = EARTH_RADIUS_KM * c
    return round(distance, 2)

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the initial bearing (compass heading in degrees) from point 1 to point 2.
    """
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    d_lon_r = math.radians(lon2 - lon1)
    
    y = math.sin(d_lon_r) * math.cos(lat2_r)
    x = (math.cos(lat1_r) * math.sin(lat2_r) -
         math.sin(lat1_r) * math.cos(lat2_r) * math.cos(d_lon_r))
    
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

def is_within_radius(current_lat: float, current_lon: float, target_lat: float, target_lon: float, radius_km: float) -> bool:
    """
    Check if a coordinate is strictly within a given radial distance from a target.
    """
    return calculate_haversine_distance(current_lat, current_lon, target_lat, target_lon) <= radius_km
