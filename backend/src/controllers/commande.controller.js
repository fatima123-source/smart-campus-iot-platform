 /**import mongoose from "mongoose";
 import Command from "../models/Commandes.js";
 import Salle from "../models/Salle.js";
 import mqttClient from "../config/mqttClient.js";
 import Evenement from "../models/Event.js";


 const EVENT_ALLOWED_ACTIONS = {
   temperature_basse: ["TURN_ON", "SET_TEMP", "BOOST", "ECO"],
   salle_pleine: ["TRIGGER", "TURN_ON"],
   temperature_elevee: ["TURN_ON", "SET_TEMP", "BOOST", "ECO"],
   salle_vide: ["TURN_OFF", "STOP"],
 };

 const toObjectId = (id) => {
   if (!id) return null;
   try {
     return new mongoose.Types.ObjectId(String(id));
   } catch {
     return null;
   }
 };

 function buildRejectReason({ command, latestEvent }) {
   const evType = latestEvent?.type || "Aucun événement";
   const evMsg = latestEvent?.description || latestEvent?.message || "";
   return `Rejet automatique: action "${command.action}" non conforme au dernier événement "${evType}". ${evMsg}`.trim();
 }

 // ✅ CREER COMMANDE (POSTMAN / APP)
 export const createCommand = async (req, res) => {
   try {
     const codeRecherche = req.body.codeSalle?.toString().trim();

     let salle = null;

     if (req.body.salleId) {
       salle = await Salle.findById(req.body.salleId);
     } else if (codeRecherche) {
       salle = await Salle.findOne({
         code: { $regex: `^${codeRecherche}$`, $options: "i" },
       });
     }

     if (!salle) {
       return res.status(404).json({ message: "Salle non trouvée" });
     }

     const command = await Command.create({
       ...req.body,
       salleId: salle._id,
       codeSalle: salle.code,
       status: "PENDING",
     });

     res.status(201).json(command);
   } catch (error) {
     console.error("Erreur createCommand:", error);
     res.status(500).json({ message: error.message });
   }
 };

 // ✅ LISTER COMMANDES + INFOS SALLE + DERNIER EVENEMENT (latestEvent)
 export const getAllCommands = async (req, res) => {
   try {
     const commands = await Command.find()
       .populate("salleId")
       .sort({ createdAt: -1 })
       .lean();

     // ✅ EXTRAIRE les salleIds des commandes (robuste)
     const salleIds = [
       ...new Set(
         commands
           .map((c) => {
             const sid = c?.salleId?._id ? c.salleId._id : c?.salleId;
             return sid ? String(sid) : null;
           })
           .filter(Boolean)
       ),
     ];

     // ✅ LOG PREUVE: si tu vois 1 seul id ici -> toutes commandes même salle
     console.log("✅ salleIds uniques dans COMMANDS:", salleIds);

     if (salleIds.length === 0) return res.json(commands);

     const salleObjectIds = salleIds.map(toObjectId).filter(Boolean);

     const latestEvents = await Evenement.aggregate([
       { $match: { salleId: { $in: salleObjectIds } } },
       { $sort: { timestamp: -1 } },
       { $group: { _id: "$salleId", latestEvent: { $first: "$$ROOT" } } },
     ]);

     const latestMap = new Map(
       latestEvents.map((e) => [String(e._id), e.latestEvent])
     );

     const enriched = commands.map((c) => {
       const sid = c?.salleId?._id ? c.salleId._id : c?.salleId;
       const key = sid ? String(sid) : null;

       return {
         ...c,
         latestEvent: key ? latestMap.get(key) || null : null,
       };
     });

     res.json(enriched);
   } catch (error) {
     console.error("Erreur getAllCommands:", error);
     res.status(500).json({ message: error.message });
   }
 };

 // ✅ EXECUTER COMMANDE + REJET AUTO
 export const executeCommand = async (req, res) => {
   try {
     const command = await Command.findById(req.params.id);

     if (!command) return res.status(404).json({ message: "Commande introuvable" });
     if (command.status !== "PENDING")
       return res.status(400).json({ message: "Commande déjà traitée" });

     // ✅ salleId robuste
     const salleIdObj = toObjectId(command.salleId);
     if (!salleIdObj) {
       return res.status(400).json({ message: "salleId invalide sur la commande" });
     }

     // ✅ Dernier event de CETTE salle
     const latestEvent = await Evenement.findOne({ salleId: salleIdObj }).sort({
       timestamp: -1,
     });

     const allowedActions = latestEvent?.type
       ? EVENT_ALLOWED_ACTIONS[latestEvent.type]
       : null;

     if (allowedActions && !allowedActions.includes(command.action)) {
       command.status = "FAILED";
       command.reason = buildRejectReason({ command, latestEvent });
       await command.save();

       return res.json({
         message: "Commande rejetée automatiquement (non conforme à l’événement)",
         status: command.status,
         reason: command.reason,
         latestEvent,
       });
     }

     const topic = `${process.env.MQTT_TOPIC_BASE}/platform/execute`;

     const message = JSON.stringify({
       commandId: command._id,
       salle: command.codeSalle,
       device: command.device,
       action: command.action,
       value: command.value ?? null,
       mode: command.mode ?? null,
     });

     mqttClient.publish(topic, message, { qos: 1 });

     res.json({ message: "Commande envoyée pour exécution" });
   } catch (error) {
     console.error("Erreur executeCommand:", error);
     res.status(500).json({ message: error.message });
   }
 };

 // ✅ REJETER COMMANDE
 export const rejectCommand = async (req, res) => {
   try {
     const command = await Command.findById(req.params.id);

     if (!command) return res.status(404).json({ message: "Commande introuvable" });
     if (command.status !== "PENDING")
       return res.status(400).json({ message: "Commande déjà traitée" });

     const reason = (req.body?.reason || "Commande rejetée manuellement").toString().trim();

     command.status = "FAILED";
     command.reason = reason;
     await command.save();

     res.json({ message: "Commande rejetée", status: command.status, reason: command.reason });
   } catch (error) {
     console.error("Erreur rejectCommand:", error);
     res.status(500).json({ message: error.message });
   }
 };
 */
 // backend/src/controllers/commande.controller.js

 // backend/src/controllers/commande.controller.js

 import mongoose from "mongoose";
 import Command from "../models/Commandes.js";
 import Salle from "../models/Salle.js";
 import mqttClient from "../config/mqttClient.js";
 import Evenement from "../models/Event.js";

 // ==================== HELPERS ====================
 const toObjectId = (id) => {
   if (!id) return null;
   try {
     return new mongoose.Types.ObjectId(String(id));
   } catch {
     return null;
   }
 };

 const normalize = (s) => String(s || "").trim().toLowerCase();

 function buildRejectReason({ command, latestEvent }) {
   const evType = latestEvent?.type || "Aucun événement";
   const evMsg = latestEvent?.description || latestEvent?.message || "";
   return `Rejet automatique: action "${command.action}" non conforme au dernier événement "${evType}". ${evMsg}`.trim();
 }

 // ==================== MAPPING ACTIONNEUR -> CAPTEUR ====================
 // IMPORTANT: doit matcher les valeurs de command.device (enum)
 const DEVICE_TO_SENSOR = {
   // Light -> presence
   light: "presence",
   lampe: "presence",
   lamp: "presence",

   // Climatiseur -> temperature
   climatiseur: "temperature",
   clim: "temperature",
   ac: "temperature",
   airconditioner: "temperature",
   heater: "temperature",
   chauffage: "temperature",

   // Alarme -> smoke (ou presence si tu veux)
   alarme: "smoke",
   smoke: "smoke",
   ventilation: "smoke",
   fan: "smoke",
 };

 // ==================== REGLES EVENT -> ACTIONS AUTORISEES ====================
 const EVENT_ALLOWED_ACTIONS = {
   // Presence
   salle_vide: ["TURN_OFF", "STOP"],
   salle_pleine: ["TURN_ON", "TRIGGER"],

   // Temperature
   temperature_elevee: ["TURN_ON", "SET_TEMP", "BOOST", "ECO"],
   temperature_basse: ["TURN_ON", "SET_TEMP", "BOOST", "ECO"],

   // Smoke
   smoke_detected: ["TRIGGER", "TURN_ON"],

   // Energie
   surconsommation: ["ECO", "STOP"],
 };

 // ============================================================
 // ✅ CREER COMMANDE (POSTMAN / APP)
 // ============================================================
 export const createCommand = async (req, res) => {
   try {
     const codeRecherche = req.body.codeSalle?.toString().trim();

     let salle = null;

     if (req.body.salleId) {
       salle = await Salle.findById(req.body.salleId);
     } else if (codeRecherche) {
       salle = await Salle.findOne({
         code: { $regex: `^${codeRecherche}$`, $options: "i" },
       });
     }

     if (!salle) {
       return res.status(404).json({ message: "Salle non trouvée" });
     }

     const command = await Command.create({
       ...req.body,
       salleId: salle._id,
       codeSalle: salle.code,
       status: "PENDING",
     });

     return res.status(201).json(command);
   } catch (error) {
     console.error("Erreur createCommand:", error);
     return res.status(500).json({ message: error.message });
   }
 };

 // ============================================================
 // ✅ LISTER COMMANDES + latestEvent (même salle + capteurType lié au device)
 // ============================================================
 export const getAllCommands = async (req, res) => {
   try {
     const commands = await Command.find()
       .populate("salleId")
       .sort({ createdAt: -1 })
       .lean();

     if (!commands.length) return res.json([]);

     // 1) Construire les pairs uniques (salleId + capteurType attendu)
     const pairs = new Map();
     // key = `${salleId}__${capteurType}` => { salleId:ObjectId, capteurType }

     for (const c of commands) {
       const sid = c?.salleId?._id ? c.salleId._id : c?.salleId;
       const salleKey = sid ? String(sid) : null;
       if (!salleKey) continue;

       const deviceKey = normalize(c.device);
       const capteurType = DEVICE_TO_SENSOR[deviceKey];
       if (!capteurType) continue;

       const key = `${salleKey}__${capteurType}`;
       pairs.set(key, { salleId: toObjectId(salleKey), capteurType });
     }

     // 2) Charger le dernier event pour chaque pair
     const latestMap = new Map(); // key => latestEvent

     await Promise.all(
       Array.from(pairs.entries()).map(async ([key, pair]) => {
         if (!pair.salleId) return;

         const latestEvent = await Evenement.findOne({
           salleId: pair.salleId,
           capteurType: pair.capteurType,
         })
           .sort({ timestamp: -1 })
           .lean();

         latestMap.set(key, latestEvent || null);
       })
     );

     // 3) Enrichir
     const enriched = commands.map((c) => {
       const sid = c?.salleId?._id ? c.salleId._id : c?.salleId;
       const salleKey = sid ? String(sid) : null;

       const deviceKey = normalize(c.device);
       const capteurType = DEVICE_TO_SENSOR[deviceKey];

       const key = salleKey && capteurType ? `${salleKey}__${capteurType}` : null;

       return {
         ...c,
         expectedSensorType: capteurType || null,
         latestEvent: key ? latestMap.get(key) || null : null,
       };
     });

     return res.json(enriched);
   } catch (error) {
     console.error("Erreur getAllCommands:", error);
     return res.status(500).json({ message: error.message });
   }
 };

 // ============================================================
 // ✅ EXECUTER COMMANDE + REJET AUTO
 //    -> dernier event du capteurType lié au device
 // ============================================================
 export const executeCommand = async (req, res) => {
   try {
     const command = await Command.findById(req.params.id);

     if (!command) return res.status(404).json({ message: "Commande introuvable" });
     if (command.status !== "PENDING")
       return res.status(400).json({ message: "Commande déjà traitée" });

     // salleId robuste
     const salleIdObj = toObjectId(command.salleId);
     if (!salleIdObj) {
       return res.status(400).json({ message: "salleId invalide sur la commande" });
     }

     // 1) capteur concerné par l’actionneur
     const deviceKey = normalize(command.device);
     const expectedSensorType = DEVICE_TO_SENSOR[deviceKey];

     if (!expectedSensorType) {
       command.status = "FAILED";
       command.reason = `Rejet automatique: aucun capteur associé à l'actionneur "${command.device}".`;
       await command.save();

       return res.json({
         message: "Commande rejetée automatiquement",
         status: command.status,
         reason: command.reason,
       });
     }

     // 2) dernier event de CE capteurType dans CETTE salle
     const latestEvent = await Evenement.findOne({
       salleId: salleIdObj,
       capteurType: expectedSensorType,
     }).sort({ timestamp: -1 });

     if (!latestEvent) {
       command.status = "FAILED";
       command.reason = `Rejet automatique: aucun événement trouvé pour le capteur "${expectedSensorType}" dans cette salle.`;
       await command.save();

       return res.json({
         message: "Commande rejetée automatiquement",
         status: command.status,
         reason: command.reason,
       });
     }

     // 3) Vérifier compatibilité action <-> event.type
     const allowedActions = EVENT_ALLOWED_ACTIONS[latestEvent.type] || [];

     if (!allowedActions.includes(command.action)) {
       command.status = "FAILED";
       command.reason = buildRejectReason({ command, latestEvent });
       await command.save();

       return res.json({
         message:
           "Commande rejetée automatiquement (non conforme à l’événement du capteur concerné)",
         status: command.status,
         reason: command.reason,
         expectedSensorType,
         latestEvent,
       });
     }

     // 4) OK => publish MQTT
     const topic = `${process.env.MQTT_TOPIC_BASE}/platform/execute`;

     const message = JSON.stringify({
       commandId: command._id,
       salle: command.codeSalle,
       device: command.device,
       action: command.action,
       value: command.value ?? null,
       mode: command.mode ?? null,
     });

     mqttClient.publish(topic, message, { qos: 1 });

     return res.json({
       message: "Commande envoyée pour exécution",
       expectedSensorType,
       latestEvent,
     });
   } catch (error) {
     console.error("Erreur executeCommand:", error);
     return res.status(500).json({ message: error.message });
   }
 };

 // ============================================================
 // ✅ REJETER COMMANDE (manuel)
 // ============================================================
 export const rejectCommand = async (req, res) => {
   try {
     const command = await Command.findById(req.params.id);

     if (!command) return res.status(404).json({ message: "Commande introuvable" });
     if (command.status !== "PENDING")
       return res.status(400).json({ message: "Commande déjà traitée" });

     const reason = (req.body?.reason || "Commande rejetée manuellement")
       .toString()
       .trim();

     command.status = "FAILED";
     command.reason = reason;
     await command.save();

     return res.json({
       message: "Commande rejetée",
       status: command.status,
       reason: command.reason,
     });
   } catch (error) {
     console.error("Erreur rejectCommand:", error);
     return res.status(500).json({ message: error.message });
   }
 };

export const deleteCommand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Tentative suppression commande ID:", id);


    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de commande invalide"
      });
    }

    const command = await Command.findByIdAndDelete(id);

    if (!command) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée"
      });
    }

    console.log("✅ Commande supprimée:", id);

    res.json({
      success: true,
      message: "Commande supprimée avec succès"
    });

  } catch (error) {
    console.error("❌ Erreur suppression commande:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};