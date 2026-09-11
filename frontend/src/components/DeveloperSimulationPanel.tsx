import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Terminal,
  AlertTriangle,
  Zap,
  Radio,
  CheckCircle2
} from 'lucide-react';

export const DeveloperSimulationPanel: React.FC = () => {
  const {
    simulatedTrainDistance,
    setSimulatedDistance,
    isSimulationPlaying,
    toggleSimulationPlay,
    runScenario,
    resetSimulation,
    simulationScenario,
    bridgeStatus,
    telemetry
  } = useApp();

  const [consoleOpen, setConsoleOpen] = useState(true);

  const scenarios = [
    {
      name: 'Express Train 5km Approach',
      desc: 'Simulates 12711 Pinakini Express (88 km/h). Breaches 5.0 km threshold, triggers high-priority siren & auto-retracts bridge.',
      dist: 5.5
    },
    {
      name: 'Local Passenger 2km Approach',
      desc: 'Simulates 07576 Guntur-Tirupati Local. Remains OPEN until 2.0 km, then triggers closure sequence.',
      dist: 2.5
    },
    {
      name: 'Emergency Stop Test',
      desc: 'Simulates immediate mechanical solenoid brake trip while bridge is in transit.',
      dist: 3.5
    },
    {
      name: 'ESP32 Disconnect Test',
      desc: 'Simulates microcontroller watchdog drop. Verifies fail-safe hold and offline state display.',
      dist: 4.2
    },
    {
      name: 'Stale API Data Test',
      desc: 'Simulates CRIS/NTES data timeout. Verifies stale warnings and inhibition of reopening.',
      dist: 6.0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Developer Simulation & Safety Studio</h2>
            <p className="text-xs text-slate-400">
              Interactive test bench to simulate train approaches (10km ➔ 0km) and fail-safe safety events
            </p>
          </div>
        </div>

        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          Reset Baseline
        </button>
      </div>

      {/* Main Interactive Slider Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Train Approach Distance Slider (10 km ➔ 0 km Station Track)
            </h3>
            <p className="text-xs text-slate-400">
              Drag slider to manually position train relative to the Ongole footbridge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Active Distance:</span>
            <span
              className={`text-2xl font-black font-mono ${
                simulatedTrainDistance <= 5.0 && simulatedTrainDistance > 0
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}
            >
              {simulatedTrainDistance.toFixed(1)} km
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="-1.5"
            max="10.0"
            step="0.1"
            value={simulatedTrainDistance}
            onChange={(e) => setSimulatedDistance(parseFloat(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          {/* Markers along the track slider */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>10 km (Monitoring)</span>
            <span className="text-amber-400 font-bold">5 km (Express Trigger)</span>
            <span className="text-amber-400 font-bold">2 km (Local Trigger)</span>
            <span className="text-red-400 font-bold">0 km (OGL Bridge)</span>
            <span className="text-emerald-400 font-bold">+1.5 km (Passed Safe)</span>
          </div>
        </div>

        {/* Play/Pause Sequence Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulationPlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg ${
                isSimulationPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimulationPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Auto-Sequence
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Continuous Approach Run
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">
              {isSimulationPlaying ? 'Simulating 88 km/h approach run' : 'Paused at current coordinate'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Current Safety Action:</span>
            <span className="font-bold text-slate-200 uppercase">{bridgeStatus.state}</span>
          </div>
        </div>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = simulationScenario === sc.name;
          return (
            <div
              key={sc.name}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition ${
                isSelected ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">{sc.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.desc}</p>
              </div>

              <button
                onClick={() => runScenario(sc.name)}
                className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 transition"
              >
                Execute Scenario
              </button>
            </div>
          );
        })}
      </div>

      {/* Live ESP32 Serial / Telemetry Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 font-mono">
              ESP32 Serial & MQTT Telemetry Console (/dev/ttyUSB0 • 115200 baud)
            </span>
          </div>
          <button
            onClick={() => setConsoleOpen(!consoleOpen)}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono"
          >
            {consoleOpen ? 'Collapse Console' : 'Expand Console'}
          </button>
        </div>

        {consoleOpen && (
          <div className="p-4 font-mono text-[11px] text-emerald-400 bg-slate-950/90 space-y-1.5 overflow-x-auto max-h-52">
            <div className="text-slate-400">[SYSTEM_BOOT] ESP32-WROOM-32 (Industrial DIN Mount) initialized. Firmware v2.4.1.</div>
            <div className="text-slate-400">[WIFI_INIT] Connected to RAILSAFE_SECURE_WLAN. Local IP: 192.168.1.145 (RSSI: {telemetry.wifi_rssi_dbm} dBm).</div>
            <div>[HEARTBEAT] 1Hz Telemetry TX ➔ status: {bridgeStatus.state} | pos: {bridgeStatus.position_pct}% | motor: {telemetry.motor_current_amps}A | ls_ret: {telemetry.limit_switch_retracted ? 'TRUE' : 'FALSE'} | ls_ext: {telemetry.limit_switch_extended ? 'TRUE' : 'FALSE'}</div>
            {bridgeStatus.state === 'CLOSING' && (
              <div className="text-amber-400 font-bold">
                [ACTUATOR_PWM] Linear actuator PWM=255. Retracting bridge span to Platform 1 bay. Current: 2.38A. Warning beacons ON.
              </div>
            )}
            {bridgeStatus.state === 'CLOSED' && (
              <div className="text-red-400 font-bold">
                [LIMIT_SWITCH] LS1 tripped. Fully stowed at Platform 1. Electromagnetic brake energized. Track safe.
              </div>
            )}
            {bridgeStatus.state === 'OPENING' && (
              <div className="text-blue-400 font-bold">
                [ACTUATOR_PWM] Extending bridge span to Platform 2 island. Current: 2.12A.
              </div>
            )}
            {bridgeStatus.state === 'SAFE_OPEN' && (
              <div className="text-emerald-400 font-bold">
                [LIMIT_SWITCH] LS2 tripped. Bridge deployed. Pedestrian crossing green light active.
              </div>
            )}
            {telemetry.connection_status === 'OFFLINE' && (
              <div className="text-red-500 font-black">
                [WATCHDOG_ALERT] WiFi link lost! Watchdog tripped. Solenoid brake engaged in fail-safe lock.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
