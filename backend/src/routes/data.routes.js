/**
 * Routes pour les données des capteurs
 * GET /data/historical - données historiques
 * GET /data/realtime - flux temps réel (WebSocket)
 * POST /data - ingestion de données
 */

/**
 * Routes pour les données des capteurs
 * Mohammed - Consultation des données (Service 1)
 *
 * GET /api/data/salles              - liste des salles (dropdown filtre)
 * GET /api/data/capteurs            - tous les capteurs (+ filtres: salleId, type, search)
 * GET /api/data/historique/:salleId - historique des capteurs d'une salle
 */

import express from "express";
import {
  getAllSalles,
  getCapteurs,
  getHistorique,
} from "../controllers/data.controller.js";

const router = express.Router();

// Récupérer toutes les salles (pour le dropdown filtre)
router.get("/salles", getAllSalles);

// Récupérer les capteurs avec filtres optionnels
// Query params: ?salleId=...&type=...&search=...
router.get("/capteurs", getCapteurs);

// Récupérer l'historique des capteurs d'une salle
router.get("/historique/:salleId", getHistorique);

export default router;