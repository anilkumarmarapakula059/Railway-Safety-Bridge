import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Activity,
  Cpu,
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { BridgeState } from '../types';

export const BridgeStatusCard: React.FC = () => {
  const { bridgeStatus, telemetry } = useApp();

  const getStateDetails = (state: BridgeState) => {
    switch (state) {
      case 'SAFE_OPEN':
        return {
          label: 'SAFE — OPEN',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
          dot: 'bg-emerald-400',
          desc: 'Bridge fully extended. Passengers may safely cross.'
        };
      case 'TRAIN_APPROACHING':
        return {
          label: 'APPROACHING',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700',
          dot: 'bg-amber-400 animate-pulse',
          desc: 'Train within corridor. Preparing closure sequence.'
        };
      case 'WARNING':
      case 'CLOSURE_REQUESTED':
        return {
          label: 'CLOSURE ORDERED',
          bg: 'bg-rose-950/90 text-rose-300 border-rose-700',
          dot: 'bg-rose-400 animate-ping',
          desc: 'Proximity threshold breached. Pedestrian gates locked.'
        };
      case 'CLOSING':
        return {
          label: 'CLOSING / RETRACTING',
          bg: 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse',
          dot: 'bg-rose-400 animate-bounce',
          desc: 'Linear actuators retracting bridge to Platform 1 bay.'
        };
      case 'CLOSED':
      case 'TRAIN_PASSING':
        return {
          label: state === 'TRAIN_PASSING' ? 'TRAIN PASSING — LOCKED' : 'CLOSED / RETRACTED',
          bg: 'bg-red-950 text-red-200 border-red-500',
          dot: 'bg-red-500',
          desc: 'Bridge securely stowed on Platform 1. Track area clear.'
        };
      case 'OPENING':
        return {
          label: 'OPENING / EXTENDING',
          bg: 'bg-blue-950/90 text-blue-300 border-blue-700 animate-pulse',
          dot: 'bg-blue-400',
          desc: 'Corridor clear. Actuators extending bridge to Platform 2.'
        };
      case 'EMERGENCY_STOP':
        return {
          label: 'EMERGENCY STOPPED',
          bg: 'bg-red-950 text-red-100 border-red-500 animate-pulse',
          dot: 'bg-red-500 animate-ping',
          desc: 'Solenoid brake locked. All actuator power cut.'
        };
      case 'FAULT':
      default:
        return {
          label: 'HARDWARE FAULT',
          bg: 'bg-rose-950 text-rose-300 border-rose-700',
          dot: 'bg-rose-400',
          desc: 'Interlock fault detected. Manual inspection required.'
        };
    }
  };

  const stateInfo = getStateDetails(bridgeStatus.state);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      {/* Header with Title and Big State Pill */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Retractable Footbridge Status</h3>
              <p className="text-xs text-slate-400">Connecting Platform 1 & Platform 2/3 Island</p>
            </div>
          </div>

          <span
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border shadow-md ${stateInfo.bg}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${stateInfo.dot}`}></span>
            {stateInfo.label}
          </span>
        </div>

        {/* Position Progress Bar */}
        <div className="my-4">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-400">Telescopic Extension:</span>
            <span className="text-slate-200 font-mono font-bold">
              {bridgeStatus.position_pct.toFixed(0)}%{' '}
              <span className="text-[11px] text-slate-400 font-normal">
                ({bridgeStatus.position_pct === 100 ? 'Fully Connected' : bridgeStatus.position_pct === 0 ? 'Fully Retracted' : 'In Transit'})
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                bridgeStatus.position_pct === 100
                  ? 'bg-emerald-500'
                  : bridgeStatus.position_pct === 0
                  ? 'bg-red-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${bridgeStatus.position_pct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Platform 1 (0% - Parked)</span>
            <span>Platform 2 (100% - Deployed)</span>
          </div>
        </div>

        {/* 2x2 Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          {/* Motor Actuator */}
          <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                Motor Drive
              </span>
              <span className="font-mono text-slate-300">{telemetry.motor_current_amps} A</span>
            </div>
            <div className="font-bold text-slate-200 uppercase">
              {bridgeStatus.motor_status}
            </div>
          </div>

          {/* ESP32 Controller */}
          <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                ESP32 Link
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{telemetry.wifi_rssi_dbm} dBm</span>
            </div>
            <div className={`font-bold uppercase ${bridgeStatus.esp32_status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {bridgeStatus.esp32_status}
            </div>
          </div>

          {/* Passenger Gate */}
          <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Crossing Gate
              </span>
            </div>
            <div className="font-bold text-slate-200">
              {bridgeStatus.pedestrian_crossing_active ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> GREEN SIGNAL
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> GATES LOCKED (RED)
                </span>
              )}
            </div>
          </div>

          {/* Limit Switches */}
          <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Limit Switches
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-300 flex items-center gap-2">
              <span className={telemetry.limit_switch_retracted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                LS1: {telemetry.limit_switch_retracted ? 'ENGAGED' : 'OFF'}
              </span>
              <span>•</span>
              <span className={telemetry.limit_switch_extended ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                LS2: {telemetry.limit_switch_extended ? 'ENGAGED' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Command Audit Footer */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Last Command: <strong className="text-slate-300">{bridgeStatus.last_command?.command_type || 'AUTO'}</strong> ({bridgeStatus.last_command?.command_id || 'INITIAL'})
        </span>
        <span className="text-slate-400">
          Source: <strong className="text-blue-400">{bridgeStatus.last_command?.source || 'SYSTEM'}</strong>
        </span>
      </div>
    </div>
  );
};
