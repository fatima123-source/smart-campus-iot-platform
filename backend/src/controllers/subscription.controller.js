// src/controllers/subscription.controller.js
import Subscription from "../models/Subscription.js";

export const createSubscription = async (req, res) => {
  try {
    const { appName, eventId } = req.body;
    if (!appName || !eventId)
      return res.status(400).json({ message: "appName ou eventId manquant" });

    const sub = new Subscription({ appName, event: eventId });
    await sub.save();
    res.status(201).json({ message: "Abonnement créé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};