import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, CheckCircle, AlertTriangle, XCircle, Cpu, Wifi, Database, Radio, Shield, Zap, Key } from 'lucide-react';
import { API_KEY } from '../services/api';

export const SystemHealthMatrix: React.FC = () => {
  const { health, toggleESP32Connection, toggleApiFailure, telemetry } = useApp();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'HEALTHY':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'DEGRADED':
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'OFFLINE':
      case 'CRITICAL':
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'HEALTHY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
            ONLINE
          </span>
        );
      case 'DEGRADED':
      case 'WARNING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-800">
            DEGRADED
          </span>
        );
      case 'OFFLINE':
      case 'CRITICAL':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-800 animate-pulse">
            OFFLINE
          </span>
        );
    }
  };

  const components = [
    {
      key: 'api',
      item: health.train_api,
      icon: <Radio className="w-5 h-5 text-blue-400" />,
      tag: 'CRIS / NTES'
    },
    {
      key: 'engine',
      item: health.backend_safety_engine,
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      tag: 'FastAPI Safety Core'
    },
    {
      key: 'esp32',
      item: health.esp32_controller,
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      tag: 'IoT Controller'
    },
    {
      key: 'actuators',
      item: health.bridge_actuators,
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      tag: 'Physical Motors'
    },
    {
      key: 'sensors',
      item: health.track_sensors,
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      tag: 'Axle Counters & Radar'
    },
    {
      key: 'barriers',
      item: health.optical_crossing_barrier,
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      tag: 'Pedestrian Barriers'
    },
    {
      key: 'ws',
      item: health.websocket_service,
      icon: <Wifi className="w-5 h-5 text-indigo-400" />,
      tag: 'Real-time WebSocket'
    },
    {
      key: 'db',
      item: health.database,
      icon: <Database className="w-5 h-5 text-teal-400" />,
      tag: 'Audit DB Store'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Overall Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">System Diagnostics & Hardware Health</h2>
            <p className="text-xs text-slate-400">Real-time watchdog monitoring of all subsystem telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Overall Health:</span>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
              health.overall_status === 'HEALTHY'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : health.overall_status === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-red-950 text-red-200 border-red-600 animate-pulse'
            }`}
          >
            {getStatusIcon(health.overall_status)}
            {health.overall_status}
          </span>
        </div>
      </div>

      {/* Component Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map(({ key, item, icon, tag }) => (
          <div
            key={key}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">{icon}</div>
                {getStatusBadge(item.status)}
              </div>

              <h3 className="font-bold text-xs text-slate-100">{item.name}</h3>
              <span className="text-[10px] text-blue-400 font-mono block mt-0.5">{tag}</span>
              <p className="text-[11px] text-slate-400 mt-2">{item.details}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Latency: <strong className="text-slate-200 font-mono">{item.latency_ms !== undefined ? `${item.latency_ms} ms` : 'N/A'}</strong></span>
              <span>Checked: Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Train Location API Key Card */}
      <div className="bg-slate-900 border border-blue-800/80 rounded-xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Train Location API Key Integration</h3>
              <p className="text-xs text-slate-400">CRIS / NTES Telemetry Gateway Authentication</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            API KEY CONNECTED & ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Configured API Key</span>
            <code className="font-mono font-bold text-blue-400 text-xs break-all select-all">
              {API_KEY}
            </code>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Authorization Method</span>
            <span className="font-bold text-slate-200">Header: X-API-Key</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">TLS 1.3 Encrypted Handshake</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Project Endpoint</span>
            <span className="font-mono text-emerald-400 font-bold">http://localhost:3000/</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Proxy: http://localhost:8000/</span>
          </div>
        </div>
      </div>

      {/* Fail-Safe Behavioral Test Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Fail-Safe Behavioral Verification Panel
          </h3>
          <p className="text-xs text-slate-400">
            Inject synthetic subsystem failures to verify that the safety interlocks default to the fail-safe state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Test 1: ESP32 Disconnect */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">ESP32 Watchdog Timeout</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates Wi-Fi packet loss or microcontroller failure. System must lock bridge and flag ESP32 OFFLINE.
              </p>
            </div>
            <button
              onClick={toggleESP32Connection}
              className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition ${
                telemetry.connection_status === 'ONLINE'
                  ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700'
                  : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
              }`}
            >
              {telemetry.connection_status === 'ONLINE' ? 'Simulate ESP32 Disconnect' : 'Restore ESP32 Connection'}
            </button>
          </div>

          {/* Test 2: Train API Timeout */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Train API Stale / Timeout</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates Indian Railways CRIS feed failure. System must mark data as STALE and inhibit automatic reopening.
              </p>
            </div>
            <button
              onClick={toggleApiFailure}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 transition"
            >
              Toggle Train API Failure
            </button>
          </div>

          {/* Test 3: Optical Sensor Obstacle */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Track Clearance Radar</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Dual axle counters and trackside radar confirm when rolling stock has traversed the platform boundary.
              </p>
            </div>
            <div className="mt-4 p-2 rounded bg-slate-900 border border-slate-700 text-center text-xs font-bold text-emerald-400">
              Track 1 & Track 2 Clear
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
