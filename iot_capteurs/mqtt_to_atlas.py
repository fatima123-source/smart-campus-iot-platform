import json
import ssl
import paho.mqtt.client as mqtt
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone

# ===============================
# 🔹 CONFIGURATION MONGODB ATLAS
# ===============================
MONGO_URI = "mongodb+srv://smartcampus_app:xGrFI3uuaQo4dim6@smartcampus-cluster.b0z37ll.mongodb.net/smartcampus?appName=smartcampus-cluster"
mongo = MongoClient(MONGO_URI)
db = mongo["smartcampus"]

capteurs_collection = db["capteurs"]                 # état actuel
historique_collection = db["historique_capteurs"]   # historique complet

# ===============================
# 🔹 MAPPING salles → ObjectId
# ===============================
SALLE_IDS = {
    "INFO-A101":ObjectId("65f1a1111111111111111111"),
    "INFO-A102":ObjectId("65f1a1111111111111111112"),
    "INFO-A201":ObjectId("65f1a1111111111111111113"),
    "INFO-A202":ObjectId("65f1a1111111111111111114"),
    "INFO-A301":ObjectId("65f1a1111111111111111115"),
    "BIO-B101":ObjectId("65f1b2222222222222222221"),
    "BIO-B102": ObjectId("65f1b2222222222222222222"),
    "BIO-B201": ObjectId("65f1b2222222222222222223"),
    "BIO-B202": ObjectId("65f1b2222222222222222224"),
    "BIO-B301": ObjectId("65f1b2222222222222222225")
}
 
 
# ===============================
# 🔹 CONFIGURATION MQTT (HiveMQ Cloud)
# ===============================
MQTT_HOST = "d0bcd50f18894343b727e797d54adbf9.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "doha_falah"
MQTT_PASSWORD = "hivemq@DOHA1"

# ===============================
# 🔹 CALLBACK MQTT
# ===============================
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("✅ Connecté à HiveMQ Cloud")
        client.subscribe("smartcampus/salle/#")
        print("📡 Abonné aux topics smartcampus/salle/#")
    else:
        print("❌ Échec connexion MQTT :", rc)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())

        room_code = payload.get("room")
        salle_objectid = SALLE_IDS.get(room_code)
        if salle_objectid is None:
            print(f"❌ Room {room_code} non mappée → ignorée")
            return

        # Timestamp UTC timezone-aware
        timestamp = payload.get("timestamp", datetime.now(timezone.utc).isoformat())

        # -------------------------------
        # 1️⃣ État actuel (capteurs)
        # -------------------------------
        capteur_doc = {
            "salleId": salle_objectid,
            "type": payload.get("type"),
            "status": payload.get("status", "actif"),
            "value": payload.get("value"),
            "unit": payload.get("unit", ""),
            "lastUpdate": timestamp
        }

        capteurs_collection.update_one(
            {"salleId": salle_objectid, "type": capteur_doc["type"]},
            {"$set": capteur_doc},
            upsert=True
        )

        # -------------------------------
        # 2️⃣ Historique complet (historique_capteurs)
        # -------------------------------
        historique_doc = {
            "salleId": salle_objectid,
            "type": capteur_doc["type"],
            "status": capteur_doc["status"],
            "value": capteur_doc["value"],
            "unit": capteur_doc["unit"],
            "timestamp": timestamp,
            "topic": msg.topic
        }

        historique_collection.insert_one(historique_doc)

        print(f"💾 Stocké {capteur_doc['type']} pour {room_code}")

    except Exception as e:
        print("❌ Erreur :", e)

# ===============================
# 🔹 INITIALISATION CLIENT MQTT
# ===============================
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.tls_set()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_HOST, MQTT_PORT)
print("📡 Collecting Smart Campus data...")
client.loop_forever()
