import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import commandRoutes from "./routes/command.routes.js";
import "./config/mqttClient.js";


const mqttConfig = {
  host: process.env.MQTT_HOST,
  port: Number(process.env.MQTT_PORT) || 8883,
  protocol: process.env.MQTT_PROTOCOL || "mqtts",
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  topicBase: process.env.MQTT_TOPIC_BASE || "smartcampus",
  qos: 1,
};

console.log("Working directory:", process.cwd());
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(express.json());

// DB
connectDB();


//ROUTES
app.use("/api/commands", commandRoutes);








// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
