import React from 'react';
import { TabType } from './Navigation';
import { LayoutDashboard, Search, TrainTrack, Sliders, History, Activity, Cpu } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dash', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'details', label: 'Track', icon: <TrainTrack className="w-4 h-4" /> },
    { id: 'control', label: 'Control', icon: <Sliders className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs', icon: <History className="w-4 h-4" /> },
    { id: 'simulation', label: 'Sim', icon: <Cpu className="w-4 h-4" /> }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex justify-around items-center">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
