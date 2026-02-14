/*import mqtt from "mqtt";
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
*/

import mqtt from "mqtt";
import dotenv from "dotenv";
import Command from "../models/Commandes.js";

dotenv.config();

const mqttClient = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: Number(process.env.MQTT_PORT),
  protocol: process.env.MQTT_PROTOCOL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("✅ MQTT connected");

  mqttClient.subscribe("smartcampus/platform/feedback");
});

mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (data.commandId && data.status) {
      await Command.findByIdAndUpdate(data.commandId, {
        status: data.status
      });

      console.log("✅ Command status updated:", data.commandId);
    }

  } catch (err) {
    console.error("MQTT parse error", err.message);
  }
});

export default mqttClient;

