"""
Resilient Stream Ingester & Camera Catalogue Synchronizer
Follows all official rules from Gujarat Police Sentinel Integrator's Guide:
1. Forces RTSP over TCP
2. Uses Presentation Timestamps (PTS) instead of frame rate or system clock
3. Implements exponential backoff reconnection on stream interruptions
4. Supports mixed H.264/H.265 decoders & dynamic camera specs
"""

import os
import time
import requests
import cv2

# Rule #1: ALWAYS force RTSP over TCP transport mode
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

DEFAULT_CATALOGUE_URL = "http://localhost:8000/api/ingest"

def fetch_catalogue(catalogue_url=DEFAULT_CATALOGUE_URL):
    """Hits the dynamic catalogue endpoint to discover cameras."""
    try:
        response = requests.get(catalogue_url, timeout=5)
        response.raise_for_status()
        data = response.json()
        return data.get("cameras", [])
    except Exception as e:
        print(f"[Error] Failed to read camera catalogue from {catalogue_url}: {e}")
        return []

def run_camera_worker(camera_info):
    """
    Worker function to continuously ingest frames from a single camera.
    Handles reconnects with exponential backoff.
    """
    cam_id = camera_info.get("id")
    location = camera_info.get("location_name")
    rtsp_url = camera_info.get("rtsp_url")
    codec = camera_info.get("codec", "h264")

    print(f"[*] Worker started for Camera [{cam_id}] - {location} ({codec})")

    backoff = 2  # Start backoff at 2 seconds
    max_backoff = 30  # Cap at 30 seconds

    while True:
        print(f"[*] Connecting to {rtsp_url}...")
        cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)

        if not cap.isOpened():
            print(f"[Warning] Unable to connect to Cam [{cam_id}]. Retrying in {backoff}s...")
            time.sleep(backoff)
            backoff = min(backoff * 2, max_backoff)
            continue

        # Reset backoff upon clean connection
        backoff = 2
        print(f"[Success] Stream connected for Cam [{cam_id}]!")

        while True:
            ok, frame = cap.read()
            if not ok:
                print(f"[Disconnection] Cam [{cam_id}] stream cut. Reconnecting in {backoff}s...")
                break

            # Rule #2: Extract Presentation Timestamp (PTS) in milliseconds
            pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)

            # Frame processed cleanly
            # In Step 2, we will send this frame to our AI License Plate Reader!
            
        cap.release()
        time.sleep(backoff)
        backoff = min(backoff * 2, max_backoff)

if __name__ == "__main__":
    cameras = fetch_catalogue()
    print(f"Discovered {len(cameras)} cameras from catalogue!")
    for cam in cameras:
        print(f" - [{cam['id']}] {cam['location_name']} | Codec: {cam['codec']} | Status: {cam['live_status']}")
