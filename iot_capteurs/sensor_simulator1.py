import random
import time
import json
from datetime import datetime, timezone
import ssl
import paho.mqtt.client as mqtt

# ===============================
# 🔹 CONFIGURATION MQTT
# ===============================
MQTT_HOST = "d0bcd50f18894343b727e797d54adbf9.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "doha_falah"
MQTT_PASSWORD = "hivemq@DOHA1"

# ===============================
# 🔹 SALLES
# ===============================
ROOMS = [
    "INFO-A101", "INFO-A102", "INFO-A201",
    "INFO-A202", "INFO-A301",
    "BIO-B101", "BIO-B102", "BIO-B201",
    "BIO-B202", "BIO-B301"
]

# ===============================
# 🔹 CAPTEURS
# ===============================
SENSORS = [
    {"type": "temperature", "unit": "°C", "min": 18, "max": 35},
    {"type": "energie", "unit": "kWh", "min": 100, "max": 1200},
    {"type": "presence", "unit": "persons", "min": 0, "max": 40},
    {"type": "temperature", "unit": "ppm", "min": 0, "max": 300}  # smoke → type "temperature" pour MongoDB
]

# ===============================
# 🔹 CLIENT MQTT
# ===============================
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.tls_set(tls_version=ssl.PROTOCOL_TLS)
client.connect(MQTT_HOST, MQTT_PORT)
client.loop_start()

print("✅ Connected to HiveMQ Cloud")

# ===============================
# 🔹 BOUCLE SIMULATION
# ===============================
try:
    while True:
        for room in ROOMS:
            for sensor in SENSORS:
                data = {
                    "room": room,
                    "type": sensor["type"],
                    "status": "actif",
                    "value": round(random.uniform(sensor["min"], sensor["max"]), 2),
                    "unit": sensor["unit"],
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

                topic = f"smartcampus/salle/{room}"
                client.publish(topic, json.dumps(data))
                print(f"📤 Sent: {data}")

        time.sleep(5)  # pause entre chaque cycle

except KeyboardInterrupt:
    print("🛑 Simulation stopped")
    client.disconnect()
