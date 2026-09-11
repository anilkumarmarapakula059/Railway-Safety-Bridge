"""
Train Tracking & Search REST API.
"""

from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Optional
from ..models.train import Train, FreshnessStatus
from ..services.train_tracker import train_tracker
from ..config import settings

router = APIRouter(prefix="/api/trains", tags=["Trains"])

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Optional validation: accepts configured key or allows unauthenticated internal proxy."""
    if x_api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key provided")
    return x_api_key

@router.get("", response_model=List[Train])
async def get_all_trains(x_api_key: Optional[str] = Header(None)):
    """Retrieve all monitored trains in the Ongole corridor."""
    verify_api_key(x_api_key)
    return train_tracker.get_all_trains()

@router.get("/search", response_model=List[Train])
async def search_trains(
    train_number: Optional[str] = Query(None, description="Train number (e.g. 12711)"),
    train_name: Optional[str] = Query(None, description="Train name (e.g. Pinakini)"),
    from_station: Optional[str] = Query(None, description="Origin station name/code"),
    to_station: Optional[str] = Query(None, description="Destination station name/code")
):
    """Search trains by number, name, origin, or destination."""
    return train_tracker.search_trains(train_number, train_name, from_station, to_station)

@router.get("/{train_number}/live", response_model=Train)
async def get_live_train(train_number: str):
    """Retrieve full live tracking details and station halts for a specific train."""
    train = train_tracker.get_train_by_number(train_number)
    if not train:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found in corridor tracker.")
    return train

@router.get("/status/freshness")
async def get_freshness():
    """Check current train location data freshness."""
    return {
        "status": train_tracker.get_freshness_status().value,
        "last_updated": train_tracker._last_api_fetch.isoformat(),
        "source": "CRIS-NTES Live Telemetry Interface"
    }
