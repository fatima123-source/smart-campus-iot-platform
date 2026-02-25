import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/database.js";
import commandRoutes from "./routes/command.routes.js";
import objectRoutes from "./routes/object.routes.js";
import eventRoutes from "./routes/event.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import subscriptionRoutes from "./routes/subscriptions.routes.js"; // ✅ ok

import "./config/mqttClient.js";

dotenv.config();

// 🔹 Création app Express
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 DB
connectDB();

// 🔹 Routes
app.use("/api/commands", commandRoutes);
app.use("/api/objects", objectRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/subscriptions", subscriptionRoutes); // ✅ mettre ici, après app

// 🔹 Serveur HTTP + Socket.IO
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});