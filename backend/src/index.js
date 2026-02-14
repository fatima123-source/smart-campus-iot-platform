/*
import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import cors from "cors";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import commandRoutes from "./routes/command.routes.js";
import objectRoutes from "./routes/object.routes.js";
import "./config/mqttClient.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());



// DB
connectDB();

//Routes
app.use("/api/commands", commandRoutes);
app.use("/api/objects", objectRoutes);

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/

import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import cors from "cors";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

import connectDB from "./config/database.js";
import commandRoutes from "./routes/command.routes.js";
import objectRoutes from "./routes/object.routes.js";
import "./config/mqttClient.js";

const app = express();

app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/commands", commandRoutes);
app.use("/api/objects", objectRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

