// seed-event.js
import fetch from "node-fetch"; // si Node >=18, tu peux utiliser fetch natif
import mongoose from "mongoose"; // pour convertir en ObjectId

const url = "http://localhost:5000/api/events";

// 🔹 Event à créer
const eventData = {
  type: "alerte",
  salleId: "65f1a1111111111111111112", // <- Mieux utiliser String si ton schéma Event.js a salleId: String
  capteurType: "temperature",
  valeur: 30,
  capacite: 20,
  description: "Test alerte température pour la salle 65f1a1111111111111111112"
};

// 🔹 Fonction pour créer l'événement
async function createEvent() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    });

    const json = await res.json();
    console.log("📥 Réponse serveur :", json);
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

// 🔹 Lancer la création
createEvent();