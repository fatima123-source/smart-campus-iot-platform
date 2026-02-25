// src/controllers/event.controller.js
import mongoose from "mongoose"; // ⚡ nécessaire pour ObjectId
import Event from "../models/Event.js";
import { sendNotification } from "../services/notification.service.js";

// 🔹 Créer un événement
export const createEvent = async (req, res) => {
  try {
    const { type, salle, capteurType, valeur, description } = req.body;

    // ⚡ Convertir la string salle en ObjectId
    const salleObjId = new mongoose.Types.ObjectId(salle);

    // ⚡ Créer l'événement
    const event = new Event({
      type,
      salle: salleObjId,
      capteurType,
      valeur,
      description,
      timestamp: new Date(),
      notifie: false
    });

    await event.save(); // ✅ tout est défini correctement

    // 🔔 Envoi notification si nécessaire
    await sendNotification(event);

    res.status(201).json(event);
  } catch (error) {
    console.error("Erreur createEvent :", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer tous les événements
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ timestamp: -1 })
      .populate("salle", "name code"); // 👈 récupère le nom et code de la salle
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer les événements par salle
export const getEventsBySalle = async (req, res) => {
  try {
    const events = await Event.find({ salle: req.query.salleId })
      .sort({ timestamp: -1 })
      .populate("salle", "name code"); // 👈 récupère le nom/code
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer le dernier événement d'une salle
export const getLastEventBySalle = async (req, res) => {
  try {
    const lastEvent = await Event.findOne({ salle: req.query.salleId })
      .sort({ timestamp: -1 })
      .populate("salle", "name code"); // 👈 récupère le nom/code

    if (!lastEvent)
      return res.status(404).json({ message: "Aucun événement trouvé pour cette salle" });

    res.json(lastEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};