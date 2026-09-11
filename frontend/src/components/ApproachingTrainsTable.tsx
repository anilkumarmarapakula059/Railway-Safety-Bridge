import React from 'react';
import { useApp } from '../context/AppContext';
import { Train, SafetyZone } from '../types';
import { TrainTrack, ArrowRight, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ApproachingTrainsTableProps {
  onSelectTrain?: (train: Train) => void;
}

export const ApproachingTrainsTable: React.FC<ApproachingTrainsTableProps> = ({ onSelectTrain }) => {
  const { trains, setSelectedTrain } = useApp();

  const handleTrackClick = (train: Train) => {
    setSelectedTrain(train);
    if (onSelectTrain) {
      onSelectTrain(train);
    }
  };

  const getZoneBadge = (zone: SafetyZone, train: Train) => {
    switch (zone) {
      case 'WARNING':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-950 text-red-300 border border-red-700 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            ⚠️ CLOSURE TRIGGERED
          </span>
        );
      case 'APPROACHING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700">
            <Clock className="w-3 h-3" />
            APPROACHING
          </span>
        );
      case 'SAFE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            MONITORING
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <TrainTrack className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Approaching Corridor Trains</h3>
            <p className="text-xs text-slate-400">Live positioning on Vijayawada - Chennai line</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          Tracking <strong className="text-blue-400 font-mono">{trains.length}</strong> trains
        </span>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 pl-2">Train</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Corridor Route</th>
              <th className="pb-3">Distance</th>
              <th className="pb-3">Speed</th>
              <th className="pb-3">ETA (OGL)</th>
              <th className="pb-3">Safety Status</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {trains.map((train) => {
              const isDanger = train.safety_zone === 'WARNING' || train.safety_zone === 'CRITICAL';
              return (
                <tr
                  key={train.train_number}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    isDanger ? 'bg-red-950/20' : ''
                  }`}
                >
                  {/* Train */}
                  <td className="py-3.5 pl-2">
                    <div className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                      <span className="font-mono text-blue-400">{train.train_number}</span>
                      <span>{train.train_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Dir: {train.direction_of_travel === 'DOWN' ? 'Down (To BZA)' : 'Up (To MAS)'} • {train.platform_assigned}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {train.train_type}
                    </span>
                  </td>

                  {/* Route */}
                  <td className="py-3.5 text-slate-300">
                    <div className="flex items-center gap-1">
                      <span>{train.origin_station.split(' ')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{train.destination_station.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Next: {train.next_station}
                    </span>
                  </td>

                  {/* Distance */}
                  <td className="py-3.5 font-mono">
                    <span
                      className={`text-sm font-extrabold ${
                        isDanger ? 'text-red-400' : 'text-slate-200'
                      }`}
                    >
                      {train.distance_from_bridge_km.toFixed(1)} km
                    </span>
                  </td>

                  {/* Speed */}
                  <td className="py-3.5 font-mono text-slate-300">
                    {train.current_speed_kmh} km/h
                  </td>

                  {/* ETA */}
                  <td className="py-3.5 font-mono text-slate-200 font-semibold">
                    {train.eta_ongole}
                  </td>

                  {/* Safety Status */}
                  <td className="py-3.5">
                    {getZoneBadge(train.safety_zone, train)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => handleTrackClick(train)}
                      className="px-3 py-1 rounded-md text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow transition active:scale-95"
                    >
                      Track Live
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
