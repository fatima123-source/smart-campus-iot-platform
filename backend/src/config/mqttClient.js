import mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

const mqttClient = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: Number(process.env.MQTT_PORT),
  protocol: process.env.MQTT_PROTOCOL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("✅ MQTT connected successfully");
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT error:", err.message);
});

export default mqttClient;

