import express from "express";
import {
  getNotifications,
  createNotification,
  markAsRead,
  notifyEvent, // 👈 ajouter
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:id/read", markAsRead);

// 🔹 Nouvelle route pour notifier un événement
router.post("/notify/:eventId", notifyEvent);

export default router;
