"""
Government Database Mock (VAHAN, eGujCop, SARTHI, NAFIS)
Simulates law enforcement watchlist records for stolen vehicles, wanted criminals, and blacklisted license plates.
"""

from typing import Optional, Dict, Any

# Mock Law Enforcement Watchlist Records
WATCHLIST_RECORDS: Dict[str, Dict[str, Any]] = {
    "GJ01AB1234": {
        "plate_number": "GJ01AB1234",
        "category": "STOLEN_VEHICLE",
        "vehicle_model": "White Maruti Swift",
        "owner": "Ramesh Patel",
        "fir_number": "FIR-2026-90412 (eGujCop)",
        "severity": "CRITICAL",
        "status": "WANTED",
        "notes": "Stolen from Gandhinagar Sector 16 on 01-Sept-2026. Suspect armed."
    },
    "GJ18CD5678": {
        "plate_number": "GJ18CD5678",
        "category": "WANTED_CRIMINAL_VEHICLE",
        "vehicle_model": "Black Hyundai Creta",
        "owner": "Unknown / Fake Reg",
        "fir_number": "FIR-2026-77810 (VAHAN Alert)",
        "severity": "HIGH",
        "status": "MONITOR",
        "notes": "Spotted near robbery scene in Ahmedabad."
    },
    "GJ05EF9012": {
        "plate_number": "GJ05EF9012",
        "category": "MISSING_PERSON_LINK",
        "vehicle_model": "Silver Honda City",
        "owner": "Suresh Mehta",
        "fir_number": "FIR-2026-44120 (Missing Case)",
        "severity": "MEDIUM",
        "status": "SEARCH",
        "notes": "Vehicle linked to missing person report in Surat."
    }
}

def check_watchlist(plate_number: str) -> Optional[Dict[str, Any]]:
    """
    Cross-references detected license plate with mock Government Databases.
    Returns record if match found, else None.
    """
    clean_plate = plate_number.replace(" ", "").upper()
    return WATCHLIST_RECORDS.get(clean_plate)
