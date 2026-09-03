"""
ANPR & Vehicle Trajectory Tracking Engine
Fulfills the Hackathon Evaluation Test Case:
Given a vehicle registration number, tracks movement across camera locations,
stores timestamped hits, and cross-references against Government watchlists.
"""

import time
from datetime import datetime
from typing import List, Dict, Any
from watchlist_db import check_watchlist

# In-memory storage for vehicle movement history across cameras
# (Acts as spatial/temporal detection database)
DETECTION_HISTORY: List[Dict[str, Any]] = []

def record_detection(
    camera_id: str,
    location_name: str,
    lat: float,
    lng: float,
    plate_number: str,
    vehicle_type: str = "Car",
    confidence: float = 0.95
) -> Dict[str, Any]:
    """
    Logs a vehicle detection event from a camera.
    Cross-references with mock Government DBs and returns alert info if matched.
    """
    timestamp = datetime.now().isoformat()
    clean_plate = plate_number.replace(" ", "").upper()

    detection_event = {
        "id": len(DETECTION_HISTORY) + 1,
        "camera_id": camera_id,
        "location_name": location_name,
        "lat": lat,
        "lng": lng,
        "plate_number": clean_plate,
        "vehicle_type": vehicle_type,
        "confidence": confidence,
        "timestamp": timestamp,
        "watchlist_match": check_watchlist(clean_plate)
    }

    DETECTION_HISTORY.append(detection_event)
    return detection_event

def get_vehicle_trajectory(plate_number: str) -> Dict[str, Any]:
    """
    EVALUATION TEST CASE ENDPOINT:
    Takes a vehicle registration number (e.g. 'GJ01AB1234') and returns
    its full chronological movement history & GIS route points across cameras.
    """
    clean_plate = plate_number.replace(" ", "").upper()
    
    # Filter all detections for this plate, sorted chronologically
    matches = [d for d in DETECTION_HISTORY if d["plate_number"] == clean_plate]
    matches.sort(key=lambda x: x["timestamp"])

    # Build GIS polyline coordinates array [ [lng, lat], ... ]
    route_coordinates = [[d["lng"], d["lat"]] for d in matches]

    return {
        "searched_plate": clean_plate,
        "total_detections": len(matches),
        "watchlist_info": check_watchlist(clean_plate),
        "trajectory_polyline": route_coordinates,
        "timeline": matches
    }
