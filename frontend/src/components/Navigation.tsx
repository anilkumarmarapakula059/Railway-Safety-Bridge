import React from 'react';
import {
  LayoutDashboard,
  Search,
  TrainTrack,
  Sliders,
  History,
  Activity,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType = 'dashboard' | 'search' | 'details' | 'control' | 'logs' | 'health' | 'simulation';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useApp();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string; staffOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'search', label: 'Train Search', icon: <Search className="w-4 h-4" /> },
    { id: 'details', label: 'Live Tracking', icon: <TrainTrack className="w-4 h-4" /> },
    {
      id: 'control',
      label: 'Bridge Control',
      icon: <Sliders className="w-4 h-4" />,
      badge: user.role === 'PASSENGER' ? 'Staff Only' : undefined,
      staffOnly: true
    },
    { id: 'logs', label: 'Event Logs', icon: <History className="w-4 h-4" /> },
    { id: 'health', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
    { id: 'simulation', label: 'Simulation Studio', icon: <Cpu className="w-4 h-4" />, badge: 'Dev' }
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
