import React from 'react';
import { useApp } from '../context/AppContext';
import { TrainTrack, ArrowLeft, Clock, Gauge, MapPin, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';

interface TrainDetailsViewProps {
  onBack: () => void;
}

export const TrainDetailsView: React.FC<TrainDetailsViewProps> = ({ onBack }) => {
  const { selectedTrain, simulatedTrainDistance } = useApp();

  const train = selectedTrain || {
    train_number: '12711',
    train_name: 'Pinakini Express',
    train_type: 'Express' as const,
    origin_station: 'Chennai Central (MAS)',
    destination_station: 'Vijayawada Jn (BZA)',
    current_latitude: 15.466,
    current_longitude: 80.046,
    current_station: 'Singarayakonda (SKM)',
    previous_station: 'Nellore (NLR)',
    next_station: 'Ongole (OGL)',
    eta_ongole: '18:18 IST',
    etd_ongole: '18:20 IST',
    current_speed_kmh: 88,
    distance_from_bridge_km: simulatedTrainDistance,
    direction_of_travel: 'DOWN' as const,
    platform_assigned: 'Platform 1',
    last_updated: new Date().toISOString(),
    freshness_status: 'LIVE' as const,
    safety_zone: simulatedTrainDistance <= 5.0 ? 'WARNING' as const : 'SAFE' as const,
    is_approaching: true,
    route: []
  };

  const isExpress = train.train_type !== 'Passenger / Local';
  const thresholdKm = isExpress ? 5.0 : 2.0;
  const isClosureRequired = train.distance_from_bridge_km <= thresholdKm && train.distance_from_bridge_km > 0;

  const defaultRoute = [
    { code: 'MAS', name: 'Chennai Central', dist: '0 km', sched: '14:10', status: 'COMPLETED' },
    { code: 'GDR', name: 'Gudur Jn', dist: '138 km', sched: '16:20', status: 'COMPLETED' },
    { code: 'NLR', name: 'Nellore', dist: '176 km', sched: '16:50', status: 'COMPLETED' },
    { code: 'SKM', name: 'Singarayakonda', dist: '255 km', sched: '17:50', status: 'DEPARTED' },
    { code: 'OGL', name: 'ONGOLE (BRIDGE LOCATION)', dist: '292 km', sched: train.eta_ongole, status: 'NEXT', isOngole: true },
    { code: 'CLX', name: 'Chirala', dist: '342 km', sched: '19:00', status: 'UPCOMING' },
    { code: 'BPP', name: 'Bapatla', dist: '357 km', sched: '19:15', status: 'UPCOMING' },
    { code: 'TEL', name: 'Tenali Jn', dist: '400 km', sched: '19:55', status: 'UPCOMING' },
    { code: 'BZA', name: 'Vijayawada Jn', dist: '431 km', sched: '20:45', status: 'UPCOMING' }
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search / Dashboard
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Last GPS Ping: <strong className="text-emerald-400">Live (3s ago)</strong>
        </span>
      </div>

      {/* Hero Train Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg text-lg font-black font-mono bg-blue-900/60 text-blue-300 border border-blue-700">
                {train.train_number}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{train.train_name}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {train.train_type}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Corridor: <strong className="text-slate-200">{train.origin_station}</strong> ➔{' '}
              <strong className="text-slate-200">{train.destination_station}</strong> • Platform{' '}
              <strong className="text-amber-400">{train.platform_assigned}</strong>
            </p>
          </div>

          {/* Safety State Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg ${
                isClosureRequired
                  ? 'bg-red-950 text-red-200 border-red-500 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isClosureRequired ? 'CLOSURE REQUIRED' : 'APPROACH SAFE'}</span>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Distance to Bridge
            </span>
            <span
              className={`text-xl font-black font-mono ${
                isClosureRequired ? 'text-red-400' : 'text-slate-100'
              }`}
            >
              {train.distance_from_bridge_km.toFixed(1)} km
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Safety Threshold
            </span>
            <span className="text-xl font-black font-mono text-amber-400">
              {thresholdKm.toFixed(1)} km
            </span>
            <span className="text-[9px] text-slate-400 block">
              ({isExpress ? 'Express Standard' : 'Local Standard'})
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Current Speed
            </span>
            <span className="text-xl font-black font-mono text-blue-400">
              {train.current_speed_kmh} km/h
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              ETA Ongole
            </span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {train.eta_ongole}
            </span>
          </div>
        </div>
      </div>

      {/* Where Is My Train - Route Station Line */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <TrainTrack className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Station Route Timeline</h3>
              <p className="text-xs text-slate-400">Where Is My Train — Route Tracking System</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Corridor: BZA - MAS Electrified Double Line</span>
        </div>

        {/* Timeline stations */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-9 before:top-3 before:bottom-3 before:w-1 before:bg-slate-800">
          {defaultRoute.map((stop, idx) => {
            const isCompleted = stop.status === 'COMPLETED';
            const isNext = stop.status === 'NEXT';
            const isOngole = stop.isOngole;

            return (
              <div key={stop.code} className="relative flex items-center gap-4">
                {/* Timeline Dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 ${
                    isOngole
                      ? 'bg-amber-500 border-white text-slate-950 shadow-lg shadow-amber-500/50 scale-125'
                      : isCompleted
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : isNext
                      ? 'bg-red-600 border-red-300 text-white animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                {/* Station Info Card */}
                <div
                  className={`flex-1 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                    isOngole
                      ? 'bg-amber-950/40 border-amber-500/70 shadow-lg'
                      : isNext
                      ? 'bg-slate-800/90 border-blue-500/60'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{stop.code}</span>
                      <h4
                        className={`text-sm font-bold ${
                          isOngole ? 'text-amber-300 text-base' : 'text-slate-100'
                        }`}
                      >
                        {stop.name}
                      </h4>
                      {isOngole && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                          SAFETY TARGET
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Cumulative Distance: {stop.dist}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Schedule / ETA
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {stop.sched}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                        isCompleted
                          ? 'bg-slate-800 text-slate-400'
                          : isOngole
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-900/60 text-blue-300'
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
