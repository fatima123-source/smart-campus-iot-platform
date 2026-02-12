import express from "express";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import path from "path";
dotenv.config({ path: path.resolve("./src/.env") });
import mongoose from "mongoose";
import connectDB from "./config/database.js";

/*import objectRoutes from "./routes/object.routes.js";
import actionsRoutes from "./routes/actions.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import subscriptionsRoutes from "./routes/subscriptions.routes.js";
*/
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
