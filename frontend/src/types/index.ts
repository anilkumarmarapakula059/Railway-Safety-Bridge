export type TrainType =
  | 'Passenger / Local'
  | 'Express'
  | 'Superfast Express'
  | 'Vande Bharat Express'
  | 'Freight / Goods';

export type FreshnessStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';
export type Direction = 'UP' | 'DOWN';
export type SafetyZone = 'SAFE' | 'APPROACHING' | 'WARNING' | 'CRITICAL' | 'PASSED';

export interface StationHalt {
  station_code: string;
  station_name: string;
  arrival_time: string;
  departure_time: string;
  distance_km: number;
  platform?: string;
  halt_minutes: number;
  latitude: number;
  longitude: number;
  is_completed?: boolean;
  is_current?: boolean;
}

export interface Train {
  train_number: string;
  train_name: string;
  train_type: TrainType;
  origin_station: string;
  destination_station: string;
  current_latitude: number;
  current_longitude: number;
  current_station: string;
  previous_station: string;
  next_station: string;
  eta_ongole: string;
  etd_ongole: string;
  current_speed_kmh: number;
  distance_from_bridge_km: number;
  direction_of_travel: Direction;
  platform_assigned: string;
  last_updated: string;
  freshness_status: FreshnessStatus;
  safety_zone: SafetyZone;
  is_approaching: boolean;
  route?: StationHalt[];
}

export type BridgeState =
  | 'SAFE_OPEN'
  | 'TRAIN_APPROACHING'
  | 'WARNING'
  | 'CLOSURE_REQUESTED'
  | 'CLOSING'
  | 'CLOSED'
  | 'TRAIN_PASSING'
  | 'SAFE_TO_OPEN'
  | 'OPENING'
  | 'FAULT'
  | 'EMERGENCY_STOP'
  | 'MANUAL_OVERRIDE';

export type BridgeCommandType = 'OPEN' | 'CLOSE' | 'STOP' | 'EMERGENCY_STOP' | 'LOCK' | 'RESET_FAULT';
export type CommandSource = 'AUTO_SAFETY_ENGINE' | 'OPERATOR_MANUAL' | 'ADMIN_OVERRIDE' | 'ESP32_HARDWARE';
export type AckStatus = 'PENDING' | 'ACK_SUCCESS' | 'REJECTED_UNSAFE' | 'TIMEOUT' | 'FAILED';
export type MotorStatus = 'IDLE' | 'EXTENDING' | 'RETRACTING' | 'BRAKED' | 'OVERCURRENT';
export type ESP32ConnectionStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface BridgeCommand {
  command_id: string;
  timestamp: string;
  command_type: BridgeCommandType;
  source: CommandSource;
  authorization: string;
  current_bridge_state: BridgeState;
  acknowledgement_status: AckStatus;
  details?: string;
}

export interface BridgeStatus {
  state: BridgeState;
  position_pct: number;
  motor_status: MotorStatus;
  esp32_status: ESP32ConnectionStatus;
  last_command?: BridgeCommand;
  last_acknowledgement?: string;
  emergency_status: boolean;
  lock_engaged: boolean;
  pedestrian_crossing_active: boolean;
  active_threat_train?: string;
  threat_distance_km?: number;
  last_state_change: string;
}

export interface ESP32Telemetry {
  device_id: string;
  firmware_version: string;
  ip_address: string;
  wifi_rssi_dbm: number;
  free_heap_kb: number;
  uptime_seconds: number;
  position_pct: number;
  limit_switch_extended: boolean;
  limit_switch_retracted: boolean;
  motor_current_amps: number;
  supply_voltage: number;
  enclosure_temp_c: number;
  obstacle_detected_radar: boolean;
  emergency_button_depressed: boolean;
  connection_status: ESP32ConnectionStatus;
  last_heartbeat: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'FAULT';

export interface SafetyAlert {
  alert_id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  train_number?: string;
  train_name?: string;
  distance_km?: number;
  threshold_km?: number;
  action_taken: string;
  bridge_state: string;
  is_active: boolean;
  acknowledged: boolean;
  acknowledged_by?: string;
}

export interface EventLogEntry {
  event_id: string;
  timestamp: string;
  event_type: string;
  severity: AlertSeverity;
  train_number?: string;
  train_name?: string;
  distance_km?: number;
  bridge_state: string;
  command?: string;
  result: string;
  details: string;
}

export interface ComponentHealth {
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency_ms?: number;
  last_communication: string;
  details: string;
}

export interface SystemHealthOverview {
  overall_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  train_api: ComponentHealth;
  backend_safety_engine: ComponentHealth;
  database: ComponentHealth;
  websocket_service: ComponentHealth;
  esp32_controller: ComponentHealth;
  bridge_actuators: ComponentHealth;
  track_sensors: ComponentHealth;
  optical_crossing_barrier: ComponentHealth;
  active_connections_count: number;
  last_updated: string;
}

export type UserRole = 'PASSENGER' | 'OPERATOR' | 'ADMINISTRATOR';

export interface AuthUser {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
  token: string;
  badge_number?: string;
  permissions: string[];
}
