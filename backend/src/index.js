import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import objectRoutes from "./routes/object.routes.js";
import actionsRoutes from "./routes/actions.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import subscriptionsRoutes from "./routes/subscriptions.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// ROUTES
app.use("/api/object", objectRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);

// TEST ROUTE
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Smart Campus API running" });
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
