// src/services/notification.service.js
import { io } from "../index.js"; // Import Socket.IO si tu veux notifications temps réel
import Notification from "../models/Notification.js";

/**
 * Envoie une notification lorsqu'un événement est créé
 * @param {Object} event - L'événement créé
 */
export const sendNotification = async (event) => {
  try {
    // Créer un message simple
    const message = `🔥 ${event.type} détectée dans la salle ${event.salleId}`;

    // Sauvegarder la notification dans la DB
    const notification = new Notification({ message, event });
    await notification.save();

    // ⚡ Émettre en temps réel vers le dashboard
    io.emit("notification", {
      message,
      event,
      date: new Date(),
    });

    console.log("✅ Notification envoyée :", message);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi de notification :", err);
  }
};



