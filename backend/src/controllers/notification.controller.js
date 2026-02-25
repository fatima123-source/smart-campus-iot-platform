import Notification from "../models/Notification.js";
import { io } from "../index.js"; // 👈 pour Socket.IO si tu veux émettre des events

// 🔹 Récupérer toutes les notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Créer une notification manuellement
export const createNotification = async (req, res) => {
  try {
    const { message, event } = req.body;
    const notification = new Notification({ message, event });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Marquer notification comme lue
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification non trouvée" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Envoyer une notification liée à un événement
export const notifyEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Créer la notification dans la DB
    const notification = new Notification({
      message: `Nouvelle notification pour l'événement ${eventId}`,
      event: eventId,
    });
    await notification.save();

    // 🔔 Émettre un event Socket.IO pour le frontend
    io.emit(`event_${eventId}`, { message: notification.message });

    res.json({ message: "Notification envoyée" });
  } catch (error) {
    console.error("Erreur notifyEvent :", error);
    res.status(500).json({ message: error.message });
  }
};