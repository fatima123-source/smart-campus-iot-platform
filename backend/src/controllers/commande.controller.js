import Command from "../models/Commandes.js";
import mqttClient from "../config/mqttClient.js";

// 🔵 Créer une commande + l'envoyer sur MQTT
export const createCommand = async (req, res) => {
  try {
    // 1️⃣ Sauvegarder en base
    const command = await Command.create(req.body);

    // 2️⃣ Construire le topic MQTT
    const topic = `${process.env.MQTT_TOPIC_BASE}/${command.salleId}/${command.device}`;

    // 3️⃣ Construire le message
    const message = JSON.stringify({
      application: command.application,
      device: command.device,
      action: command.action,
      value: command.value || null,
      mode: command.mode || null,
      reason: command.reason || null,
      codeSalle: command.codeSalle
    });

    // 4️⃣ Publier vers MQTT
    mqttClient.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ MQTT publish error:", err.message);
      } else {
        console.log("✅ Command sent to MQTT:", topic);
      }
    });

    res.status(201).json({
      message: "Commande envoyée vers la plateforme SmartCampus 💯",
      command
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 Lister les commandes
export const getAllCommands = async (req, res) => {
  try {
    const commands = await Command.find().sort({ createdAt: -1 });
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
