import express from "express";
import { createEvent, getEvents, getEventsBySalle, getLastEventBySalle } from "../controllers/event.controller.js";

const router = express.Router();

// Création d'un événement
router.post("/", createEvent);


// 🔹 Dernier événement d'une salle
router.get("/last", getLastEventBySalle);

// Tous les événements ou par salle
router.get("/", async (req, res) => {
  if (req.query.salleId) return getEventsBySalle(req, res);
  return getEvents(req, res);
});


export default router;
