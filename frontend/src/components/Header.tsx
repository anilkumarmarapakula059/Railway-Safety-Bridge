import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, ShieldAlert, Wifi, Clock, UserCheck, Shield } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenDisclaimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDisclaimer }) => {
  const {
    user,
    setUserRole,
    freshness,
    lastUpdatedTime,
    currentTime,
    isMuted,
    toggleMute,
    telemetry
  } = useApp();

  const getFreshnessBadge = () => {
    switch (freshness) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Live Telemetry
          </span>
        );
      case 'DELAYED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Delayed Feed
          </span>
        );
      case 'UNAVAILABLE':
      case 'STALE':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Data Unavailable
          </span>
        );
    }
  };

  const roles: UserRole[] = ['PASSENGER', 'OPERATOR', 'ADMINISTRATOR'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  RAILSAFE <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">IoT-AUTOBRIDGE</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Automatic Footbridge Control System • <span className="text-amber-400 font-semibold">Ongole Railway Station (OGL)</span>
              </p>
            </div>
          </div>

          {/* Center Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            {/* Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-medium">{currentTime}</span>
            </div>

            {/* Freshness Badge */}
            {getFreshnessBadge()}

            {/* ESP32 Status Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              telemetry.connection_status === 'ONLINE'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
            }`}>
              <Wifi className="w-3 h-3" />
              <span>ESP32: {telemetry.connection_status}</span>
            </div>
          </div>

          {/* Right Actions: Sound, Role Switcher, Disclaimer */}
          <div className="flex items-center gap-2.5">
            {/* Audio Siren Mute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute safety siren' : 'Mute safety siren'}
              className={`p-2 rounded-lg border transition-all ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800 hover:bg-amber-900/60'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={user.role}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-2"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-slate-100">
                    {r === 'PASSENGER' ? 'Passenger (Read Only)' : r === 'OPERATOR' ? 'Railway Operator' : 'Administrator'}
                  </option>
                ))}
              </select>
            </div>

            {/* Disclaimer Modal Trigger */}
            <button
              onClick={onOpenDisclaimer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Prototype Disclaimer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
