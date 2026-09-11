import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BridgeCommandType } from '../types';
import {
  Sliders,
  ShieldAlert,
  AlertOctagon,
  Lock,
  Unlock,
  Play,
  Square,
  RotateCcw,
  Zap,
  Activity,
  Cpu,
  UserCheck
} from 'lucide-react';

export const StaffBridgeControl: React.FC = () => {
  const {
    user,
    setUserRole,
    bridgeStatus,
    telemetry,
    dispatchCommand,
    simulatedTrainDistance
  } = useApp();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    cmd: BridgeCommandType | null;
    title: string;
    description: string;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    cmd: null,
    title: '',
    description: '',
    isDangerous: false
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // If role is passenger, show permission barrier with quick switch
  if (user.role === 'PASSENGER') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-700 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Restricted Railway Staff Console</h2>
        <p className="text-sm text-slate-400 mt-2">
          Manual physical actuation of the retractable footbridge is restricted strictly to authorized
          Station Masters, Section Controllers, and Railway Safety Engineers.
        </p>
        <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
          Current Role: <strong className="text-amber-400">Public Commuter (Read Only)</strong>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setUserRole('OPERATOR')}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Switch to Railway Operator (Demo Auth)
          </button>
        </div>
      </div>
    );
  }

  const handleCommandClick = (cmd: BridgeCommandType) => {
    setFeedback(null);

    if (cmd === 'EMERGENCY_STOP') {
      // Execute emergency stop immediately with no delay!
      executeCommand(cmd);
      return;
    }

    if (cmd === 'CLOSE') {
      setConfirmModal({
        isOpen: true,
        cmd: 'CLOSE',
        title: 'Confirm Manual Bridge Retraction',
        description: 'Are you sure you want to retract the footbridge to Platform 1? Ensure passenger crossing gates are closed.',
        isDangerous: false
      });
    } else if (cmd === 'OPEN') {
      const isTrainClose = simulatedTrainDistance <= 5.0 && simulatedTrainDistance >= -0.5;
      setConfirmModal({
        isOpen: true,
        cmd: 'OPEN',
        title: 'Confirm Manual Bridge Extension',
        description: isTrainClose
          ? `WARNING: Train 12711 is currently at ${simulatedTrainDistance.toFixed(1)} km! Safety interlock may reject this command.`
          : 'Are you sure you want to extend the footbridge across to Platform 2? Track clearance will be verified.',
        isDangerous: isTrainClose
      });
    } else if (cmd === 'STOP') {
      setConfirmModal({
        isOpen: true,
        cmd: 'STOP',
        title: 'Confirm Actuator Pause',
        description: 'Pause linear actuator movement in current intermediate position?',
        isDangerous: false
      });
    } else if (cmd === 'RESET_FAULT') {
      executeCommand('RESET_FAULT');
    }
  };

  const executeCommand = async (cmd: BridgeCommandType) => {
    setConfirmModal({ isOpen: false, cmd: null, title: '', description: '' });
    const res = await dispatchCommand(cmd);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Authorized Bridge Actuation Console</h2>
            <p className="text-xs text-slate-400">
              Railway Operator Interface • User: <strong className="text-slate-200">{user.full_name}</strong> ({user.badge_number || 'STATION MASTER'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            INTERLOCK ACTIVE (SIL-2 SIM)
          </span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/90 border-rose-600 text-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:text-white ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Manual Action Buttons */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
            Direct Actuator Commands
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EXTEND / OPEN BUTTON */}
            <button
              onClick={() => handleCommandClick('OPEN')}
              disabled={bridgeStatus.state === 'OPENING' || bridgeStatus.position_pct === 100}
              className="p-5 rounded-xl border border-emerald-600/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 transition text-left group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-emerald-400 group-hover:text-emerald-300">
                  OPEN / EXTEND BRIDGE
                </span>
                <Play className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400/80">
                Deploy telescopic footbridge across to Platform 2. Enables pedestrian crossing.
              </p>
            </button>

            {/* RETRACT / CLOSE BUTTON */}
            <button
              onClick={() => handleCommandClick('CLOSE')}
              disabled={bridgeStatus.state === 'CLOSING' || bridgeStatus.position_pct === 0}
              className="p-5 rounded-xl border border-amber-600/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 transition text-left group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-amber-400 group-hover:text-amber-300">
                  CLOSE / RETRACT BRIDGE
                </span>
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs text-amber-400/80">
                Retract footbridge into Platform 1 stowage bay. Lowers crossing warning barriers.
              </p>
            </button>

            {/* HOLD / PAUSE BUTTON */}
            <button
              onClick={() => handleCommandClick('STOP')}
              className="p-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition text-left group shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-slate-200 group-hover:text-white">
                  PAUSE / HOLD MOTION
                </span>
                <Square className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400">
                Instantly pauses linear actuators at current position for maintenance inspection.
              </p>
            </button>

            {/* RESET FAULT BUTTON */}
            <button
              onClick={() => handleCommandClick('RESET_FAULT')}
              className="p-5 rounded-xl border border-blue-700/60 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 transition text-left group shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-blue-400 group-hover:text-blue-300">
                  RESET SAFETY FAULT
                </span>
                <Unlock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-blue-400/80">
                Acknowledge and clear emergency latch after confirming track area is clear.
              </p>
            </button>
          </div>

          {/* EMERGENCY STOP PROMINENT MUSHROOM BUTTON */}
          <div className="pt-4 border-t border-slate-800">
            <div className="bg-red-950/40 border-2 border-red-600 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-extrabold text-base">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                  EMERGENCY HARDWARE STOP
                </div>
                <p className="text-xs text-red-300/80 mt-1 max-w-md">
                  Cuts power to actuator drive immediately and engages fail-safe solenoid brakes. Overrides all automatic schedules.
                </p>
              </div>

              <button
                onClick={() => handleCommandClick('EMERGENCY_STOP')}
                className="px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/60 active:scale-95 transition flex items-center justify-center gap-2 border-2 border-red-400"
              >
                <AlertOctagon className="w-5 h-5" />
                EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Interlock & Telemetry Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
            Hardware Interlock Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">Bridge State</span>
              <span className="font-extrabold text-slate-100 uppercase">{bridgeStatus.state}</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">Extension Position</span>
              <span className="font-bold text-blue-400 font-mono">{bridgeStatus.position_pct}%</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">Motor Current Draw</span>
              <span className="font-bold text-slate-200 font-mono">{telemetry.motor_current_amps} A</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">DC Bus Voltage</span>
              <span className="font-bold text-slate-200 font-mono">{telemetry.supply_voltage} V</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">Enclosure Temp</span>
              <span className="font-bold text-slate-200 font-mono">{telemetry.enclosure_temp_c} °C</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">Obstacle Radar Beam</span>
              <span className="font-bold text-emerald-400">BEAM CLEAR</span>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 font-medium">ESP32 Heartbeat</span>
              <span className="font-bold text-emerald-400">14 ms RTT</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800 text-[11px] text-blue-300">
            <strong className="block mb-0.5">Fail-Safe Logic Active:</strong>
            Safety engine automatically blocks opening commands if any approaching train is detected within the 5.0 km zone.
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  confirmModal.isDangerous ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.description}</p>

            <div className="p-3 rounded-lg bg-slate-800 text-[11px] text-slate-400 font-mono">
              Action ID: <strong className="text-slate-200">{confirmModal.cmd}</strong> • Authorization: <strong className="text-blue-400">{user.full_name}</strong>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, cmd: null, title: '', description: '' })}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.cmd && executeCommand(confirmModal.cmd)}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition active:scale-95 ${
                  confirmModal.isDangerous
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/40'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40'
                }`}
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
