import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

// Permet d’obtenir __dirname dans ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv pour lire le .env dans src
dotenv.config({ path: path.join(__dirname, ".env") });

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import connectDB from "./config/database.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(express.json());

// DB
connectDB();

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
