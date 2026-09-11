import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Train } from '../types';
import { Search, TrainTrack, ArrowRight, Clock, MapPin, Gauge } from 'lucide-react';

interface TrainSearchProps {
  onSelectTrain: (train: Train) => void;
}

export const TrainSearch: React.FC<TrainSearchProps> = ({ onSelectTrain }) => {
  const { trains, setSelectedTrain } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = trains.filter((t) => {
    const matchesQuery =
      t.train_number.includes(query) ||
      t.train_name.toLowerCase().includes(query.toLowerCase()) ||
      t.origin_station.toLowerCase().includes(query.toLowerCase()) ||
      t.destination_station.toLowerCase().includes(query.toLowerCase()) ||
      t.current_station.toLowerCase().includes(query.toLowerCase());

    const matchesType = filterType === 'ALL' || t.train_type.includes(filterType);
    return matchesQuery && matchesType;
  });

  const handleTrack = (train: Train) => {
    setSelectedTrain(train);
    onSelectTrain(train);
  };

  const quickSearches = ['Pinakini', '12711', 'Vande Bharat', 'Tirupati', 'Chennai', 'Vijayawada'];

  return (
    <div className="space-y-6">
      {/* Search Bar Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Live Train Search & Schedule</h2>
            <p className="text-xs text-slate-400">Search trains passing Ongole Railway Station corridor</p>
          </div>
        </div>

        {/* Input Box */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Train Number (e.g. 12711), Name (e.g. Pinakini), Origin, or Destination..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Popular:</span>
          {quickSearches.map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {chip}
            </button>
          ))}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-rose-400 hover:underline ml-auto"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Filter */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Showing <strong className="text-blue-400">{filtered.length}</strong> trains found
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none"
          >
            <option value="ALL">All Train Types</option>
            <option value="Express">Express</option>
            <option value="Superfast">Superfast</option>
            <option value="Vande Bharat">Vande Bharat</option>
            <option value="Passenger">Passenger / Local</option>
          </select>
        </div>
      </div>

      {/* Train Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((train) => {
          const isDanger = train.safety_zone === 'WARNING' || train.safety_zone === 'CRITICAL';
          return (
            <div
              key={train.train_number}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition hover:border-slate-700 ${
                isDanger ? 'border-red-900/60 bg-red-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-blue-400">
                        {train.train_number}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100">{train.train_name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <span>{train.origin_station.split(' ')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{train.destination_station.split(' ')[0]}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {train.train_type}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/60 rounded-lg p-2.5 my-4 text-center border border-slate-700/60">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Distance to OGL
                    </span>
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        isDanger ? 'text-red-400' : 'text-slate-200'
                      }`}
                    >
                      {train.distance_from_bridge_km.toFixed(1)} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Current Speed
                    </span>
                    <span className="text-sm font-extrabold font-mono text-slate-200">
                      {train.current_speed_kmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      ETA Ongole
                    </span>
                    <span className="text-sm font-extrabold font-mono text-emerald-400">
                      {train.eta_ongole}
                    </span>
                  </div>
                </div>

                {/* Location context */}
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>
                      Current: <strong className="text-slate-200">{train.current_station}</strong> • Next: <strong className="text-slate-200">{train.next_station}</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Platform: {train.platform_assigned} • Direction: {train.direction_of_travel === 'DOWN' ? 'Down (To Vijayawada)' : 'Up (To Chennai)'}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase ${
                    isDanger ? 'text-red-400 animate-pulse' : 'text-slate-400'
                  }`}
                >
                  {isDanger ? '⚠️ Safety Threshold Breached' : 'Corridor Monitoring Active'}
                </span>
                <button
                  onClick={() => handleTrack(train)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition active:scale-95"
                >
                  Track Live Train
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
