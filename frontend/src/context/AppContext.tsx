import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Train,
  BridgeStatus,
  ESP32Telemetry,
  SafetyAlert,
  EventLogEntry,
  SystemHealthOverview,
  AuthUser,
  UserRole,
  BridgeCommandType,
  FreshnessStatus,
  BridgeState
} from '../types';
import {
  INITIAL_TRAINS,
  INITIAL_BRIDGE_STATUS,
  INITIAL_ESP32_TELEMETRY,
  INITIAL_LOGS,
  INITIAL_HEALTH
} from '../services/mockData';
import { soundEngine } from '../utils/sound';
import { api } from '../services/api';

interface AppContextType {
  user: AuthUser;
  setUserRole: (role: UserRole) => void;
  trains: Train[];
  selectedTrain: Train | null;
  setSelectedTrain: (train: Train | null) => void;
  bridgeStatus: BridgeStatus;
  telemetry: ESP32Telemetry;
  activeAlert: SafetyAlert | null;
  eventLogs: EventLogEntry[];
  health: SystemHealthOverview;
  freshness: FreshnessStatus;
  lastUpdatedTime: string;
  isMuted: boolean;
  toggleMute: () => void;
  currentTime: string;
  // Simulation Controls
  simulatedTrainDistance: number;
  isSimulationPlaying: boolean;
  simulationScenario: string;
  setSimulatedDistance: (km: number) => void;
  toggleSimulationPlay: () => void;
  runScenario: (scenarioName: string) => void;
  resetSimulation: () => void;
  toggleESP32Connection: () => void;
  toggleApiFailure: () => void;
  // Bridge Staff Controls
  dispatchCommand: (cmd: BridgeCommandType, force?: boolean) => Promise<{ success: boolean; message: string }>;
  acknowledgeAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user
  const [user, setUser] = useState<AuthUser>({
    user_id: 'USR-PAS-01',
    username: 'passenger',
    full_name: 'Public Commuter',
    role: 'PASSENGER',
    token: 'token_passenger',
    permissions: ['VIEW_DASHBOARD', 'VIEW_TRAINS', 'SEARCH_TRAINS', 'VIEW_BRIDGE_STATUS']
  });

  const [trains, setTrains] = useState<Train[]>(INITIAL_TRAINS);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(INITIAL_TRAINS[0]);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>(INITIAL_BRIDGE_STATUS);
  const [telemetry, setTelemetry] = useState<ESP32Telemetry>(INITIAL_ESP32_TELEMETRY);
  const [activeAlert, setActiveAlert] = useState<SafetyAlert | null>({
    alert_id: 'ALT-B91A',
    timestamp: new Date().toISOString(),
    severity: 'CRITICAL',
    title: '⚠️ TRAIN APPROACHING SAFETY THRESHOLD',
    message: 'Train 12711 Pinakini Express detected at 4.2 km. Safety threshold is 5.0 km.',
    train_number: '12711',
    train_name: 'Pinakini Express',
    distance_km: 4.2,
    threshold_km: 5.0,
    action_taken: 'BRIDGE CLOSURE INITIATED',
    bridge_state: 'CLOSING',
    is_active: true,
    acknowledged: false
  });
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(INITIAL_LOGS);
  const [health, setHealth] = useState<SystemHealthOverview>(INITIAL_HEALTH);
  const [freshness, setFreshness] = useState<FreshnessStatus>('LIVE');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Simulation state
  const [simulatedTrainDistance, setSimulatedTrainDistance] = useState<number>(4.2);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState<boolean>(false);
  const [simulationScenario, setSimulationScenario] = useState<string>('Express Train 5km Approach');

  const prevAlertState = useRef<string | null>(null);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sound effects on alert change
  useEffect(() => {
    if (activeAlert && activeAlert.is_active && activeAlert.alert_id !== prevAlertState.current) {
      prevAlertState.current = activeAlert.alert_id;
      soundEngine.playBridgeClosureSiren();
    }
  }, [activeAlert]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const setUserRole = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      PASSENGER: 'Public Commuter',
      OPERATOR: 'Station Master - Ongole',
      ADMINISTRATOR: 'Divisional Safety Officer (BZA)'
    };
    const badges: Record<UserRole, string | undefined> = {
      PASSENGER: undefined,
      OPERATOR: 'SM-OGL-4819',
      ADMINISTRATOR: 'DSO-SCR-9021'
    };
    setUser({
      user_id: `USR-${role.slice(0, 3)}-01`,
      username: role.toLowerCase(),
      full_name: roleNames[role],
      role,
      token: `token_${role.toLowerCase()}`,
      badge_number: badges[role],
      permissions: []
    });
  };

  // Internal log writer
  const addLog = useCallback((
    eventType: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'FAULT',
    bridgeState: string,
    details: string,
    trainNum?: string,
    trainName?: string,
    dist?: number,
    cmd?: string,
    result: string = 'SUCCESS'
  ) => {
    const newEntry: EventLogEntry = {
      event_id: `EVT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      severity,
      train_number: trainNum,
      train_name: trainName,
      distance_km: dist,
      bridge_state: bridgeState,
      command: cmd,
      result,
      details
    };
    setEventLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  }, []);

  // Core Safety State Machine Evaluation
  const evaluateSafetyRules = useCallback((dist: number, isExpress: boolean = true) => {
    const threshold = isExpress ? 5.0 : 2.0;

    // Update 12711 in trains list
    setTrains(prev => prev.map(t => {
      if (t.train_number === '12711') {
        const zone = dist > 10 ? 'SAFE' : dist > threshold ? 'APPROACHING' : dist > 0 ? 'WARNING' : dist === 0 ? 'CRITICAL' : 'PASSED';
        return {
          ...t,
          distance_from_bridge_km: dist,
          safety_zone: zone as any,
          current_latitude: 15.5034 - (dist / 111.0),
          current_longitude: 80.0505 - (dist / 111.0) * 0.15,
          eta_ongole: dist <= 0 ? 'At Platform' : `In ${Math.max(1, Math.round((dist / t.current_speed_kmh) * 60))} min`
        };
      }
      return t;
    }));

    // Evaluate bridge state
    if (dist <= threshold && dist > 0) {
      // Breached safety threshold!
      setBridgeStatus(prev => {
        if (prev.state === 'SAFE_OPEN' || prev.state === 'TRAIN_APPROACHING') {
          addLog(
            'WARNING_GENERATED',
            'CRITICAL',
            'CLOSING',
            `Proximity breach: 12711 Pinakini Express detected at ${dist.toFixed(1)} km (Threshold: ${threshold} km). Bridge closure initiated.`,
            '12711',
            'Pinakini Express',
            dist,
            'CMD_CLOSE',
            'ACK_SUCCESS'
          );
          return {
            ...prev,
            state: 'CLOSING',
            motor_status: 'RETRACTING',
            pedestrian_crossing_active: false,
            active_threat_train: '12711 Pinakini Express',
            threat_distance_km: dist,
            last_command: {
              command_id: `CMD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              timestamp: new Date().toISOString(),
              command_type: 'CLOSE',
              source: 'AUTO_SAFETY_ENGINE',
              authorization: 'RULE_PROXIMITY_5KM',
              current_bridge_state: 'CLOSING',
              acknowledgement_status: 'ACK_SUCCESS',
              details: `Auto-closure: Train at ${dist} km <= ${threshold} km`
            }
          };
        }
        return {
          ...prev,
          threat_distance_km: dist
        };
      });

      setActiveAlert({
        alert_id: 'ALT-B91A',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        title: '⚠️ TRAIN APPROACHING SAFETY THRESHOLD',
        message: `Train 12711 (Pinakini Express) is ${dist.toFixed(1)} km from the footbridge. Immediate closure enforced.`,
        train_number: '12711',
        train_name: 'Pinakini Express',
        distance_km: dist,
        threshold_km: threshold,
        action_taken: 'BRIDGE CLOSURE INITIATED',
        bridge_state: 'CLOSING',
        is_active: true,
        acknowledged: false
      });
    } else if (dist <= 0 && dist > -0.8) {
      // Train passing station
      setBridgeStatus(prev => ({
        ...prev,
        state: 'TRAIN_PASSING',
        position_pct: 0,
        motor_status: 'IDLE',
        pedestrian_crossing_active: false,
        active_threat_train: '12711 Pinakini Express',
        threat_distance_km: 0
      }));
      setTelemetry(prev => ({
        ...prev,
        position_pct: 0,
        limit_switch_retracted: true,
        limit_switch_extended: false
      }));
    } else if (dist <= -0.8 || dist > threshold) {
      // Safe to reopen after train has completely passed
      if (dist <= -0.8) {
        setBridgeStatus(prev => {
          if (prev.state === 'TRAIN_PASSING' || prev.state === 'CLOSED') {
            addLog(
              'REOPENING_AUTHORIZED',
              'INFO',
              'OPENING',
              'Train 12711 has cleared station corridor (>0.8km past OGL). Safety engine authorized reopening.',
              '12711',
              'Pinakini Express',
              dist,
              'CMD_OPEN',
              'SUCCESS'
            );
            return {
              ...prev,
              state: 'OPENING',
              motor_status: 'EXTENDING',
              active_threat_train: undefined,
              threat_distance_km: undefined
            };
          }
          return prev;
        });
        setActiveAlert(null);
      }
    }

    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, [addLog]);

  // Smooth position interpolation during CLOSING and OPENING
  useEffect(() => {
    const interval = setInterval(() => {
      setBridgeStatus(prev => {
        if (prev.state === 'CLOSING' && prev.position_pct > 0) {
          const nextPos = Math.max(0, Math.round(prev.position_pct - 15));
          const isFullyClosed = nextPos === 0;
          if (isFullyClosed) {
            addLog('BRIDGE_CLOSED', 'WARNING', 'CLOSED', 'Footbridge fully retracted and locked at Platform 1 bay. Track safe.', '12711', 'Pinakini Express', prev.threat_distance_km, 'CMD_CLOSE', 'SUCCESS');
          }
          setTelemetry(t => ({
            ...t,
            position_pct: nextPos,
            limit_switch_retracted: isFullyClosed,
            limit_switch_extended: false,
            motor_current_amps: isFullyClosed ? 0 : 2.4
          }));
          return {
            ...prev,
            position_pct: nextPos,
            state: isFullyClosed ? 'CLOSED' : 'CLOSING',
            motor_status: isFullyClosed ? 'IDLE' : 'RETRACTING'
          };
        } else if (prev.state === 'OPENING' && prev.position_pct < 100) {
          const nextPos = Math.min(100, Math.round(prev.position_pct + 15));
          const isFullyOpen = nextPos === 100;
          if (isFullyOpen) {
            addLog('BRIDGE_OPENED', 'INFO', 'SAFE_OPEN', 'Footbridge extended across Platform 1 and 2. Passenger green crossing signals active.', undefined, undefined, 0, 'CMD_OPEN', 'SUCCESS');
          }
          setTelemetry(t => ({
            ...t,
            position_pct: nextPos,
            limit_switch_extended: isFullyOpen,
            limit_switch_retracted: false,
            motor_current_amps: isFullyOpen ? 0 : 2.1
          }));
          return {
            ...prev,
            position_pct: nextPos,
            state: isFullyOpen ? 'SAFE_OPEN' : 'OPENING',
            motor_status: isFullyOpen ? 'IDLE' : 'EXTENDING',
            pedestrian_crossing_active: isFullyOpen
          };
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [addLog]);

  // Simulation loop when isSimulationPlaying is active
  useEffect(() => {
    if (!isSimulationPlaying) return;

    const timer = setInterval(() => {
      setSimulatedTrainDistance(prev => {
        const next = Math.round((prev - 0.2) * 10) / 10;
        if (next < -1.5) {
          // Loop back to 10 km
          evaluateSafetyRules(10.0);
          return 10.0;
        }
        evaluateSafetyRules(next);
        return next;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [isSimulationPlaying, evaluateSafetyRules]);

  const setSimulatedDistance = (km: number) => {
    setSimulatedTrainDistance(km);
    evaluateSafetyRules(km);
  };

  const toggleSimulationPlay = () => {
    setIsSimulationPlaying(prev => !prev);
  };

  const runScenario = (scenarioName: string) => {
    setSimulationScenario(scenarioName);
    setIsSimulationPlaying(false);

    if (scenarioName === 'Express Train 5km Approach') {
      setSimulatedDistance(5.5);
      setIsSimulationPlaying(true);
    } else if (scenarioName === 'Local Passenger 2km Approach') {
      setSimulatedDistance(2.5);
      setIsSimulationPlaying(true);
    } else if (scenarioName === 'Emergency Stop Test') {
      dispatchCommand('EMERGENCY_STOP', true);
    } else if (scenarioName === 'ESP32 Disconnect Test') {
      toggleESP32Connection();
    } else if (scenarioName === 'Stale API Data Test') {
      toggleApiFailure();
    }
  };

  const resetSimulation = () => {
    setIsSimulationPlaying(false);
    setSimulatedTrainDistance(4.2);
    setBridgeStatus(INITIAL_BRIDGE_STATUS);
    setTelemetry(INITIAL_ESP32_TELEMETRY);
    setTrains(INITIAL_TRAINS);
    setFreshness('LIVE');
    setHealth(INITIAL_HEALTH);
    setActiveAlert(null);
    addLog('MANUAL_OVERRIDE', 'INFO', 'SAFE_OPEN', 'Simulation reset to baseline state.', undefined, undefined, 0, 'RESET', 'SUCCESS');
  };

  const toggleESP32Connection = () => {
    const isNowOffline = telemetry.connection_status === 'ONLINE';
    const nextStatus = isNowOffline ? 'OFFLINE' : 'ONLINE';
    setTelemetry(prev => ({
      ...prev,
      connection_status: nextStatus
    }));
    setBridgeStatus(prev => ({
      ...prev,
      esp32_status: nextStatus,
      state: isNowOffline ? 'FAULT' : (prev.position_pct === 100 ? 'SAFE_OPEN' : 'CLOSED')
    }));
    setHealth(prev => ({
      ...prev,
      overall_status: isNowOffline ? 'CRITICAL' : 'HEALTHY',
      esp32_controller: {
        ...prev.esp32_controller,
        status: nextStatus,
        details: isNowOffline ? 'Heartbeat timeout! Hardware offline.' : 'Firmware v2.4.1 connected'
      }
    }));
    addLog(
      isNowOffline ? 'ESP32_DISCONNECTED' : 'ESP32_ACK',
      isNowOffline ? 'CRITICAL' : 'INFO',
      isNowOffline ? 'FAULT' : 'SAFE_OPEN',
      isNowOffline ? 'ESP32 Bridge Controller disconnected! Fail-safe locked.' : 'ESP32 Controller reconnected successfully.',
      undefined,
      undefined,
      0,
      'HEARTBEAT_WATCHDOG',
      nextStatus
    );
  };

  const toggleApiFailure = () => {
    const isNowOffline = freshness === 'LIVE';
    const nextStatus: FreshnessStatus = isNowOffline ? 'UNAVAILABLE' : 'LIVE';
    setFreshness(nextStatus);
    setTrains(prev => prev.map(t => ({ ...t, freshness_status: nextStatus })));
    setHealth(prev => ({
      ...prev,
      overall_status: isNowOffline ? 'CRITICAL' : 'HEALTHY',
      train_api: {
        ...prev.train_api,
        status: isNowOffline ? 'OFFLINE' : 'ONLINE',
        details: isNowOffline ? 'CRIS-NTES feed timed out. Data unavailable.' : 'Live feed active'
      }
    }));
    addLog(
      isNowOffline ? 'API_FAILURE' : 'TRAIN_DETECTED',
      isNowOffline ? 'WARNING' : 'INFO',
      bridgeStatus.state,
      isNowOffline ? 'Train location API feed unavailable! Stale protection active. Automatic reopening inhibited.' : 'Train location API connection restored.',
      undefined,
      undefined,
      0,
      'API_WATCHDOG',
      nextStatus
    );
  };

  const acknowledgeAlert = () => {
    if (activeAlert) {
      setActiveAlert(prev => prev ? { ...prev, acknowledged: true, acknowledged_by: user.full_name } : null);
      addLog('WARNING_GENERATED', 'INFO', bridgeStatus.state, `Alert acknowledged by ${user.full_name} (${user.role})`, activeAlert.train_number, activeAlert.train_name, activeAlert.distance_km, 'ACK_ALERT', 'ACKNOWLEDGED');
    }
  };

  const dispatchCommand = async (cmd: BridgeCommandType, force: boolean = false): Promise<{ success: boolean; message: string }> => {
    // Check user authorization
    if (user.role === 'PASSENGER') {
      return { success: false, message: 'Access Denied: Public passengers cannot operate the footbridge.' };
    }

    // Emergency Stop
    if (cmd === 'EMERGENCY_STOP') {
      soundEngine.playEmergencyBuzzer();
      setBridgeStatus(prev => ({
        ...prev,
        state: 'EMERGENCY_STOP',
        motor_status: 'BRAKED',
        emergency_status: true,
        pedestrian_crossing_active: false
      }));
      setTelemetry(prev => ({
        ...prev,
        emergency_button_depressed: true,
        motor_current_amps: 0
      }));
      addLog('EMERGENCY_STOP', 'CRITICAL', 'EMERGENCY_STOP', `EMERGENCY STOP engaged by ${user.full_name}! Mechanical brakes locked.`, undefined, undefined, 0, 'EMERGENCY_STOP', 'SUCCESS');
      return { success: true, message: 'EMERGENCY STOP triggered. Actuators halted immediately.' };
    }

    // Reset Fault
    if (cmd === 'RESET_FAULT') {
      setBridgeStatus(prev => ({
        ...prev,
        emergency_status: false,
        state: prev.position_pct >= 95 ? 'SAFE_OPEN' : 'CLOSED',
        motor_status: 'IDLE'
      }));
      setTelemetry(prev => ({
        ...prev,
        emergency_button_depressed: false,
        obstacle_detected_radar: false
      }));
      addLog('MANUAL_OVERRIDE', 'INFO', 'SAFE_OPEN', `Fault state reset by ${user.full_name}. Bridge returned to monitored status.`, undefined, undefined, 0, 'RESET_FAULT', 'SUCCESS');
      return { success: true, message: 'System fault reset successfully.' };
    }

    // STOP
    if (cmd === 'STOP') {
      setBridgeStatus(prev => ({ ...prev, motor_status: 'IDLE' }));
      addLog('MANUAL_OVERRIDE', 'INFO', bridgeStatus.state, `Bridge motion paused by ${user.full_name}.`, undefined, undefined, 0, 'CMD_STOP', 'SUCCESS');
      return { success: true, message: 'Bridge motion halted.' };
    }

    // CLOSE
    if (cmd === 'CLOSE') {
      setBridgeStatus(prev => ({
        ...prev,
        state: 'CLOSING',
        motor_status: 'RETRACTING',
        pedestrian_crossing_active: false
      }));
      soundEngine.playBridgeClosureSiren();
      addLog('CLOSING_STARTED', 'WARNING', 'CLOSING', `Manual retraction initiated by ${user.full_name}. Warning sirens active.`, undefined, undefined, 0, 'CMD_CLOSE', 'SUCCESS');
      return { success: true, message: 'Retraction sequence started.' };
    }

    // OPEN
    if (cmd === 'OPEN') {
      // Safety Interlock check: Is any train within threshold?
      if (!force) {
        const pinakini = trains.find(t => t.train_number === '12711');
        if (pinakini && pinakini.distance_from_bridge_km <= 5.0 && pinakini.distance_from_bridge_km >= -0.5) {
          return {
            success: false,
            message: `SAFETY INTERLOCK BLOCKED: Train 12711 is approaching at ${pinakini.distance_from_bridge_km} km (Safety Threshold: 5.0 km). Opening footbridge is strictly forbidden!`
          };
        }
      }

      setBridgeStatus(prev => ({
        ...prev,
        state: 'OPENING',
        motor_status: 'EXTENDING'
      }));
      addLog('OPENING_STARTED', 'INFO', 'OPENING', `Manual extension authorized by ${user.full_name}.`, undefined, undefined, 0, 'CMD_OPEN', 'SUCCESS');
      return { success: true, message: 'Extension sequence started towards Platform 2.' };
    }

    return { success: false, message: 'Unknown command' };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUserRole,
        trains,
        selectedTrain,
        setSelectedTrain,
        bridgeStatus,
        telemetry,
        activeAlert,
        eventLogs,
        health,
        freshness,
        lastUpdatedTime,
        isMuted,
        toggleMute,
        currentTime,
        simulatedTrainDistance,
        isSimulationPlaying,
        simulationScenario,
        setSimulatedDistance,
        toggleSimulationPlay,
        runScenario,
        resetSimulation,
        toggleESP32Connection,
        toggleApiFailure,
        dispatchCommand,
        acknowledgeAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
