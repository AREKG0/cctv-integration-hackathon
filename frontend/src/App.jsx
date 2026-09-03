import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Camera, AlertTriangle, Search, Navigation, Radio, CheckCircle, RefreshCw } from 'lucide-react';

// Custom Leaflet Camera Marker Icon
const cameraIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hitIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to re-center map smoothly when trajectory changes
function MapRecenter({ polyline }) {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline, map]);
  return null;
}

export default function App() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPlate, setSearchPlate] = useState('');
  const [trajectory, setTrajectory] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [alerts, setAlerts] = useState([]);

  const BACKEND_URL = 'http://localhost:8000';

  // 1. Fetch Dynamic Camera Catalogue on Load (/api/ingest)
  const loadCatalogue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ingest`);
      const data = await res.json();
      if (data.cameras) {
        setCameras(data.cameras);
      }
    } catch (err) {
      console.error("Catalogue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Watchlist Hit Alerts
  const loadAlerts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/alerts`);
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    }
  };

  useEffect(() => {
    loadCatalogue();
    loadAlerts();
  }, []);

  // 3. Search Vehicle Trajectory (Evaluation Test Endpoint)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchPlate.trim()) {
      setTrajectory(null);
      setSearchError('');
      return;
    }

    setSearchError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/track-vehicle/${searchPlate.trim()}`);
      if (!res.ok) {
        throw new Error(`No movement trajectory found for '${searchPlate}'`);
      }
      const data = await res.json();
      setTrajectory(data);
    } catch (err) {
      setSearchError(err.message);
      setTrajectory(null);
    }
  };

  // Format GIS Polyline points: convert [lng, lat] to [lat, lng] for Leaflet
  const polylineLatLngs = trajectory?.trajectory_polyline
    ? trajectory.trajectory_polyline.map(point => [point[1], point[0]])
    : [];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B132B] text-slate-100 font-sans overflow-hidden">
      
      {/* --- TOP COMMAND CENTER HEADER --- */}
      <header className="h-16 bg-[#1C2541] border-b border-slate-700/80 px-6 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              GUJARAT POLICE SENTINEL GRID
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                LIVE POC
              </span>
            </h1>
            <p className="text-xs text-slate-400">Unified CCTV Command & Control Platform — Gujarat Home Department</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B132B] border border-slate-700">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Catalogue API:</span>
            <span className="text-emerald-400 font-semibold">DYNAMIC OK</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B132B] border border-slate-700">
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Active Grid:</span>
            <span className="text-blue-400 font-semibold">{cameras.length} CAMERAS</span>
          </div>

          <button 
            onClick={loadCatalogue}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition"
            title="Refresh Catalogue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- MAIN DASHBOARD BODY --- */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        
        {/* --- LEFT SIDEBAR: VEHICLE TRACKER & ALERTS PANEL --- */}
        <div className="w-96 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
          
          {/* SEARCH & EVALUATION BOX */}
          <div className="bg-[#1C2541] border border-slate-700/80 rounded-xl p-4 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              VEHICLE TRAJECTORY TRACKER
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  placeholder="Enter Plate (e.g. GJ01AB1234)"
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shrink-0"
              >
                Trace Route
              </button>
            </form>

            {searchError && (
              <p className="mt-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/50">
                {searchError}
              </p>
            )}

            {trajectory && (
              <div className="mt-3 p-3 bg-[#0B132B] border border-slate-700/60 rounded-lg text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Searched Plate:</span>
                  <span className="text-amber-400 font-bold text-sm">{trajectory.searched_plate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Camera Hits:</span>
                  <span className="text-emerald-400 font-semibold">{trajectory.total_detections} Locations</span>
                </div>
              </div>
            )}
          </div>

          {/* WATCHLIST ALERT BANNER */}
          {trajectory?.watchlist_info && (
            <div className="bg-rose-950/50 border border-rose-600/80 rounded-xl p-4 shadow-xl animate-pulse">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                GOVT WATCHLIST MATCH DETECTED!
              </div>
              <div className="text-xs space-y-1 font-mono text-slate-200">
                <p><span className="text-slate-400">Category:</span> <span className="text-rose-400 font-bold">{trajectory.watchlist_info.category}</span></p>
                <p><span className="text-slate-400">Vehicle:</span> {trajectory.watchlist_info.vehicle_model}</p>
                <p><span className="text-slate-400">Record:</span> {trajectory.watchlist_info.fir_number}</p>
                <p className="text-slate-300 pt-1 text-[11px] leading-relaxed italic border-t border-rose-900/50 mt-2">
                  "{trajectory.watchlist_info.notes}"
                </p>
              </div>
            </div>
          )}

          {/* TIMELINE MOVEMENT HISTORY */}
          <div className="bg-[#1C2541] border border-slate-700/80 rounded-xl p-4 flex-1 flex flex-col overflow-hidden shadow-xl">
            <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>CHRONOLOGICAL MOVEMENT HISTORY</span>
              <span className="text-[10px] font-mono text-slate-400">PTS Timestamped</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {trajectory?.timeline?.map((item, idx) => (
                <div key={item.id} className="p-3 bg-[#0B132B] border border-slate-700/70 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-1">
                    <span className="text-blue-400 font-semibold">Hit #{idx + 1} — {item.camera_id}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{item.location_name}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Type: {item.vehicle_type}</span>
                    <span className="text-emerald-400">Conf: {(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: INTERACTIVE LEAFLET GIS MAP --- */}
        <div className="flex-1 bg-[#1C2541] border border-slate-700/80 rounded-xl overflow-hidden flex flex-col shadow-xl">
          <div className="h-10 px-4 bg-[#141C33] border-b border-slate-700/80 flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              GUJARAT STATEWIDE GIS MAP VIEW
            </span>
            <span className="text-slate-400">Leaflet OpenLayers Layer</span>
          </div>

          <div className="flex-1 relative">
            <MapContainer
              center={[22.2587, 71.1924]}
              zoom={7}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Recenter helper */}
              <MapRecenter polyline={polylineLatLngs} />

              {/* Plot Camera Markers */}
              {cameras.map(cam => (
                <Marker
                  key={cam.id}
                  position={[cam.latitude, cam.longitude]}
                  icon={cameraIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1 font-mono p-1">
                      <p className="font-bold text-blue-400 text-sm">{cam.id} — {cam.department}</p>
                      <p className="text-slate-200">{cam.location_name}</p>
                      <p className="text-slate-400">Codec: <span className="text-emerald-400">{cam.codec.toUpperCase()}</span> | {cam.resolution}</p>
                      <p className="text-slate-400">Status: <span className="text-emerald-400">{cam.live_status.toUpperCase()}</span></p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Plot Animated Red Trajectory Polyline */}
              {polylineLatLngs.length > 0 && (
                <>
                  <Polyline
                    positions={polylineLatLngs}
                    color="#EF476F"
                    weight={4}
                    dashArray="8, 8"
                  />
                  {polylineLatLngs.map((pos, idx) => (
                    <Marker key={idx} position={pos} icon={hitIcon}>
                      <Popup>
                        <div className="text-xs font-mono p-1">
                          <p className="font-bold text-rose-400">Trajectory Hit #{idx + 1}</p>
                          <p className="text-slate-200">Plate: {trajectory.searched_plate}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
