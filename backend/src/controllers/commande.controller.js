import Command from "../models/Commandes.js";
import Salle from "../models/Salle.js";
import Event from "../models/Event.js"; // Ajouter cette ligne
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

    // 🔍 LOGIQUE MÉTIER : Vérifier les événements avant exécution
    const peutEtreExecutee = await verifierEvenementsSalle(command);

    if (!peutEtreExecutee) {
      // Si la commande ne peut pas être exécutée, on la rejette automatiquement
      command.status = "FAILED";
      command.reason = "Rejet automatique: ne correspond pas aux événements actuels de la salle";
      command.rejectedAt = new Date();
      await command.save();

      return res.status(400).json({
        message: "Commande rejetée automatiquement",
        reason: command.reason
      });
    }

    // Si tout est OK, on publie sur MQTT
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

    // Mettre à jour le statut de la commande
    command.status = "EXECUTED";
    command.executedAt = new Date();
    await command.save();

    console.log("📡 Command sent for execution");

    res.json({
      message: "Commande envoyée pour exécution",
      command
    });

  } catch (error) {
    console.error("Erreur executeCommand:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ REJETER COMMANDE MANUELLEMENT (NOUVEAU)
export const rejectCommand = async (req, res) => {
  try {
    const { reason } = req.body;
    const command = await Command.findById(req.params.id);

    if (!command) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Vérifier que la commande est bien en attente
    if (command.status !== "PENDING") {
      return res.status(400).json({
        message: `Impossible de rejeter une commande avec le statut ${command.status}`
      });
    }

    // Mettre à jour le statut
    command.status = "FAILED";
    command.reason = reason || "Rejet manuel";
    command.rejectedAt = new Date();

    await command.save();

    console.log(`✅ Commande ${command._id} rejetée: ${command.reason}`);

    res.json({
      message: "Commande rejetée avec succès",
      command
    });

  } catch (error) {
    console.error("Erreur rejectCommand:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ FONCTION UTILITAIRE : Vérifier les événements de la salle
async function verifierEvenementsSalle(command) {
  try {
    console.log(`🔍 Vérification des événements pour salle: ${command.codeSalle}`);

    // Récupérer les 10 derniers événements de la salle
    const derniersEvents = await Event.find({
      salleId: command.salleId
    })
    .sort({ timestamp: -1 })
    .limit(10);

    console.log(`📊 ${derniersEvents.length} événements trouvés`);

    if (derniersEvents.length === 0) {
      console.log("✅ Aucun événement, commande autorisée");
      return true;
    }

    // 📌 RÈGLE 1: Si salle pleine (type "salle_pleine")
    const sallePleine = derniersEvents.some(e => e.type === "salle_pleine");

    if (sallePleine) {
      console.log("🚫 SALLE PLEINE détectée");

      // Interdire certaines actions quand la salle est pleine
      if (command.action === "TURN_ON" || command.action === "BOOST") {
        console.log("❌ Commande rejetée: action interdite quand salle pleine");
        return false;
      }
    }

    // 📌 RÈGLE 2: Vérifier le capteur de présence
    const dernierEventPresence = derniersEvents.find(e => e.capteurType === "presence");

    if (dernierEventPresence) {
      console.log(`👤 Dernière présence: ${dernierEventPresence.valeur} personnes`);

      // Si personne dans la salle, on peut éteindre mais pas allumer
      if (dernierEventPresence.valeur === 0) {
        if (command.action === "TURN_ON") {
          console.log("❌ Commande rejetée: personne dans la salle");
          return false;
        }
      }
    }

    // 📌 RÈGLE 3: Vérifier la température si commande de climatisation
    if (command.device === "Climatiseur" && command.action === "SET_TEMP") {
      const dernierEventTemp = derniersEvents.find(e => e.capteurType === "temperature");

      if (dernierEventTemp) {
        console.log(`🌡️ Température actuelle: ${dernierEventTemp.valeur}°C`);

        // Empêcher de régler une température trop basse
        if (command.value < 16) {
          console.log("❌ Commande rejetée: température trop basse");
          return false;
        }
      }
    }

    console.log("✅ Commande autorisée par la logique événementielle");
    return true;

  } catch (error) {
    console.error("Erreur dans verifierEvenementsSalle:", error);
    // En cas d'erreur, on autorise par sécurité
    return true;
  }
}