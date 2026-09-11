# RAILSAFE – Automatic Footbridge Control System
### IoT-Enabled Retractable Railway Footbridge Safety System
**Ongole Railway Station (OGL)** • South Central Railway (SCR), Vijayawada Division, Andhra Pradesh, India

---

## 🌟 Executive Overview
**RAILSAFE** is a production-quality, mobile-responsive web application and fail-safe safety decision architecture designed for the automated retractable footbridge connecting **Platform 1 (Platform A)** and **Platform 2/3 Island (Platform B)** at Ongole Railway Station (`15.5034° N, 80.0505° E`).

### Core Safety Concept
1. **Normal State (`SAFE_OPEN`)**: When no approaching train is detected within the safety boundary, the motorized telescopic footbridge is extended across the double electrified tracks (broad-gauge), with green pedestrian crossing walk signals illuminated.
2. **Train Detection & Threshold Breach**: When an approaching train on the Vijayawada–Chennai main line reaches the configured proximity threshold:
   - **Express / Superfast / Vande Bharat Trains**: Default threshold = **5.0 km** (~88–130 km/h approach speed).
   - **Passenger / Local Trains**: Default threshold = **2.0 km** (~40–60 km/h approach speed).
3. **Automated Safety Sequence**:
   - High-priority audible and visual warning alarms engage.
   - Pedestrian crossing gates and signals lock red.
   - Signed `CMD_CLOSE` is dispatched to the ESP32 industrial bridge controller.
   - Linear actuators retract the bridge span completely into the safe recess bay at Platform 1 (`100% ➔ 0%`).
   - Retracted limit switch (LS1) verifies the bridge is stowed and the track corridor is unobstructed.
4. **Train Passing & Corridor Clearance**:
   - The bridge remains locked in `CLOSED` or `TRAIN_PASSING` while the train is in the platform track area (`0 km`).
   - Only after the train's rear end clears the post-station buffer boundary (`>0.8 km`) and track radar sensors confirm clearance does the backend safety engine authorize `CMD_OPEN` to restore the bridge.
5. **Fail-Safe Invariant**: Safety decisions are enforced exclusively by the backend safety engine and IoT hardware limit switches. The frontend interface never controls physical motors directly.

---

## 🚀 Quick Start Guide

### Option 1: Instant Zero-Install Browser Launch (Recommended)
You can launch and explore the full application immediately without installing any packages or running terminal commands:
1. Navigate to the project root: `c:\Users\KOTHANARENDRA\OneDrive\Desktop\Rail\`
2. Double-click **`index.html`** or right-click and open with **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari**.
3. The complete application will load with real-time Leaflet maps, Web Audio API sirens, simulated ESP32 WebSockets/REST, realistic Ongole train tracking, "Where Is My Train" UI, digital twin bridge animation, role switching, safety state machine, audit logs, and developer simulation studio.

### Option 2: Full-Stack Modular Launch

#### 1. Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
* Backend starts at `http://localhost:8000`
* Interactive API Documentation (Swagger): `http://localhost:8000/docs`
* Real-Time WebSocket Endpoint: `ws://localhost:8000/ws`

#### 2. Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
* Frontend starts at `http://localhost:3000`

---

## 🔑 Live Train Location API Key Integration
The project is configured with the active API key:
- **API Key**: `rg_874fe1703f654373bd3fdef5840ad1ee`
- **Header**: `X-API-Key: rg_874fe1703f654373bd3fdef5840ad1ee`
- **Config Location (Backend)**: `backend/app/config.py` (`api_key: str = os.getenv("TRAIN_API_KEY", "rg_874fe1703f654373bd3fdef5840ad1ee")`)
- **Frontend Integration**: Automatically included in all outgoing telemetry and search requests in `frontend/src/services/api.ts` and `index.html`.
- **IoT Firmware (ESP32)**: Configured in `esp32/rail_bridge_controller.ino` (`AUTH_TOKEN = "rg_874fe1703f654373bd3fdef5840ad1ee"`).
- **Diagnostics UI**: View the live API connection card under the **System Health** tab on `http://localhost:3000/`.

---

## 📁 Repository Structure

```
Rail/
├── index.html                           # Standalone zero-install interactive web application
├── README.md                            # Comprehensive system documentation
│
├── backend/                             # Production FastAPI Backend & Safety Engine
│   ├── app/
│   │   ├── config.py                    # Station geofence, default thresholds (2km/5km), JWT
│   │   ├── main.py                      # FastAPI app, CORS, WebSocket hub, background worker
│   │   ├── models/
│   │   │   ├── train.py                 # Train, StationHalt, FreshnessStatus models
│   │   │   ├── bridge.py                # BridgeState, BridgeCommand, ESP32Telemetry models
│   │   │   └── alert.py                 # SafetyAlert, EventLogEntry, SystemHealthOverview
│   │   ├── services/
│   │   │   ├── geo_utils.py             # Haversine distance and bearing calculation
│   │   │   ├── safety_engine.py         # Deterministic safety state machine & threshold rules
│   │   │   ├── train_tracker.py         # Real-time train tracking service & timetable
│   │   │   ├── bridge_controller.py     # ESP32 actuator controller, limit switches, locks
│   │   │   └── event_logger.py          # Sequential tamper-evident audit trail service
│   │   ├── websocket/
│   │   │   └── hub.py                   # Real-time WebSocket connection manager
│   │   └── api/
│   │       ├── auth.py                  # Role-based access control (Passenger, Operator, Admin)
│   │       ├── trains.py                # GET /api/trains, /api/trains/search, /api/trains/{id}/live
│   │       ├── bridge.py                # GET /api/bridge/status, POST /api/bridge/command
│   │       ├── alerts.py                # GET /api/alerts, POST /api/alerts/{id}/acknowledge
│   │       └── system.py                # GET /api/system/health, POST /api/system/simulate
│   ├── requirements.txt
│   └── run.py                           # Backend entrypoint runner
│
├── esp32/                               # Industrial IoT Microcontroller Firmware
│   └── rail_bridge_controller.ino       # ESP32 C++ firmware with WiFi, REST/MQTT telemetry,
│                                        # limit switch interrupts, and fail-safe solenoid brakes
│
└── frontend/                            # Modern Modular React + TypeScript Frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── types/index.ts               # Complete TypeScript interfaces
        ├── utils/
        │   ├── geo.ts                   # Haversine distance calculations
        │   └── sound.ts                 # Web Audio API railway siren & chime synthesizer
        ├── services/
        │   ├── api.ts                   # REST API service client with fallback handling
        │   └── mockData.ts              # Realistic train timetable for Ongole corridor
        ├── context/AppContext.tsx       # Unified React Context with safety state machine
        ├── components/
        │   ├── Header.tsx               # Station branding, live clock, freshness badge, role switcher
        │   ├── Navigation.tsx           # Tab navigation
        │   ├── SafetyAlertBanner.tsx    # High-priority strobe alert banner
        │   ├── BridgeStatusCard.tsx     # Live telemetry, extension position bar, limit switches
        │   ├── FootbridgeDigitalTwin.tsx# Animated SVG/CSS cross-section with moving span
        │   ├── ApproachingTrainsTable.tsx # Incoming trains with speeds, ETAs, and zone badges
        │   ├── LeafletRailMap.tsx       # Leaflet map with 2km (amber) & 5km (red) safety rings
        │   ├── TrainSearch.tsx          # "Where Is My Train" search with popular chips
        │   ├── TrainDetailsView.tsx     # Route timeline with halts & speed gauge
        │   ├── StaffBridgeControl.tsx   # Operator manual controls with confirmation modal & E-STOP
        │   ├── EventLogTable.tsx        # Audit trail with filters & CSV export
        │   ├── SystemHealthMatrix.tsx   # Component diagnostics & fail-safe fault injectors
        │   ├── DeveloperSimulationPanel.tsx # 10km->0km approach slider & ESP32 serial console
        │   ├── SafetyDisclaimerModal.tsx# Academic prototype vs. SIL-4 certification disclaimer
        │   └── MobileBottomNav.tsx      # Mobile thumb navigation bar
        ├── App.tsx                      # Root application component
        ├── main.tsx                     # React DOM bootstrap
        └── index.css                    # Tailwind directives and dark railway theme
```

---

## 🛡️ Safety State Machine Transitions

```
 [SAFE_OPEN] (Bridge Extended 100%, Green signals, crossing active)
      │
      ▼ (Train enters 10km corridor)
 [TRAIN_APPROACHING] (Speed monitoring, ETA recalculation)
      │
      ▼ (Train breaches proximity threshold: 5km Express / 2km Local)
   [WARNING] (Audible siren, flashing strobes, pedestrian gates close)
      │
      ▼
 [CLOSURE_REQUESTED] (Signed CMD_CLOSE sent to ESP32)
      │
      ▼ (ESP32 acknowledges, linear actuators engage)
   [CLOSING] (Retracting span 100% ➔ 0%)
      │
      ▼ (Retracted limit switch LS1 trips)
   [CLOSED] (Span stowed in Platform 1 bay, solenoid lock engaged)
      │
      ▼ (Train traversing station platforms: 0 km)
 [TRAIN_PASSING] (Strict lock, manual open commands prohibited)
      │
      ▼ (Train rear clears buffer zone: >0.8 km past OGL)
 [SAFE_TO_OPEN] (Corridor verified clear by track radar)
      │
      ▼ (Signed CMD_OPEN sent to ESP32)
   [OPENING] (Actuators extending span 0% ➔ 100%)
      │
      ▼ (Extended limit switch LS2 trips)
  [SAFE_OPEN] (Safe crossing restored for passengers)
```

Special Failure States:
- **`EMERGENCY_STOP`**: Immediate mechanical brake lock triggered manually or via physical mushroom switch.
- **`FAULT`**: Limit switch mismatch, motor overcurrent (>3.5A), or obstacle detected during motion.
- **`MANUAL_OVERRIDE`**: Authorized railway staff manual jogging with dual confirmation.

---

## 🔒 Role-Based Access Control (RBAC)

| Feature | Passenger (Default) | Railway Operator | Administrator |
| :--- | :---: | :---: | :---: |
| View Dashboard & Bridge Status | ✅ | ✅ | ✅ |
| View Live Train Tracking & Map | ✅ | ✅ | ✅ |
| Search Train Schedules ("Where Is My Train") | ✅ | ✅ | ✅ |
| Receive High-Priority Safety Alerts | ✅ | ✅ | ✅ |
| Acknowledge Active Alerts | ❌ | ✅ | ✅ |
| Manual Bridge Actuation (`OPEN`, `CLOSE`, `STOP`) | ❌ | ✅ (with interlocks) | ✅ |
| Emergency Hardware Stop | ❌ | ✅ | ✅ |
| Configure Proximity Thresholds (2km / 5km) | ❌ | ❌ | ✅ |
| Export Full Audit Logs to CSV | ❌ | ✅ | ✅ |
| Inject Fail-Safe Faults | ❌ | ❌ | ✅ |

*Note: Use the Role Switcher in the top header to instantly switch roles during evaluation.*

---

## 🧪 Simulation Testing Scenarios

1. **Express Train Approach Sequence**:
   - Go to **Simulation Studio** tab.
   - Click **"Execute Scenario: Express Train 5km Approach"**.
   - Notice the train moving from 5.5 km towards 4.2 km.
   - At 5.0 km: High-priority warning siren plays, alert banner flashes, bridge transitions from `SAFE_OPEN` ➔ `CLOSING` ➔ `CLOSED`.
2. **Passenger Train Approach Sequence**:
   - Execute **"Local Passenger 2km Approach"**.
   - The bridge remains `SAFE_OPEN` between 5.0 km and 2.1 km.
   - At 2.0 km: The closure sequence initiates automatically.
3. **Safety Interlock Verification**:
   - While train distance is `< 5.0 km`, switch role to **Railway Operator**, navigate to **Bridge Control**, and try clicking **OPEN / EXTEND BRIDGE**.
   - The safety interlock rejects the command, alerting you that manual extension is forbidden while a train is in the danger zone.
4. **Hardware Disconnect Test**:
   - Go to **System Health** tab and click **"Toggle ESP32 Disconnect"**.
   - Observe immediate fail-safe lock, `ESP32: OFFLINE` alert, and data freshness warning.
5. **Emergency Stop Test**:
   - Click the prominent red **EMERGENCY STOP** button.
   - High-frequency buzzer pulses, actuators halt immediately, and status displays `EMERGENCY STOPPED`.

---

## 📜 Safety & Academic Disclaimer
*This project is an academic engineering prototype. Operational railway deployment requires formal CENELEC SIL-4 / Indian Railways RDSO fail-safe electronic interlocking certification, redundant track circuits, and independent signalling authority approval.*
