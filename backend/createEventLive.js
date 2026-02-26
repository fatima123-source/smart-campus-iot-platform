// createEventLive.js
import fetch from "node-fetch"; // si Node >= 18 tu peux utiliser fetch natif

const url = "http://localhost:3000/api/events";

const eventData = {
  type: "temperature_elevee",
  salleId: "65f1a1111111111111111111",
  capteurType: "temperature",
  valeur: 30,
  capacite: 20,
  message: "Température supérieure à 28°C",
  traite: false
};

async function createEvent() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    });

    const json = await res.json();
    console.log("Réponse serveur :", json);
  } catch (err) {
    console.error("Erreur :", err);
  }
}

createEvent();
