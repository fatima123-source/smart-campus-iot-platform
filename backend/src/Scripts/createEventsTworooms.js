import fetch from "node-fetch";
import mongoose from "mongoose"; // pour ObjectId

const API_URL = "http://localhost:5000/api/events";

const salles = [
  { id: "6998c6e4cbeae9dbed788707", name: "Salle A101" },
  { id: "6998c6e4cbeae9dbed78870b", name: "Salle B201" }
];

const eventsTemplate = [
  { type: "temperature_elevee", capteurType: "temperature", valeur: 30, description: "Température supérieure à 28°C" },
  { type: "temperature_basse", capteurType: "temperature", valeur: 16, description: "Température trop basse" },
  { type: "surconsommation", capteurType: "energie", valeur: 900, description: "Consommation énergétique élevée" },
  { type: "salle_vide", capteurType: "presence", valeur: 0, description: "Aucune présence détectée" },
  { type: "salle_pleine", capteurType: "presence", valeur: 35, description: "Capacité maximale atteinte" }
];

async function createEvents() {
  for (const salle of salles) {
    for (const event of eventsTemplate) {
      const eventData = {
  type: event.type,
  salle: new mongoose.Types.ObjectId(salle.id), // <-- ici le vrai ObjectId
  timestamp: new Date(),
  capteurType: event.capteurType,
  valeur: event.valeur,
  description: `${event.description} - ${salle.name}`,
  notifie: false
};

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData)
        });
        const json = await res.json();
        console.log("✅ Event créé :", json);
      } catch (err) {
        console.error("❌ Erreur :", err);
      }
    }
  }
}

createEvents();