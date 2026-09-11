import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ONGOLE_COORDINATES } from '../utils/geo';
import { MapPin, Navigation, Info } from 'lucide-react';

export const LeafletRailMap: React.FC = () => {
  const { trains, bridgeStatus } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    // Check if Leaflet is available on window or load dynamically
    if (!mapContainerRef.current) return;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(
          [ONGOLE_COORDINATES.lat, ONGOLE_COORDINATES.lng],
          12
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | South Central Railway'
        }).addTo(map);

        // 1. Station & Bridge Icon
        const bridgeIcon = L.divIcon({
          className: 'custom-bridge-icon',
          html: `
            <div style="background:#1e293b; border:2px solid ${bridgeStatus.position_pct === 100 ? '#10b981' : '#ef4444'}; border-radius:8px; padding:4px 8px; color:#fff; font-weight:bold; font-size:10px; display:flex; align-items:center; gap:4px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.5); width:max-content;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${bridgeStatus.position_pct === 100 ? '#10b981' : '#ef4444'};"></span>
              OGL Footbridge (${bridgeStatus.position_pct}%)
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        L.marker([ONGOLE_COORDINATES.lat, ONGOLE_COORDINATES.lng], { icon: bridgeIcon })
          .addTo(map)
          .bindPopup('<b>Ongole Railway Station (OGL)</b><br>Retractable Footbridge (Platform 1 to 2)');

        // 2. 2 km Local Train Safety Zone (Amber)
        const circle2km = L.circle([ONGOLE_COORDINATES.lat, ONGOLE_COORDINATES.lng], {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '6, 6',
          radius: 2000
        }).addTo(map);

        // 3. 5 km Express Train Safety Zone (Red)
        const circle5km = L.circle([ONGOLE_COORDINATES.lat, ONGOLE_COORDINATES.lng], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '8, 8',
          radius: 5000
        }).addTo(map);

        circlesRef.current = [circle2km, circle5km];
        mapInstanceRef.current = map;
      }

      // Update train markers
      const map = mapInstanceRef.current;
      trains.forEach((train) => {
        const isThreat = train.safety_zone === 'WARNING' || train.safety_zone === 'CRITICAL';
        const trainIcon = L.divIcon({
          className: 'custom-train-marker',
          html: `
            <div style="background:${isThreat ? '#ef4444' : '#2563eb'}; border:2px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:bold; box-shadow:0 0 10px ${isThreat ? 'rgba(239,68,68,0.8)' : 'rgba(37,99,235,0.6)'};">
              🚂
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        if (markersRef.current[train.train_number]) {
          markersRef.current[train.train_number].setLatLng([train.current_latitude, train.current_longitude]);
          markersRef.current[train.train_number].setIcon(trainIcon);
        } else {
          const m = L.marker([train.current_latitude, train.current_longitude], { icon: trainIcon }).addTo(map);
          m.bindPopup(`
            <b>${train.train_number} ${train.train_name}</b><br>
            Type: ${train.train_type}<br>
            Distance from Bridge: <b>${train.distance_from_bridge_km.toFixed(1)} km</b><br>
            Speed: ${train.current_speed_kmh} km/h<br>
            ETA: ${train.eta_ongole}
          `);
          markersRef.current[train.train_number] = m;
        }
      });
    };

    // If Leaflet script is already loaded
    if ((window as any).L) {
      initMap();
    } else {
      // Dynamically load Leaflet if not yet present
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, [trains, bridgeStatus]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Live Spatial Track & Safety Zones</h3>
            <p className="text-xs text-slate-400">Ongole Railway Corridor (15.5034° N, 80.0505° E)</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            2 km Zone (Local)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            5 km Zone (Express)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Live Train
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 sm:h-96 rounded-lg my-4 z-10 border border-slate-800"
        style={{ minHeight: '320px' }}
      ></div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          Geospatial distances calculated using high-precision Haversine algorithm
        </span>
        <span className="font-mono text-slate-400">Vijayawada Division • SCR</span>
      </div>
    </div>
  );
};
