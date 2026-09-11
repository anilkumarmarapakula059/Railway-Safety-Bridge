import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Filter, Download, Search, AlertCircle, ShieldCheck } from 'lucide-react';
import { EventLogEntry } from '../types';

export const EventLogTable: React.FC = () => {
  const { eventLogs } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = eventLogs.filter((log) => {
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesSearch =
      searchQuery === '' ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.train_name && log.train_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.train_number && log.train_number.includes(searchQuery));
    return matchesSeverity && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Event Type', 'Severity', 'Train', 'Distance (km)', 'Bridge State', 'Command', 'Result', 'Details'];
    const rows = filteredLogs.map(l => [
      l.event_id,
      l.timestamp,
      l.event_type,
      l.severity,
      l.train_number ? `${l.train_number} ${l.train_name || ''}` : 'N/A',
      l.distance_km !== undefined ? l.distance_km : 'N/A',
      l.bridge_state,
      l.command || 'N/A',
      l.result,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `railsafe_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-800">
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-800">
            WARNING
          </span>
        );
      case 'FAULT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-800">
            FAULT
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Safety Event Audit Trail & Log</h2>
            <p className="text-xs text-slate-400">Sequential, tamper-evident record of all safety transitions & commands</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          Export CSV Audit Log
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by keyword, train name, or command..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-2.5 pl-2">Time (IST)</th>
              <th className="pb-2.5">Severity</th>
              <th className="pb-2.5">Event Type</th>
              <th className="pb-2.5">Train / Target</th>
              <th className="pb-2.5">Distance</th>
              <th className="pb-2.5">Bridge State</th>
              <th className="pb-2.5">Result</th>
              <th className="pb-2.5 pr-2">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredLogs.map((log) => (
              <tr key={log.event_id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 pl-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 whitespace-nowrap">{getSeverityBadge(log.severity)}</td>
                <td className="py-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                  {log.event_type}
                </td>
                <td className="py-3 whitespace-nowrap">
                  {log.train_number ? (
                    <span className="font-mono text-blue-400 font-bold">
                      {log.train_number} {log.train_name ? `(${log.train_name})` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">Station Infrastructure</span>
                  )}
                </td>
                <td className="py-3 font-mono text-slate-300 whitespace-nowrap">
                  {log.distance_km !== undefined ? `${log.distance_km} km` : '—'}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {log.bridge_state}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span
                    className={`font-bold text-[11px] ${
                      log.result === 'SUCCESS' || log.result === 'ACK_SUCCESS'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {log.result}
                  </span>
                </td>
                <td className="py-3 text-slate-300 pr-2 max-w-xs sm:max-w-sm truncate" title={log.details}>
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
