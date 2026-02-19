import Event from "../models/Event.js";
import { io } from "../index.js";
import { sendNotification } from "../services/notification.service.js";

// 🔹 Créer un événement
export const createEvent = async (req, res) => {
  try {
    const { type, salleId, capteurType, valeur, capacite, description } = req.body;

    const event = new Event({ type, salleId, capteurType, valeur, capacite, description });

    await event.save();

    // 🔥 Notification temps réel
    io.emit("newEvent", event);

    // Notification classique (optionnelle)
    sendNotification(event);

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer tous les événements
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer les événements par salle
export const getEventsBySalle = async (req, res) => {
  try {
    const events = await Event.find({ salleId: req.query.salleId }).sort({ timestamp: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer le dernier événement d'une salle
export const getLastEventBySalle = async (req, res) => {
  try {
    const lastEvent = await Event.findOne({ salleId: req.query.salleId }).sort({ timestamp: -1 });
    if (!lastEvent) return res.status(404).json({ message: "Aucun evenement trouve pour cette salle" });
    res.json(lastEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
Corrige event.controller.js : ajoute Socket.IO et nettoie les strings


