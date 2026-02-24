/**
 * Contrôleur pour les données IoT
 * Mohammed - Consultation des données (Service 1)
 *
 * Collections utilisées :
 *  - Salles     : name, code, type, building, annexe
 *  - capteurs   : salleId, type, unit, value, status, lastUpdate
 *  - historique_capteurs : salleId, type, unit, value, timestamp, topic
 *
 * Types de capteurs :
 *  - "temperature" + unit "°C"      → Température
 *  - "temperature" + unit "ppm"     → Gaz / CO2
 *  - "presence"    + unit "persons" → Occupation
 *  - "energie"     + unit "kWh"     → Consommation
 */

import mongoose from "mongoose";

// ─── Modèle Salle ─────────────────────────────────────────────────────
// Temporaire jusqu'à ce que Sara finisse Object.js
// 3ème argument "Salles" = nom exact de la collection dans MongoDB
const salleSchema = new mongoose.Schema({
  code:        String,
  name:        String,
  type:        String,
  department:  String,
  building:    String,
  annexe:      String,
  floor:       Number,
  capacity:    Number,
  description: String,
  createdAt:   Date,
});

const Salle =
  mongoose.models.Salles ||
  mongoose.model("Salles", salleSchema, "Salles"); // ✅ "Salles" forcé

// ─── Modèle Capteur ───────────────────────────────────────────────────
// Temporaire jusqu'à ce que Amina & Doha finissent Sensor.js
// 3ème argument "capteurs" = nom exact de la collection dans MongoDB
const sensorSchema = new mongoose.Schema({
  salleId:    { type: mongoose.Schema.Types.ObjectId, ref: "Salles" },
  type:       String,   // temperature, presence, energie
  unit:       String,   // °C, ppm, persons, kWh
  value:      Number,
  status:     String,
  lastUpdate: Date,
});

const Sensor =
  mongoose.models.capteurs ||
  mongoose.model("capteurs", sensorSchema, "capteurs"); // ✅ "capteurs" forcé

// ─── Modèle Historique ────────────────────────────────────────────────
// Temporaire jusqu'à ce qu'un modèle dédié soit créé
// 3ème argument = nom exact de la collection dans MongoDB
const historiqueSchema = new mongoose.Schema({
  salleId:   { type: mongoose.Schema.Types.ObjectId, ref: "Salles" },
  type:      String,
  status:    String,
  value:     Number,
  unit:      String,
  timestamp: Date,
  topic:     String,
});

const Historique =
  mongoose.models.historique_capteurs ||
  mongoose.model("historique_capteurs", historiqueSchema, "historique_capteurs"); // ✅ forcé

// ════════════════════════════════════════════════════════
// GET /api/data/salles
// Retourne toutes les salles pour le dropdown filtre
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════
// GET /api/data/salles
// Retourne toutes les salles pour le dropdown filtre
// ════════════════════════════════════════════════════════
export const getAllSalles = async (req, res) => {
  try {
    // ❌ AVANT : seulement certains champs
    // const salles = await Salle.find({}, "name code type building annexe");

    // ✅ APRÈS : tous les champs
    const salles = await Salle.find({});
    res.json(salles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ════════════════════════════════════════════════════════
// GET /api/data/capteurs
// Query params optionnels :
//   ?salleId=...   → filtrer par salle
//   ?type=...      → filtrer par type (temperature, presence, energie)
//   ?unit=...      → filtrer par unité (°C, ppm, persons, kWh)
//   ?search=...    → recherche sur nom ou code de salle
// ════════════════════════════════════════════════════════
export const getCapteurs = async (req, res) => {
  try {
    const { salleId, type, unit, search } = req.query;
    let filter = {};

    if (salleId) filter.salleId = new mongoose.Types.ObjectId(salleId);
    if (type)    filter.type = type;
    if (unit)    filter.unit = unit;

    let capteurs = await Sensor.find(filter).populate(
      "salleId",
      "name code type building annexe"
    );

    // Recherche textuelle sur nom ou code de salle (après populate)
    if (search) {
      const s = search.toLowerCase();
      capteurs = capteurs.filter(
        (c) =>
          c.salleId?.name?.toLowerCase().includes(s) ||
          c.salleId?.code?.toLowerCase().includes(s)
      );
    }

    res.json(capteurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ════════════════════════════════════════════════════════
// GET /api/data/historique/:salleId
// Retourne les 50 dernières mesures d'une salle
// triées du plus récent au plus ancien
// ════════════════════════════════════════════════════════
export const getHistorique = async (req, res) => {
  try {
    const { salleId } = req.params;

    const data = await Historique.find({
      salleId: new mongoose.Types.ObjectId(salleId),
    })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};