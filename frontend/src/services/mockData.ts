import { Train, BridgeStatus, ESP32Telemetry, EventLogEntry, SystemHealthOverview } from '../types';

export const INITIAL_TRAINS: Train[] = [
  {
    train_number: '12711',
    train_name: 'Pinakini Express',
    train_type: 'Express',
    origin_station: 'Chennai Central (MAS)',
    destination_station: 'Vijayawada Jn (BZA)',
    current_latitude: 15.466,
    current_longitude: 80.046,
    current_station: 'Singarayakonda (SKM)',
    previous_station: 'Nellore (NLR)',
    next_station: 'Ongole (OGL)',
    eta_ongole: '18:18 IST',
    etd_ongole: '18:20 IST',
    current_speed_kmh: 88,
    distance_from_bridge_km: 4.2,
    direction_of_travel: 'DOWN',
    platform_assigned: 'Platform 1',
    last_updated: new Date().toISOString(),
    freshness_status: 'LIVE',
    safety_zone: 'WARNING',
    is_approaching: true,
    route: [
      { station_code: 'MAS', station_name: 'Chennai Central', arrival_time: '14:10', departure_time: '14:10', distance_km: 0, latitude: 13.0827, longitude: 80.2707, is_completed: true, halt_minutes: 0 },
      { station_code: 'GDR', station_name: 'Gudur Jn', arrival_time: '16:18', departure_time: '16:20', distance_km: 138, latitude: 14.1463, longitude: 79.8504, is_completed: true, halt_minutes: 2 },
      { station_code: 'NLR', station_name: 'Nellore', arrival_time: '16:48', departure_time: '16:50', distance_km: 176, latitude: 14.4426, longitude: 79.9865, is_completed: true, halt_minutes: 2 },
      { station_code: 'SKM', station_name: 'Singarayakonda', arrival_time: '17:48', departure_time: '17:50', distance_km: 255, latitude: 15.25, longitude: 80.03, is_completed: true, is_current: true, halt_minutes: 2 },
      { station_code: 'OGL', station_name: 'Ongole', arrival_time: '18:18', departure_time: '18:20', distance_km: 292, platform: '1', latitude: 15.5034, longitude: 80.0505, halt_minutes: 2 },
      { station_code: 'CLX', station_name: 'Chirala', arrival_time: '18:58', departure_time: '19:00', distance_km: 342, latitude: 15.8246, longitude: 80.3521, halt_minutes: 2 },
      { station_code: 'BPP', station_name: 'Bapatla', arrival_time: '19:13', departure_time: '19:15', distance_km: 357, latitude: 15.9042, longitude: 80.4674, halt_minutes: 2 },
      { station_code: 'TEL', station_name: 'Tenali Jn', arrival_time: '19:53', departure_time: '19:55', distance_km: 400, latitude: 16.2436, longitude: 80.6401, halt_minutes: 2 },
      { station_code: 'BZA', station_name: 'Vijayawada Jn', arrival_time: '20:45', departure_time: '20:45', distance_km: 431, latitude: 16.5186, longitude: 80.62, halt_minutes: 0 }
    ]
  },
  {
    train_number: '07576',
    train_name: 'GNT - TPTY Express Special',
    train_type: 'Passenger / Local',
    origin_station: 'Guntur Jn (GNT)',
    destination_station: 'Tirupati (TPTY)',
    current_latitude: 15.518,
    current_longitude: 80.054,
    current_station: 'Ammanabrolu (ANB)',
    previous_station: 'Chirala (CLX)',
    next_station: 'Ongole (OGL)',
    eta_ongole: '17:35 IST',
    etd_ongole: '17:40 IST',
    current_speed_kmh: 42,
    distance_from_bridge_km: 1.8,
    direction_of_travel: 'UP',
    platform_assigned: 'Platform 2',
    last_updated: new Date().toISOString(),
    freshness_status: 'LIVE',
    safety_zone: 'WARNING',
    is_approaching: true,
    route: [
      { station_code: 'GNT', station_name: 'Guntur Jn', arrival_time: '15:30', departure_time: '15:30', distance_km: 0, latitude: 16.2997, longitude: 80.4417, is_completed: true, halt_minutes: 0 },
      { station_code: 'CLX', station_name: 'Chirala', arrival_time: '16:45', departure_time: '16:47', distance_km: 70, latitude: 15.8246, longitude: 80.3521, is_completed: true, halt_minutes: 2 },
      { station_code: 'ANB', station_name: 'Ammanabrolu', arrival_time: '17:15', departure_time: '17:16', distance_km: 98, latitude: 15.62, longitude: 80.12, is_completed: true, is_current: true, halt_minutes: 1 },
      { station_code: 'OGL', station_name: 'Ongole', arrival_time: '17:35', departure_time: '17:40', distance_km: 116, platform: '2', latitude: 15.5034, longitude: 80.0505, halt_minutes: 5 },
      { station_code: 'SKM', station_name: 'Singarayakonda', arrival_time: '18:10', departure_time: '18:12', distance_km: 145, latitude: 15.25, longitude: 80.03, halt_minutes: 2 },
      { station_code: 'TPTY', station_name: 'Tirupati', arrival_time: '21:15', departure_time: '21:15', distance_km: 302, latitude: 13.6288, longitude: 79.4192, halt_minutes: 0 }
    ]
  },
  {
    train_number: '20677',
    train_name: 'Chennai - Vijayawada Vande Bharat',
    train_type: 'Vande Bharat Express',
    origin_station: 'Chennai Central (MAS)',
    destination_station: 'Vijayawada Jn (BZA)',
    current_latitude: 15.34,
    current_longitude: 80.01,
    current_station: 'Kavali (KVZ)',
    previous_station: 'Nellore (NLR)',
    next_station: 'Ongole (OGL)',
    eta_ongole: '18:45 IST',
    etd_ongole: '18:47 IST',
    current_speed_kmh: 120,
    distance_from_bridge_km: 18.5,
    direction_of_travel: 'DOWN',
    platform_assigned: 'Platform 1',
    last_updated: new Date().toISOString(),
    freshness_status: 'LIVE',
    safety_zone: 'SAFE',
    is_approaching: true
  },
  {
    train_number: '12604',
    train_name: 'Chennai Express',
    train_type: 'Superfast Express',
    origin_station: 'Hyderabad (HYB)',
    destination_station: 'Chennai Central (MAS)',
    current_latitude: 15.78,
    current_longitude: 80.29,
    current_station: 'Bapatla (BPP)',
    previous_station: 'Tenali Jn (TEL)',
    next_station: 'Chirala (CLX)',
    eta_ongole: '19:15 IST',
    etd_ongole: '19:20 IST',
    current_speed_kmh: 105,
    distance_from_bridge_km: 34.0,
    direction_of_travel: 'UP',
    platform_assigned: 'Platform 2',
    last_updated: new Date().toISOString(),
    freshness_status: 'LIVE',
    safety_zone: 'SAFE',
    is_approaching: false
  }
];

export const INITIAL_BRIDGE_STATUS: BridgeStatus = {
  state: 'CLOSING',
  position_pct: 35.0,
  motor_status: 'RETRACTING',
  esp32_status: 'ONLINE',
  last_command: {
    command_id: 'CMD-A984',
    timestamp: new Date().toISOString(),
    command_type: 'CLOSE',
    source: 'AUTO_SAFETY_ENGINE',
    authorization: 'RULE_PROXIMITY_5KM',
    current_bridge_state: 'CLOSING',
    acknowledgement_status: 'ACK_SUCCESS',
    details: 'Auto-retract initiated: 12711 Pinakini Exp within 5km'
  },
  last_acknowledgement: new Date().toISOString(),
  emergency_status: false,
  lock_engaged: false,
  pedestrian_crossing_active: false,
  active_threat_train: '12711 Pinakini Express',
  threat_distance_km: 4.2,
  last_state_change: new Date().toISOString()
};

export const INITIAL_ESP32_TELEMETRY: ESP32Telemetry = {
  device_id: 'ESP32_OGL_BRIDGE_01',
  firmware_version: 'v2.4.1-PROD',
  ip_address: '192.168.1.145',
  wifi_rssi_dbm: -58,
  free_heap_kb: 184,
  uptime_seconds: 86420,
  position_pct: 35.0,
  limit_switch_extended: false,
  limit_switch_retracted: false,
  motor_current_amps: 2.38,
  supply_voltage: 24.1,
  enclosure_temp_c: 34.5,
  obstacle_detected_radar: false,
  emergency_button_depressed: false,
  connection_status: 'ONLINE',
  last_heartbeat: new Date().toISOString()
};

export const INITIAL_LOGS: EventLogEntry[] = [
  {
    event_id: 'EVT-9021A',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    event_type: 'CLOSURE_COMMAND_SENT',
    severity: 'CRITICAL',
    train_number: '12711',
    train_name: 'Pinakini Express',
    distance_km: 4.2,
    bridge_state: 'CLOSING',
    command: 'CMD_CLOSE',
    result: 'ACK_SUCCESS',
    details: 'Automatic closure command dispatched to ESP32. Warning strobe activated.'
  },
  {
    event_id: 'EVT-9020F',
    timestamp: new Date(Date.now() - 32000).toISOString(),
    event_type: 'ZONE_ENTERED_5KM',
    severity: 'WARNING',
    train_number: '12711',
    train_name: 'Pinakini Express',
    distance_km: 4.9,
    bridge_state: 'SAFE_OPEN',
    command: 'ALERT_EVAL',
    result: 'TRIGGERED',
    details: 'Express train breached 5.0 km safety threshold at 88 km/h.'
  },
  {
    event_id: 'EVT-9019B',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    event_type: 'TRAIN_DETECTED',
    severity: 'INFO',
    train_number: '12711',
    train_name: 'Pinakini Express',
    distance_km: 8.5,
    bridge_state: 'SAFE_OPEN',
    command: 'AUTO_TRACK',
    result: 'TRACKING',
    details: 'Train acquired on Down line approach vector.'
  },
  {
    event_id: 'EVT-9018C',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    event_type: 'BRIDGE_OPENED',
    severity: 'INFO',
    distance_km: 0,
    bridge_state: 'SAFE_OPEN',
    command: 'CMD_OPEN',
    result: 'SUCCESS',
    details: 'Footbridge extended across Platform 1 and Platform 2. Safe pedestrian crossing active.'
  }
];

export const INITIAL_HEALTH: SystemHealthOverview = {
  overall_status: 'HEALTHY',
  train_api: {
    name: 'CRIS / NTES Train Location Gateway',
    status: 'ONLINE',
    latency_ms: 38,
    last_communication: new Date().toISOString(),
    details: 'Live feed active, 4 trains tracked'
  },
  backend_safety_engine: {
    name: 'Ongole Safety Decision Engine',
    status: 'ONLINE',
    latency_ms: 3,
    last_communication: new Date().toISOString(),
    details: 'Failsafe rules active, 10Hz loop'
  },
  database: {
    name: 'Audit Event Store',
    status: 'ONLINE',
    latency_ms: 1,
    last_communication: new Date().toISOString(),
    details: 'SQLite storage synchronized'
  },
  websocket_service: {
    name: 'Real-Time WebSocket Hub',
    status: 'ONLINE',
    latency_ms: 1,
    last_communication: new Date().toISOString(),
    details: 'Subscribers active, zero drops'
  },
  esp32_controller: {
    name: 'ESP32 Industrial Microcontroller',
    status: 'ONLINE',
    latency_ms: 14,
    last_communication: new Date().toISOString(),
    details: 'Firmware v2.4.1, WiFi RSSI: -58 dBm'
  },
  bridge_actuators: {
    name: 'Dual Linear Servo Actuators',
    status: 'ONLINE',
    last_communication: new Date().toISOString(),
    details: 'Current draw: 2.38A, Retracting'
  },
  track_sensors: {
    name: 'Dual Track Axle Counters',
    status: 'ONLINE',
    latency_ms: 8,
    last_communication: new Date().toISOString(),
    details: 'Radar beams armed, Track 1 & 2'
  },
  optical_crossing_barrier: {
    name: 'Pedestrian Light Curtains',
    status: 'ONLINE',
    latency_ms: 5,
    last_communication: new Date().toISOString(),
    details: 'Barriers lowered, warning strobes ON'
  },
  active_connections_count: 3,
  last_updated: new Date().toISOString()
};
