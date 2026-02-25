// createEventAtlas.js
import fetch from "node-fetch"; // si Node >=18, fetch est natif
import dotenv from "dotenv";

dotenv.config();

// 🔹 URL de ton backend
const url = `http://localhost:${process.env.PORT || 5000}/api/events`;

// 🔹 Données de l'événement
const eventData = {
  type: "temperature_elevee",
  salleId: "65f1a1111111111111111111",
  capteurType: "temperature",
  valeur: 30,
  capacite: 20,
  message: "Température supérieure à 28°C",
  traite: false
};

// 🔹 Créer l'événement
async function createEvent() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    });

    const json = await res.json();
    console.log("📥 Réponse serveur :", json);
    console.log("✅ Événement créé sur MongoDB Atlas !");
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

createEvent();