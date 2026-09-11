import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SafetyAlertBanner } from './components/SafetyAlertBanner';
import { BridgeStatusCard } from './components/BridgeStatusCard';
import { FootbridgeDigitalTwin } from './components/FootbridgeDigitalTwin';
import { ApproachingTrainsTable } from './components/ApproachingTrainsTable';
import { LeafletRailMap } from './components/LeafletRailMap';
import { TrainSearch } from './components/TrainSearch';
import { TrainDetailsView } from './components/TrainDetailsView';
import { StaffBridgeControl } from './components/StaffBridgeControl';
import { EventLogTable } from './components/EventLogTable';
import { SystemHealthMatrix } from './components/SystemHealthMatrix';
import { DeveloperSimulationPanel } from './components/DeveloperSimulationPanel';
import { SafetyDisclaimerModal } from './components/SafetyDisclaimerModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const { setSelectedTrain } = useApp();

  const handleSelectTrain = (train: any) => {
    setSelectedTrain(train);
    setActiveTab('details');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 md:pb-6">
      {/* Global Header */}
      <Header onOpenDisclaimer={() => setIsDisclaimerOpen(true)} />

      {/* Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Prominent Safety Alert Banner */}
            <SafetyAlertBanner />

            {/* 2-Column Bridge Status & Digital Twin */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BridgeStatusCard />
              <FootbridgeDigitalTwin />
            </div>

            {/* Live Approaching Trains Table */}
            <ApproachingTrainsTable onSelectTrain={handleSelectTrain} />

            {/* Live Spatial Railway Map */}
            <LeafletRailMap />
          </div>
        )}

        {/* Tab 2: Train Search */}
        {activeTab === 'search' && (
          <TrainSearch onSelectTrain={handleSelectTrain} />
        )}

        {/* Tab 3: Train Details (Where Is My Train style) */}
        {activeTab === 'details' && (
          <TrainDetailsView onBack={() => setActiveTab('dashboard')} />
        )}

        {/* Tab 4: Bridge Control (Railway Staff) */}
        {activeTab === 'control' && <StaffBridgeControl />}

        {/* Tab 5: Event & Safety Logs */}
        {activeTab === 'logs' && <EventLogTable />}

        {/* Tab 6: System Health Diagnostics */}
        {activeTab === 'health' && <SystemHealthMatrix />}

        {/* Tab 7: Developer Simulation Studio */}
        {activeTab === 'simulation' && <DeveloperSimulationPanel />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Safety Disclaimer Modal */}
      <SafetyDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default App;
