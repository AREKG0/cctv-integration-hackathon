"""
Mock Camera Catalogue Server for Gujarat Police Sentinel Hackathon 2026
This server simulates the official endpoint: GET http://<host>/api/ingest
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

app = FastAPI(
    title="Sentinel Camera Grid — Mock Ingest Catalogue",
    description="Simulates the official Gujarat Police CCTV Catalogue API",
    version="1.0.0"
)

# Enable CORS so our React Frontend can call this API without browser blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Practice Dataset: 5 Cameras placed across Gujarat Cities (Gandhinagar, Ahmedabad, Surat, Rajkot, Vadodara)
MOCK_CAMERAS: List[Dict[str, Any]] = [
    {
        "id": "cam-01",
        "department": "Home Department (Police)",
        "location_name": "Sector 18 Circle, Gandhinagar",
        "latitude": 23.2230,
        "longitude": 72.6500,
        "codec": "h264",
        "resolution": "1920x1080",
        "fps": 25,
        "live_status": "online",
        "rtsp_url": "rtsp://localhost:8554/stream/1",
        "whep_url": "http://localhost:8889/stream/1/whep",
        "hls_url": "http://localhost:8080/live/stream/1/index.m3u8"
    },
    {
        "id": "cam-02",
        "department": "Transport Department (RTO)",
        "location_name": "SG Highway Junction, Ahmedabad",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "codec": "h264",
        "resolution": "1920x1080",
        "fps": 30,
        "live_status": "online",
        "rtsp_url": "rtsp://localhost:8554/stream/2",
        "whep_url": "http://localhost:8889/stream/2/whep",
        "hls_url": "http://localhost:8080/live/stream/2/index.m3u8"
    },
    {
        "id": "cam-03",
        "department": "Municipal Corporation",
        "location_name": "Ring Road Checkpost, Surat",
        "latitude": 21.1702,
        "longitude": 72.8311,
        "codec": "h265",
        "resolution": "2560x1440",
        "fps": 25,
        "live_status": "online",
        "rtsp_url": "rtsp://localhost:8554/stream/3",
        "whep_url": "http://localhost:8889/stream/3/whep",
        "hls_url": "http://localhost:8080/live/stream/3/index.m3u8"
    },
    {
        "id": "cam-04",
        "department": "Civil Supplies Department",
        "location_name": "State Highway 81, Vadodara",
        "latitude": 22.3072,
        "longitude": 73.1812,
        "codec": "h264",
        "resolution": "1280x720",
        "fps": 20,
        "live_status": "online",
        "rtsp_url": "rtsp://localhost:8554/stream/4",
        "whep_url": "http://localhost:8889/stream/4/whep",
        "hls_url": "http://localhost:8080/live/stream/4/index.m3u8"
    },
    {
        "id": "cam-05",
        "department": "Home Department (Police)",
        "location_name": "Kala Nala Junction, Bhavnagar",
        "latitude": 21.7645,
        "longitude": 72.1519,
        "codec": "h265",
        "resolution": "1920x1080",
        "fps": 25,
        "live_status": "online",
        "rtsp_url": "rtsp://localhost:8554/stream/5",
        "whep_url": "http://localhost:8889/stream/5/whep",
        "hls_url": "http://localhost:8080/live/stream/5/index.m3u8"
    }
]

@app.get("/api/ingest")
def get_camera_catalogue():
    """
    Returns the dynamic camera catalogue list.
    Matching official contract: http://<host>/api/ingest
    """
    return {
        "status": "success",
        "total_cameras": len(MOCK_CAMERAS),
        "cameras": MOCK_CAMERAS
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Mock Sentinel Server is running smoothly!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
