import {
  Train,
  BridgeStatus,
  ESP32Telemetry,
  SafetyAlert,
  EventLogEntry,
  SystemHealthOverview,
  AuthUser,
  BridgeCommandType
} from '../types';

const API_BASE = '/api';
export const API_KEY = 'rg_874fe1703f654373bd3fdef5840ad1ee';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
};

export const api = {
  async getTrains(): Promise<Train[]> {
    try {
      const res = await fetch(`${API_BASE}/trains`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },

  async searchTrains(params: {
    train_number?: string;
    train_name?: string;
    from_station?: string;
    to_station?: string;
  }): Promise<Train[]> {
    try {
      const q = new URLSearchParams();
      if (params.train_number) q.append('train_number', params.train_number);
      if (params.train_name) q.append('train_name', params.train_name);
      if (params.from_station) q.append('from_station', params.from_station);
      if (params.to_station) q.append('to_station', params.to_station);
      const res = await fetch(`${API_BASE}/trains/search?${q.toString()}`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getTrainLive(trainNumber: string): Promise<Train | null> {
    try {
      const res = await fetch(`${API_BASE}/trains/${trainNumber}/live`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Train live fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBridgeStatus(): Promise<BridgeStatus | null> {
    try {
      const res = await fetch(`${API_BASE}/bridge/status`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Bridge status fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBridgeTelemetry(): Promise<ESP32Telemetry | null> {
    try {
      const res = await fetch(`${API_BASE}/bridge/telemetry`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Telemetry fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendBridgeCommand(command: BridgeCommandType, userRole: string, force: boolean = false) {
    const res = await fetch(`${API_BASE}/bridge/command`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ command, user_role: userRole, force })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Command execution failed' }));
      throw new Error(err.detail || 'Command failed');
    }
    return await res.json();
  },

  async getAlerts(): Promise<SafetyAlert[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Alerts fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getEventLogs(params?: { event_type?: string; severity?: string; search?: string }): Promise<EventLogEntry[]> {
    try {
      const q = new URLSearchParams();
      if (params?.event_type) q.append('event_type', params.event_type);
      if (params?.severity) q.append('severity', params.severity);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE}/alerts/events?${q.toString()}`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Logs fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getSystemHealth(): Promise<SystemHealthOverview | null> {
    try {
      const res = await fetch(`${API_BASE}/system/health`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Health fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  async runSimulation(action: string, payload: Record<string, unknown> = {}) {
    try {
      const res = await fetch(`${API_BASE}/system/simulate`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ action, ...payload })
      });
      return await res.json();
    } catch (e) {
      console.warn('Simulation API offline:', e);
      return null;
    }
  },

  async login(role: string, username: string = ''): Promise<AuthUser> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ role, username })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      user_id: `USR-${role.slice(0, 3)}-01`,
      username: username || role.toLowerCase(),
      full_name: role === 'PASSENGER' ? 'Public Commuter' : role === 'OPERATOR' ? 'Station Master - Ongole' : 'Divisional Safety Officer (BZA)',
      role: role as any,
      token: `demo_token_${Date.now()}`,
      badge_number: role === 'OPERATOR' ? 'SM-OGL-4819' : role === 'ADMINISTRATOR' ? 'DSO-SCR-9021' : undefined,
      permissions: []
    };
  }
};
