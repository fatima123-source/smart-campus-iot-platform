import Command from "../models/Commandes.js";
import Salle from "../models/Salle.js";
import mqttClient from "../config/mqttClient.js";


// ✅ CREER COMMANDE (POSTMAN / APP)
export const createCommand = async (req, res) => {
  try {
    // 🔍 DEBUG complet du body
    console.log("BODY exact reçu:", JSON.stringify(req.body));
    console.log("Type codeSalle:", typeof req.body.codeSalle);

    // On prépare le code recherché (trim + string)
    const codeRecherche = req.body.codeSalle?.toString().trim();
    console.log("Code recherché après trim:", JSON.stringify(codeRecherche));

    let salle = null;

    if (req.body.salleId) {
      // Recherche par ID si fourni
      console.log("Recherche par salleId:", req.body.salleId);
      salle = await Salle.findById(req.body.salleId);
    } else if (codeRecherche) {
      // 🔍 DEBUG : toutes les salles existantes
      const toutesSalles = await Salle.find();
      console.log("Toutes les salles dans la DB:", toutesSalles.map(s => s.code));

      // Recherche par code avec insensible à la casse pour être sûr
      salle = await Salle.findOne({
        code: { $regex: `^${codeRecherche}$`, $options: 'i' }
      });
    }

    console.log("Salle trouvée:", salle);

    if (!salle) {
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    const command = await Command.create({
      ...req.body,
      salleId: salle._id,
      codeSalle: salle.code,
      status: "PENDING"
    });

    console.log("Commande créée avec succès:", command._id);

    res.status(201).json(command);

  } catch (error) {
    console.error("Erreur createCommand:", error);
    res.status(500).json({ message: error.message });
  }
};




// ✅ LISTER COMMANDES + INFOS SALLE
export const getAllCommands = async (req, res) => {
  try {
    const commands = await Command.find()
      .populate("salleId")
      .sort({ createdAt: -1 });

    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ EXECUTER COMMANDE (BOUTON INTERFACE)
export const executeCommand = async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);

    if (!command) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const topic = `${process.env.MQTT_TOPIC_BASE}/platform/execute`;

    const message = JSON.stringify({
      commandId: command._id,
      salle: command.codeSalle,
      device: command.device,
      action: command.action,
      value: command.value || null,
      mode: command.mode || null
    });

    mqttClient.publish(topic, message, { qos: 1 });

    console.log("📡 Command sent for execution");

    res.json({ message: "Commande envoyée pour exécution" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
