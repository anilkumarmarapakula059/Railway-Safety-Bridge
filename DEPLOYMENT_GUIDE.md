# Complete Deployment Guide: RAILSAFE
### Deploying Frontend to Vercel, Backend to Render, and ESP32 Microcontroller

This guide provides step-by-step instructions to deploy all three components of the **RAILSAFE Automatic Retractable Railway Footbridge System**:
1. **Frontend**: Deployed to **Vercel** (Global CDN, fast static React + Vite hosting)
2. **Backend**: Deployed to **Render** (FastAPI, Python Web Service with WebSockets)
3. **IoT Controller**: Flashed to **ESP32** (Arduino / C++ firmware communicating securely over HTTPS/TLS)

---

## 🏗️ Architecture Overview

```
   ┌─────────────────────────────────────────────────┐
   │            Frontend (Vercel)                    │
   │  URL: https://your-project.vercel.app           │
   │  - React 18, TypeScript, Tailwind, Leaflet      │
   └───────────────┬─────────────────▲───────────────┘
                   │ HTTPS API       │ WSS WebSockets
                   ▼                 │
   ┌─────────────────────────────────┴───────────────┐
   │             Backend (Render)                    │
   │  URL: https://your-backend.onrender.com         │
   │  - FastAPI, Python 3.11, Safety Engine          │
   │  - API Key: rg_874fe1703f654373bd3fdef5840ad1ee │
   └───────────────────────▲─────────────────────────┘
                           │ HTTPS POST /api/bridge/esp32/heartbeat
                           │ (Header: X-API-Key)
   ┌───────────────────────┴─────────────────────────┐
   │       IoT Microcontroller (ESP32)               │
   │  - Linear Servo Actuators (IN1, IN2, PWM)       │
   │  - Limit Switches (LS1 Retracted, LS2 Extended) │
   │  - Emergency Stop Button (Mushroom Interrupt)   │
   └─────────────────────────────────────────────────┘
```

---

## 🚀 Part 1: Deploy Backend to Render

### Prerequisites:
- A free account on [Render.com](https://render.com)
- Push your project code to a **GitHub** or **GitLab** repository.

### Step-by-step Instructions:

1. **Log in to Render**:
   - Open [https://dashboard.render.com/](https://dashboard.render.com/).
   - Click the **"New +"** button in the top right and select **"Web Service"**.

2. **Connect GitHub Repository**:
   - Choose **"Build and deploy from a Git repository"** and click **Next**.
   - Connect your GitHub account and select your `Rail` repository.

3. **Configure the Web Service**:
   Fill in the fields exactly as follows:
   - **Name**: `railsafe-backend` (or any unique name you prefer)
   - **Region**: Choose closest to you (e.g., *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Select **Free**

4. **Add Environment Variables**:
   Under the **Environment Variables** section on Render, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `TRAIN_API_KEY` | `rg_874fe1703f654373bd3fdef5840ad1ee` | Your provided active API Key |
   | `RAILSAFE_SECRET_KEY` | `railsafe_secret_jwt_key_ongole_scr_2026` | JWT auth secret |
   | `PYTHON_VERSION` | `3.11.8` | Recommended Python version |

5. **Deploy**:
   - Click **"Create Web Service"**.
   - Render will build and launch your backend container.
   - Once deployment is finished (showing **"Live"** with a green dot), copy your Render URL:
     👉 `https://railsafe-backend.onrender.com`

6. **Verify Backend**:
   - Open `https://your-backend.onrender.com/docs` in your browser.
   - You should see the interactive Swagger OpenAPI documentation for all trains, bridge, and alert endpoints!

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Prerequisites:
- A free account on [Vercel.com](https://vercel.com)

### Step-by-step Instructions:

1. **Log in to Vercel**:
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** ➔ **"Project"**.

2. **Import Git Repository**:
   - Select your GitHub repository and click **Import**.

3. **Configure Project Settings**:
   - **Project Name**: `railsafe-frontend`
   - **Framework Preset**: Select **`Vite`**
   - **Root Directory**:
     - Click **Edit** next to Root Directory.
     - Select the **`frontend`** directory and click **Continue**.
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

4. **Set Environment Variables on Vercel**:
   Expand the **Environment Variables** section and add:
   | Variable Name | Value | Example |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://<YOUR-RENDER-BACKEND-URL>/api` | `https://railsafe-backend.onrender.com/api` |
   | `VITE_WS_URL` | `wss://<YOUR-RENDER-BACKEND-URL>/ws` | `wss://railsafe-backend.onrender.com/ws` |

5. **Deploy**:
   - Click the **Deploy** button.
   - Vercel will build the React application and deploy it to their worldwide edge network in ~30 seconds.
   - Your live website URL will be ready:
     👉 `https://railsafe-frontend.vercel.app`

6. **Verify**:
   - Open your Vercel URL on your mobile phone or desktop.
   - Check the **System Health** tab to confirm live API communication with Render!

---

## ⚡ Part 3: Flash & Deploy the ESP32 Controller

The ESP32 microcontroller drives the physical linear actuators, reads platform limit switches, and pushes 1Hz telemetry to the deployed Render backend over secure HTTPS.

### Hardware Components:
- **ESP32 Dev Module** (ESP32-WROOM-32 or ESP32-S3)
- **Linear Actuator Driver** (L298N / BTS7960 / VFD controller)
- **Micro-USB / USB-C Cable** for flashing
- **2x Microswitch Limit Switches** (LS1 Retracted, LS2 Extended)
- **1x Emergency Stop Pushbutton** (Mushroom NC/NO switch)
- **2x Status LEDs / Relays** (Red Beacon, Green Walk Signal)

### Pin Connections:
| ESP32 GPIO Pin | Connected Component | Purpose |
| :--- | :--- | :--- |
| **GPIO 25** | Motor Driver IN1 | Linear Actuator Extend (Platform 2) |
| **GPIO 26** | Motor Driver IN2 | Linear Actuator Retract (Platform 1) |
| **GPIO 27** | Motor Driver PWM | Actuator Speed Control (0–255) |
| **GPIO 32** | Limit Switch 1 (LS1) | Bridge Fully Retracted (Platform 1 Bay) |
| **GPIO 33** | Limit Switch 2 (LS2) | Bridge Fully Extended (Platform 2 Island) |
| **GPIO 34** | Optical Barrier Sensor | Pedestrian / Obstacle Radar Beam |
| **GPIO 35** | Emergency Stop Button | Hardware Interrupt (Solenoid Brake) |
| **GPIO 18** | Red Strobe Beacon | Warning Alert Horn & Flasher |
| **GPIO 19** | Green Crossing Signal | Pedestrian Safe Walk Signal |

---

### Step-by-Step Flashing Instructions:

1. **Install Arduino IDE**:
   - Download from [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software).

2. **Add ESP32 Board URL in Arduino IDE**:
   - Go to **File ➔ Preferences**.
   - In **Additional Boards Manager URLs**, paste:
     ```text
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Click **OK**.

3. **Install ESP32 Board Package**:
   - Go to **Tools ➔ Board ➔ Boards Manager...**
   - Search for `esp32` and install **esp32 by Espressif Systems**.

4. **Install ArduinoJson Library**:
   - Go to **Sketch ➔ Include Library ➔ Manage Libraries...**
   - Search for `ArduinoJson` (by Benoit Blanchon).
   - Install version **6.x** or **7.x**.

5. **Open the Firmware Code**:
   - In Arduino IDE, open:
     [`c:\Users\KOTHANARENDRA\OneDrive\Desktop\Rail\esp32\rail_bridge_controller.ino`](file:///c:/Users/KOTHANARENDRA/OneDrive/Desktop/Rail/esp32/rail_bridge_controller.ino)

6. **Update Configuration Settings** (lines 25–30):
   ```cpp
   // 1. Enter your local WiFi network credentials:
   const char* WIFI_SSID = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

   // 2. Enter your deployed Render backend URL (from Part 1):
   const char* BACKEND_SERVER = "https://railsafe-backend.onrender.com";

   // 3. Your active API Key (already configured):
   const char* AUTH_TOKEN = "rg_874fe1703f654373bd3fdef5840ad1ee";
   ```

7. **Select Board & Port**:
   - Connect your ESP32 to your PC using the USB data cable.
   - Go to **Tools ➔ Board ➔ ESP32 Arduino ➔ ESP32 Dev Module**.
   - Go to **Tools ➔ Port** and select your COM port (e.g., `COM3`, `COM4`, etc.).

8. **Upload Firmware**:
   - Click the **Upload** button (arrow icon in the top toolbar).
   - *(Note: If the terminal displays `Connecting......`, press and hold the **BOOT** button on your ESP32 board for 2 seconds until flashing begins).*

9. **Verify Serial Output**:
   - Open **Tools ➔ Serial Monitor** and set the baud rate to **115200**.
   - You will see:
     ```text
     [RAILSAFE ESP32] Initializing Ongole Station Footbridge Controller...
     [WiFi] Connecting to Railway Infrastructure Network...
     [WiFi] Connected. IP: 192.168.1.145
     [ESP32 Telemetry] Heartbeat sent to Render. Response: 200
     ```

10. **Test Live System**:
    - Open your deployed Vercel frontend in your browser.
    - Check the top header: the **ESP32** indicator will immediately show:
      `🟢 ESP32: ONLINE`!
    - When you simulate a train approach or trigger commands, the ESP32 receives the state and actuates the physical pins accordingly.

---

## 🎯 Summary Checklist

- [x] Backend deployed on Render with `uvicorn app.main:app` and `TRAIN_API_KEY` set.
- [x] Frontend deployed on Vercel with `VITE_API_URL` pointing to Render.
- [x] ESP32 configured with WiFi and deployed Render HTTPS URL.
- [x] Live full-stack loop tested: Trains approach ➔ Backend evaluates proximity ➔ Vercel UI sounds alarms ➔ ESP32 retracts footbridge!
