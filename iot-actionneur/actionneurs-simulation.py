import os
import ssl
import json
from datetime import datetime
from dotenv import load_dotenv
import paho.mqtt.client as mqtt
from pymongo import MongoClient
from bson import ObjectId

load_dotenv("../backend/.env")

# ===============================
# MongoDB Atlas
# ===============================
MONGO_URI = os.getenv("MONGO_URI")
mongo = MongoClient(MONGO_URI)
db = mongo["smartcampus"]

commands_col = db["commands"]
actionneurs_col = db["actionneurs"]

# ===============================
# MQTT HiveMQ Cloud
# ===============================
MQTT_HOST = os.getenv("MQTT_HOST")
MQTT_PORT = int(os.getenv("MQTT_PORT", 8883))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_TOPIC_BASE = os.getenv("MQTT_TOPIC_BASE")

TOPIC_SUB = f"{MQTT_TOPIC_BASE}/platform/execute"

# ===============================
# Helpers
# ===============================
def normalize_device_to_actionneur_type(device: str) -> str:
    if not device:
        return device
    d = device.strip().lower()

    mapping = {
        "light": "light",
        "climatiseur": "ac",
        "clim": "ac",
        "ac": "ac",
        "alarme": "alarm",
        "alarm": "alarm",
    }
    return mapping.get(d, d)


def execute_and_get_updates(actuator_type: str, action: str, payload: dict):
    updates = {}

    if actuator_type == "light":
        if action == "TURN_ON":
            updates["state"] = True
        elif action == "TURN_OFF":
            updates["state"] = False

    elif actuator_type == "alarm":
        if action == "TRIGGER":
            updates["state"] = True
        elif action == "STOP":
            updates["state"] = False

    elif actuator_type == "ac":
        if action == "SET_TEMP":
            updates["state"] = True
            if payload.get("value") is not None:
                updates["temperature"] = payload.get("value")
        elif action in ("BOOST", "ECO"):
            updates["state"] = True
            updates["mode"] = action
        elif action == "STOP":
            updates["state"] = False

    return updates


# ===============================
# MQTT Callbacks
# ===============================
def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print("✅ Connected to HiveMQ Cloud")
        client.subscribe(TOPIC_SUB, qos=1)
        print("📡 Subscribed to:", TOPIC_SUB)
    else:
        print("❌ Connection failed:", reason_code)


def on_message(client, userdata, msg):
    # 1) Lire payload MQTT
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
    except Exception:
        print("❌ Invalid JSON payload")
        return

    # 2) Récupérer commandId
    command_id_str = payload.get("commandId")
    if not command_id_str:
        print("❌ commandId manquant dans payload:", payload)
        return

    try:
        command_oid = ObjectId(command_id_str)
    except Exception:
        print("❌ commandId invalide:", command_id_str)
        return

    # 3) Charger commande depuis Mongo
    command = commands_col.find_one({"_id": command_oid})
    if not command:
        print("❌ Command introuvable en DB:", command_id_str)
        return

    device_backend = command.get("device")     # Light / Climatiseur / Alarme
    action = command.get("action")
    codeSalle = command.get("codeSalle")       # INFO-A101 etc.

    if not device_backend or not action or not codeSalle:
        print("❌ Champs manquants dans la commande DB:", command)
        return

    # ✅ convertir en type actionneur: light/ac/alarm
    actuator_type = normalize_device_to_actionneur_type(device_backend)

    # 4) Updates actionneur
    actuator_updates = execute_and_get_updates(actuator_type, action, payload)

    print(f"\n⚙️ Executing: device_backend={device_backend} -> type={actuator_type} action={action} codeSalle={codeSalle} commandId={command_id_str}")

    # 5) Update actionneur (par codeSalle + type) ✅
    if actuator_updates:
        query = {"codeSalle": codeSalle, "type": actuator_type}
        result = actionneurs_col.update_one(query, {"$set": actuator_updates})

        print("🔎 Query actionneur:", query)
        print("✅ actionneurs updated:", actuator_updates, f"(matched={result.matched_count}, modified={result.modified_count})")

        # Debug si aucun match
        if result.matched_count == 0:
            print("⚠️ Aucun actionneur trouvé. Exemple actionneur existant pour cette salle:")
            print(list(actionneurs_col.find({"codeSalle": codeSalle}, {"_id": 1, "type": 1, "state": 1})))
    else:
        print("ℹ️ Pas de mise à jour state (action non gérée dans la simulation)")

    # 6) Mettre commande EXECUTED
    commands_col.update_one(
        {"_id": command_oid},
        {"$set": {"status": "EXECUTED", "updatedAt": datetime.utcnow()}}
    )
    print(f"✅ Command {command_id_str} marked EXECUTED")


def on_error(client, userdata, err):
    print("❌ MQTT error:", err)


# ===============================
# Client Setup
# ===============================
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

client.tls_set(
    cert_reqs=ssl.CERT_REQUIRED,
    tls_version=ssl.PROTOCOL_TLS_CLIENT
)

client.on_connect = on_connect
client.on_message = on_message
client.on_error = on_error

client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)

print("🚀 Actuator simulator running (HiveMQ Cloud)...")
client.loop_forever()