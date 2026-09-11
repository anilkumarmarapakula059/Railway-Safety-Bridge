import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldCheck, CheckCircle2, Siren } from 'lucide-react';

export const SafetyAlertBanner: React.FC = () => {
  const { activeAlert, acknowledgeAlert, user, bridgeStatus } = useApp();

  if (!activeAlert || !activeAlert.is_active) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex items-center justify-between text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300">Corridor Clear — Footbridge Safe for Passenger Crossing</h3>
            <p className="text-xs text-emerald-400/80">
              No train within safety proximity threshold (Express: 5.0 km, Local: 2.0 km). Retractable footbridge extended across Platform 1 and 2.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
            NORMAL SAFE STATE
          </span>
        </div>
      </div>
    );
  }

  const isEmergency = bridgeStatus.state === 'EMERGENCY_STOP';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-4 sm:p-5 shadow-2xl transition-all ${
        isEmergency
          ? 'bg-red-950/90 border-red-500 text-white animate-pulse'
          : 'bg-gradient-to-r from-red-950/90 via-amber-950/80 to-slate-900 border-red-500/80 text-white'
      }`}
    >
      {/* Visual Siren Strobe Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse"></div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Icon & Alert Heading */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/50 flex-shrink-0 animate-bounce">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-600 text-white">
                HIGH PRIORITY SAFETY INTERLOCK
              </span>
              <span className="text-xs text-red-300 font-mono">
                {new Date(activeAlert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-1">
              {activeAlert.title}
            </h2>
            <p className="text-xs sm:text-sm text-red-200 mt-0.5">
              {activeAlert.message}
            </p>
          </div>
        </div>

        {/* Center: Key Safety Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/80 backdrop-blur p-2.5 rounded-lg border border-red-900/60 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Train</span>
            <span className="text-xs font-bold text-amber-300">
              {activeAlert.train_number} {activeAlert.train_name ? `(${activeAlert.train_name.split(' ')[0]})` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
            <span className="text-xs font-extrabold text-red-400 font-mono">
              {activeAlert.distance_km !== undefined ? `${activeAlert.distance_km} km` : 'Approaching'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Threshold</span>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {activeAlert.threshold_km || 5.0} km
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Action</span>
            <span className="text-xs font-black text-rose-300 uppercase">
              {activeAlert.action_taken}
            </span>
          </div>
        </div>

        {/* Right: Staff Acknowledge */}
        <div className="flex items-center gap-3">
          {activeAlert.acknowledged ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ack by {activeAlert.acknowledged_by || 'Staff'}</span>
            </div>
          ) : (
            user.role !== 'PASSENGER' && (
              <button
                onClick={acknowledgeAlert}
                className="px-4 py-2 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 transition active:scale-95 whitespace-nowrap"
              >
                Acknowledge Alert
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
