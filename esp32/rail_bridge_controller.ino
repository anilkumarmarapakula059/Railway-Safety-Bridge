/*
 * =========================================================================================
 * RAILSAFE - Automatic Retractable Railway Footbridge Microcontroller Firmware
 * Target Hardware: ESP32-WROOM-32 / ESP32-S3 (Industrial Grade DIN-rail enclosure)
 * Station: Ongole Railway Station (OGL), South Central Railway, India
 * 
 * Hardware Interfaces:
 * - Pin 25: Actuator Direction IN1 (H-Bridge / VFD Forward - Extend)
 * - Pin 26: Actuator Direction IN2 (H-Bridge / VFD Reverse - Retract)
 * - Pin 27: Actuator PWM Speed Control (0-255)
 * - Pin 32: Limit Switch 1 (LS1 - Bridge Fully Retracted at Platform A)
 * - Pin 33: Limit Switch 2 (LS2 - Bridge Fully Extended to Platform B)
 * - Pin 34: Optical Barrier Sensor (IR Curtain / LiDAR obstacle detector)
 * - Pin 35: Physical Mushroom Emergency Stop Button (Hardware Interrupt)
 * - Pin 18: Red Visual Flasher Beacon & Horn Relay
 * - Pin 19: Green Pedestrian Crossing Signal Relay
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Configuration ---
// Replace with your local WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Cloud Render Backend URL (replace with your deployed Render URL)
// Example: "https://railsafe-backend.onrender.com" or local "http://192.168.1.100:8000"
const char* BACKEND_SERVER = "https://railsafe-backend.onrender.com";
const char* DEVICE_ID = "ESP32_OGL_BRIDGE_01";
const char* AUTH_TOKEN = "rg_874fe1703f654373bd3fdef5840ad1ee";

// --- Pin Definitions ---
#define PIN_ACTUATOR_IN1 25
#define PIN_ACTUATOR_IN2 26
#define PIN_ACTUATOR_PWM 27
#define PIN_LS_RETRACTED 32
#define PIN_LS_EXTENDED 33
#define PIN_OBSTACLE_RADAR 34
#define PIN_EMERGENCY_STOP 35
#define PIN_RED_BEACON 18
#define PIN_GREEN_SIGNAL 19

// --- State Variables ---
volatile bool emergency_stop_active = false;
volatile bool obstacle_detected = false;
int current_position_pct = 100; // 100% = Extended, 0% = Retracted
String bridge_state = "SAFE_OPEN";
unsigned long last_heartbeat_time = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 1000;

// --- Interrupt Service Routines ---
void IRAM_ATTR isrEmergencyStop() {
    emergency_stop_active = true;
    digitalWrite(PIN_ACTUATOR_IN1, LOW);
    digitalWrite(PIN_ACTUATOR_IN2, LOW);
    ledcWrite(0, 0); // Cut motor drive immediately
    digitalWrite(PIN_RED_BEACON, HIGH);
    digitalWrite(PIN_GREEN_SIGNAL, LOW);
}

void setup() {
    Serial.begin(115200);
    Serial.println("\n[RAILSAFE ESP32] Initializing Ongole Station Footbridge Controller...");

    // Setup I/O
    pinMode(PIN_ACTUATOR_IN1, OUTPUT);
    pinMode(PIN_ACTUATOR_IN2, OUTPUT);
    pinMode(PIN_RED_BEACON, OUTPUT);
    pinMode(PIN_GREEN_SIGNAL, OUTPUT);

    pinMode(PIN_LS_RETRACTED, INPUT_PULLUP);
    pinMode(PIN_LS_EXTENDED, INPUT_PULLUP);
    pinMode(PIN_OBSTACLE_RADAR, INPUT_PULLUP);
    pinMode(PIN_EMERGENCY_STOP, INPUT_PULLUP);

    // PWM Setup for actuator speed
    ledcAttachPin(PIN_ACTUATOR_PWM, 0);
    ledcSetup(0, 5000, 8); // 5kHz, 8-bit

    // Emergency Stop Interrupt
    attachInterrupt(digitalPinToInterrupt(PIN_EMERGENCY_STOP), isrEmergencyStop, FALLING);

    // Initial safe defaults
    digitalWrite(PIN_GREEN_SIGNAL, HIGH); // Default extended
    digitalWrite(PIN_RED_BEACON, LOW);

    // Connect to WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("[WiFi] Connecting to Railway Infrastructure Network");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 10) {
        delay(500);
        Serial.print(".");
        retries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[WiFi] Connected. IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\n[WiFi] Network offline. Operating in autonomous fail-safe mode.");
    }
}

void loop() {
    unsigned long now = millis();

    // Check optical barrier
    obstacle_detected = (digitalRead(PIN_OBSTACLE_RADAR) == LOW);

    // Periodic Heartbeat and Telemetry Push
    if (now - last_heartbeat_time >= HEARTBEAT_INTERVAL_MS) {
        last_heartbeat_time = now;
        sendTelemetry();
    }

    delay(20);
}

void sendTelemetry() {
    if (WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    String url = String(BACKEND_SERVER) + "/api/bridge/esp32/heartbeat";

    if (String(BACKEND_SERVER).startsWith("https")) {
        WiFiClientSecure secureClient;
        secureClient.setInsecure(); // Skip certificate validation for cloud prototype
        http.begin(secureClient, url);
    } else {
        http.begin(url);
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", AUTH_TOKEN);

    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["state"] = bridge_state;
    doc["position_pct"] = current_position_pct;
    doc["emergency_active"] = emergency_stop_active;
    doc["obstacle"] = obstacle_detected;
    doc["rssi"] = WiFi.RSSI();

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    if (httpResponseCode > 0) {
        Serial.printf("[ESP32 Telemetry] Heartbeat sent to Render. Response: %d\n", httpResponseCode);
    } else {
        Serial.printf("[ESP32 Telemetry] Connection error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
}
