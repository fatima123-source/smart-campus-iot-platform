import express from "express";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import commandRoutes from "./routes/command.routes.js";
import "./config/mqttClient.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(express.json());


// DB
connectDB();

//Routes
app.use("/api/commands", commandRoutes);

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
