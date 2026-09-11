import React from 'react';
import { useApp } from '../context/AppContext';

export const FootbridgeDigitalTwin: React.FC = () => {
  const { bridgeStatus, simulatedTrainDistance } = useApp();

  const isTrainNearby = simulatedTrainDistance <= 2.0 && simulatedTrainDistance >= -0.8;
  const isTrainAtPlatform = simulatedTrainDistance <= 0.4 && simulatedTrainDistance >= -0.4;
  const posPct = bridgeStatus.position_pct;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Physical Digital Twin — Bridge Mechanism
          </h3>
          <p className="text-xs text-slate-400">
            Real-time motor position, limit sensors & track corridor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Signal:</span>
          {bridgeStatus.pedestrian_crossing_active ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              CROSSING OPEN
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950 text-red-300 border border-red-700 flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              CROSSING STOPPED
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas Schematic */}
      <div className="relative w-full h-64 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden my-4 flex items-center justify-center">
        {/* Overhead Electrification (OHE) Wire */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-yellow-500/30 border-t border-dashed border-yellow-400/60 z-0"></div>
        <div className="absolute top-3 left-1/4 text-[9px] text-yellow-500/70 font-mono">25kV AC OHE CATENARY</div>

        {/* Platform 1 (Platform A) - Left side */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-slate-800/90 border-r-4 border-amber-500/80 z-10 flex flex-col justify-between p-3">
          <div>
            <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">PLATFORM 1</div>
            <div className="text-[10px] text-slate-400">Main Building Side</div>
            <div className="text-[9px] text-slate-400 mt-1">Up Line (To MAS)</div>
          </div>

          {/* Motor Actuator Housing */}
          <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-center">
            <div className="text-[9px] font-bold text-blue-400">ESP32 ACTUATOR</div>
            <div className="text-[8px] text-slate-400">Linear Rack Drive</div>
          </div>

          {/* Platform 1 Signal Light */}
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 ${
              bridgeStatus.pedestrian_crossing_active
                ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/50'
                : 'bg-red-500 border-red-300 shadow-lg shadow-red-500/50 animate-pulse'
            }`}></div>
            <span className="text-[10px] font-bold text-slate-300">
              {bridgeStatus.pedestrian_crossing_active ? 'WALK' : 'WAIT'}
            </span>
          </div>
        </div>

        {/* Platform 2 (Platform B) - Right side */}
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-slate-800/90 border-l-4 border-amber-500/80 z-10 flex flex-col justify-between p-3 text-right">
          <div>
            <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">PLATFORM 2</div>
            <div className="text-[10px] text-slate-400">Island Platform</div>
            <div className="text-[9px] text-slate-400 mt-1">Down Line (To BZA)</div>
          </div>

          {/* Docking Latch */}
          <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-center">
            <div className="text-[9px] font-bold text-emerald-400">RECEIVING DOCK</div>
            <div className="text-[8px] text-slate-400">Electromagnetic Lock</div>
          </div>

          {/* Platform 2 Signal Light */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] font-bold text-slate-300">
              {bridgeStatus.pedestrian_crossing_active ? 'WALK' : 'WAIT'}
            </span>
            <div className={`w-4 h-4 rounded-full border-2 ${
              bridgeStatus.pedestrian_crossing_active
                ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/50'
                : 'bg-red-500 border-red-300 shadow-lg shadow-red-500/50 animate-pulse'
            }`}></div>
          </div>
        </div>

        {/* Central Railway Track Bed */}
        <div className="absolute left-28 right-28 top-0 bottom-0 bg-stone-900 flex justify-around px-8 items-center z-5">
          {/* Railway Sleepers and Rails (Track 1) */}
          <div className="relative w-12 h-full flex flex-col justify-around py-1">
            {/* Sleepers */}
            {[...Array(12)].map((_, i) => (
              <div key={`s1-${i}`} className="w-full h-1 bg-stone-700 rounded-sm"></div>
            ))}
            {/* Steel Rails */}
            <div className="absolute top-0 bottom-0 left-2 w-1 bg-slate-400 shadow"></div>
            <div className="absolute top-0 bottom-0 right-2 w-1 bg-slate-400 shadow"></div>
            <span className="absolute bottom-2 left-0 right-0 text-[8px] text-center font-mono text-slate-400">TRACK 1</span>
          </div>

          {/* Railway Sleepers and Rails (Track 2) */}
          <div className="relative w-12 h-full flex flex-col justify-around py-1">
            {/* Sleepers */}
            {[...Array(12)].map((_, i) => (
              <div key={`s2-${i}`} className="w-full h-1 bg-stone-700 rounded-sm"></div>
            ))}
            {/* Steel Rails */}
            <div className="absolute top-0 bottom-0 left-2 w-1 bg-slate-400 shadow"></div>
            <div className="absolute top-0 bottom-0 right-2 w-1 bg-slate-400 shadow"></div>
            <span className="absolute bottom-2 left-0 right-0 text-[8px] text-center font-mono text-slate-400">TRACK 2</span>
          </div>

          {/* Animated Train Moving through Station if nearby */}
          {isTrainNearby && (
            <div
              className={`absolute w-14 rounded-lg bg-blue-700 border-2 border-amber-400 shadow-2xl z-15 flex flex-col items-center justify-center p-1 transition-all duration-700 ${
                isTrainAtPlatform ? 'top-16 shadow-red-500/80 animate-pulse' : 'top-2'
              }`}
              style={{ left: '55%' }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-300 shadow-sm shadow-amber-300 mb-0.5"></div>
              <span className="text-[8px] font-black text-white font-mono leading-none">12711</span>
              <span className="text-[7px] text-amber-300 font-bold leading-none">PINAKINI</span>
            </div>
          )}
        </div>

        {/* Retractable Footbridge Span (Moving Deck) */}
        <div
          className="absolute h-14 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 border-y-2 border-blue-400 z-20 transition-all duration-300 rounded shadow-2xl flex items-center justify-center"
          style={{
            left: '112px', // Right after Platform 1 edge
            width: `${((window.innerWidth > 640 ? 300 : 180) * posPct) / 100}px`,
            maxWidth: 'calc(100% - 224px)'
          }}
        >
          {/* Bridge Walkway Texture & Safety Railings */}
          <div className="w-full h-full flex flex-col justify-between p-1 bg-blue-950/40">
            <div className="w-full border-t border-dashed border-blue-300/60"></div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-blue-100 tracking-wider">
                {posPct === 100
                  ? 'FOOTBRIDGE EXTENDED'
                  : posPct === 0
                  ? 'RETRACTED'
                  : `RETRACTING ${posPct}%`}
              </span>
            </div>
            <div className="w-full border-b border-dashed border-blue-300/60"></div>
          </div>
        </div>
      </div>

      {/* Sensor and Motor Status Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Platform Limit LS1 (Retracted)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Island Limit LS2 (Extended)
          </span>
        </div>
        <div className="text-slate-300 font-mono text-[10px]">
          Linear Drive: {bridgeStatus.motor_status} ({posPct}%)
        </div>
      </div>
    </div>
  );
};
