/*import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

// Configuration DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

// ============ SOLUTION CORS ============
// Permet à votre frontend React (port 5173) de communiquer avec le backend
app.use((req, res, next) => {
  console.log(`📨 Requête reçue: ${req.method} ${req.url}`);
  console.log(`   Origine: ${req.headers.origin || 'inconnue'}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Répondre immédiatement aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('   ✅ Réponse OPTIONS envoyée');
    return res.sendStatus(200);
  }
  
  next();
});
// =======================================

app.use(express.json());

// ============ ROUTES ============
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ API Smart Campus fonctionne !", 
    status: "OK",
    time: new Date().toLocaleString()
  });
});

app.get("/api/capteurs/total", async (req, res) => {
  try {
    console.log("📊 Requête reçue pour /api/capteurs/total");
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: "MongoDB non connecté",
        state: mongoose.connection.readyState 
      });
    }
    
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const total = await collection.countDocuments();
    
    console.log(`✅ ${total} capteurs trouvés`);
    res.json({ total });
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/capteurs", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const capteurs = await collection.find({}).limit(5).toArray();
    res.json(capteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LE TOTAL DES actionneurs ============
app.get("/api/actionneurs/total", async (req, res) => {
  try {
    console.log("⚙️ Requête reçue pour /api/actionneurs/total");
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: "MongoDB non connecté",
        state: mongoose.connection.readyState 
      });
    }
    
    const db = mongoose.connection.db;
    const collection = db.collection('actionneurs');
    const total = await collection.countDocuments();
    
    console.log(`✅ ${total} actionneurs trouvés`);
    res.json({ total });
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});


// DIAGNOSTIC
app.get("/api/diagnostic", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const capteursCount = await db.collection('capteurs').countDocuments();
    const actionneursCount = await db.collection('actionneurs').countDocuments();
    
    res.json({
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        database: mongoose.connection.name,
        collections: collections.map(c => c.name),
        capteurs: capteursCount,
        actionneurs: actionneursCount
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/*
app.get("/api/diagnostic", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const capteursCount = await db.collection('capteurs').countDocuments();
    
    res.json({
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        database: mongoose.connection.name,
        collections: collections.map(c => c.name),
        capteurs_count: capteursCount
      },
      server: {
        time: new Date().toISOString(),
        port: process.env.PORT || 5000,
        cors: "activé"
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});*/


/*

// ============ CONNEXION MONGODB ============
const connectDB = async () => {
  try {
    console.log("🔄 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté avec succès!");
    console.log("📁 Base de données:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error);
    process.exit(1);
  }
};


// ============ ROUTE POUR LES 10 DERNIÈRES DONNÉES ============
app.get("/api/capteurs/recentes", async (req, res) => {
  try {
    console.log("📊 Requête reçue pour /api/capteurs/recentes");
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: "MongoDB non connecté",
        state: mongoose.connection.readyState 
      });
    }
    
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    
    // Récupérer les 10 dernières données triées par lastUpdate
    const recentes = await collection
      .find({})
      .sort({ lastUpdate: -1 })
      .limit(10)
      .toArray();
    
    console.log(`✅ ${recentes.length} données récentes trouvées`);
    res.json(recentes);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});



// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log(`🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
    console.log("=".repeat(50));
    console.log(`📌 Accueil: http://localhost:${PORT}/`);
    console.log(`📊 Total capteurs: http://localhost:${PORT}/api/capteurs/total`);
    console.log(`📋 Liste capteurs: http://localhost:${PORT}/api/capteurs`);
      console.log(`⚙️ Actionneurs: http://localhost:${PORT}/api/actionneurs/total`);
    console.log(`🔍 Diagnostic: http://localhost:${PORT}/api/diagnostic`);
    console.log(`🔓 CORS: Activé (toutes origines autorisées)`);
    console.log("=".repeat(50) + "\n");
  });
});*/














/*

import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

// Configuration DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

// ============ CORS ============
app.use((req, res, next) => {
  console.log(`📨 Requête reçue: ${req.method} ${req.url}`);
  console.log(`   Origine: ${req.headers.origin || 'inconnue'}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ ROUTES ============

// Test
app.get("/", (req, res) => {
  res.json({ message: "✅ API Smart Campus" });
});



// ============ ROUTE POUR L'HISTORIQUE ============
app.get("/api/history/data", async (req, res) => {
  try {
    console.log("📊 Route /api/history/data appelée");
    
    const db = mongoose.connection.db;
    
    // Chercher dans plusieurs collections possibles
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    let data = [];
    let source = '';
    
    if (names.includes('history_queries')) {
      data = await db.collection('history_queries').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      source = 'history_queries';
    } else if (names.includes('events')) {
      data = await db.collection('events').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      source = 'events';
    } else if (names.includes('historique_capteurs')) {
      data = await db.collection('historique_capteurs').find({}).sort({ lastUpdate: -1 }).limit(100).toArray();
      source = 'historique_capteurs';
    } else if (names.includes('capteurs')) {
      data = await db.collection('capteurs').find({}).sort({ lastUpdate: -1 }).limit(100).toArray();
      source = 'capteurs';
    }
    
    console.log(`✅ ${data.length} données trouvées dans ${source || 'aucune collection'}`);
    res.json(data);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES STATISTIQUES ============
app.get("/api/history/stats", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    let stats = [];
    
    if (names.includes('history_queries')) {
      stats = await db.collection('history_queries').aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, avgValue: { $avg: "$value" } } }
      ]).toArray();
    } else if (names.includes('events')) {
      stats = await db.collection('events').aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]).toArray();
    }
    
    res.json(stats);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});










// TOTAL CAPTEURS
app.get("/api/capteurs/total", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const total = await collection.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TOTAL ACTIONNEURS
app.get("/api/actionneurs/total", async (req, res) => {
  try {
    console.log("⚙️ Actionneurs total");
    const db = mongoose.connection.db;
    const collection = db.collection('actionneurs');
    const total = await collection.countDocuments();
    console.log(`✅ ${total} actionneurs`);
    res.json({ total });
  } catch (error) {
    console.error("❌ Erreur actionneurs:", error);
    res.status(500).json({ error: error.message });
  }
});

// 10 DERNIÈRES DONNÉES CAPTEURS
app.get("/api/capteurs/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const recentes = await collection
      .find({})
      .sort({ lastUpdate: -1 })
      .limit(10)
      .toArray();
    res.json(recentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ROUTE POUR LES DONNÉES DE TEMPÉRATURE
app.get("/api/capteurs/temperature", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const data = await collection
      .find({ type: { $in: ['temperature', 'température'] } })
      .sort({ lastUpdate: -1 })
      .limit(20)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE POUR LES DONNÉES D'ÉNERGIE
app.get("/api/capteurs/energie", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const data = await collection
      .find({ type: { $in: ['energie', 'énergie', 'electricite'] } })
      .sort({ lastUpdate: -1 })
      .limit(20)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ============ ROUTE SIMPLE POUR L'OCCUPATION ============
app.get("/api/salles/occupation-simple", async (req, res) => {
  try {
    console.log("🏢 Requête occupation simple");
    
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    
    // Récupérer toutes les mesures de présence
    const presences = await collection
      .find({ 
        type: { $in: ['presence', 'mouvement', 'occupation'] } 
      })
      .sort({ lastUpdate: -1 })
      .limit(50)
      .toArray();
    
    if (presences.length === 0) {
      return res.json([]);
    }
    
    // Grouper manuellement par salle
    const sallesMap = new Map();
    
    presences.forEach(p => {
      const salleId = p.salleId?.toString() || 'inconnue';
      if (!sallesMap.has(salleId)) {
        sallesMap.set(salleId, {
          salle: salleId.substring(0, 8),
          valeurs: []
        });
      }
      sallesMap.get(salleId).valeurs.push(p.value);
    });
    
    // Calculer la moyenne par salle
    const result = Array.from(sallesMap.entries()).map(([id, data]) => {
      const moyenne = data.valeurs.reduce((a, b) => a + b, 0) / data.valeurs.length;
      let occupation = 0;
      
      if (typeof moyenne === 'number') {
        if (moyenne <= 1) {
          occupation = Math.round(moyenne * 100);
        } else if (moyenne <= 100) {
          occupation = Math.round(moyenne);
        } else {
          occupation = Math.min(Math.round(moyenne / 50 * 100), 100);
        }
      }
      
      return {
        salle: data.salle,
        occupation: occupation,
       
        mesures: data.valeurs.length
      };
    });
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});





/*app.get("/api/salles/debug-complet", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Récupérer quelques capteurs avec leurs salleId COMPLETS
    const capteurs = await db.collection('capteurs')
      .find({ type: { $in: ['presence', 'mouvement'] } })
      .limit(5)
      .toArray();
    
    // Récupérer quelques salles avec leurs IDs COMPLETS
    const salles = await db.collection('Salles')
      .find({})
      .limit(5)
      .toArray();
    
    // Afficher les IDs COMPLETS des capteurs
    const capteursInfos = capteurs.map(c => ({
      salleIdOriginal: c.salleId,
      salleIdString: c.salleId?.toString(),
      type: typeof c.salleId,
      value: c.value
    }));
    
    // Afficher les IDs COMPLETS des salles
    const sallesInfos = salles.map(s => ({
      idOriginal: s._id,
      idString: s._id.toString(),
      nom: s.name || s.code,
      code: s.code
    }));
    
    res.json({
      capteurs: capteursInfos,
      salles: sallesInfos,
      message: "Vérifiez que les IDs COMPLETS correspondent"
    });
    
  } catch (error) {
    res.json({ error: error.message });
  }
});
   */



// ============ ROUTE POUR LES ÉVÉNEMENTS ============
/*
app.get("/api/evenements", async (req, res) => {
  try {
    console.log("📋 Route /api/evenements appelée");
    
    const db = mongoose.connection.db;
    
    // Vérifier les collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Collections:", collectionNames);
    
    if (!collectionNames.includes('evenements')) {
      console.log("⚠️ Collection evenements non trouvée");
      return res.json([]);
    }
    
    const evenements = await db.collection('evenements')
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    
    console.log(`✅ ${evenements.length} événements trouvés`);
    
    // Récupérer les salles
    let sallesMap = new Map();
    if (collectionNames.includes('Salles')) {
      const salles = await db.collection('Salles').find({}).toArray();
      salles.forEach(s => sallesMap.set(s._id.toString(), s.name || s.code || 'Salle'));
    }
    
    const result = evenements.map(event => {
      const salleId = event.sallleId?.toString() || event.salleId?.toString() || '';
      const salle = sallesMap.get(salleId) || 'Salle inconnue';
      
      return {
        type: event.type,
        salle: salle,
        timestamp: event.timestamp,
        temperature: event.temperature,
        humidite: event.humidity,
        urgent: event.type === 'salle_pleine'
      };
    });
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});



// ============ ROUTE POUR L'HISTORIQUE DES CAPTEURS ============
app.get("/api/historique/capteurs", async (req, res) => {
  try {
    console.log("📊 Route /api/historique/capteurs appelée");
    
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    // Vérifier si la collection existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("📚 Collections disponibles:", collectionNames);
    
    if (!collectionNames.includes('historique_capteurs')) {
      console.log("⚠️ Collection 'historique_capteurs' non trouvée");
      return res.json([]);
    }
    
    // Récupérer les données
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray();
    
    console.log(`✅ ${data.length} données trouvées dans historique_capteurs`);
    res.json(data);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});


// DIAGNOSTIC
app.get("/api/diagnostic", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const capteursCount = await db.collection('capteurs').countDocuments();
    const actionneursCount = await db.collection('actionneurs').countDocuments();
    
    res.json({
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        database: mongoose.connection.name,
        collections: collections.map(c => c.name),
        capteurs: capteursCount,
        actionneurs: actionneursCount
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ============ CONNEXION MONGODB ============
const connectDB = async () => {
  try {
    console.log("🔄 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté!");
    console.log("📁 Base:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error);
    process.exit(1);
  }
};

// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log(`🚀 SERVEUR SUR http://localhost:${PORT}`);
    console.log("=".repeat(50));
    console.log(`📊 Capteurs: http://localhost:${PORT}/api/capteurs/total`);
    console.log(`⚙️ Actionneurs: http://localhost:${PORT}/api/actionneurs/total`);
     console.log(`📊 History: http://localhost:${PORT}/api/history/data`);
    console.log(`📋 Récentes: http://localhost:${PORT}/api/capteurs/recentes`);
    console.log("=".repeat(50) + "\n");
  });
});
*/






































/*
import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

// Configuration DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

// ============ CORS ============
app.use((req, res, next) => {
  console.log(`📨 Requête reçue: ${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ ROUTE DE TEST ============
app.get("/", (req, res) => {
  res.json({ message: "✅ Serveur OK", time: new Date().toLocaleString() });
});

// ============ ROUTE POUR L'HISTORIQUE DES CAPTEURS ============
app.get("/api/historique/capteurs", async (req, res) => {
  try {
    console.log("📊 Route /api/historique/capteurs appelée");
    
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    // Vérifier si la collection existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("📚 Collections disponibles:", collectionNames);
    
    if (!collectionNames.includes('historique_capteurs')) {
      console.log("⚠️ Collection 'historique_capteurs' non trouvée");
      return res.json([]);
    }
    
    // Récupérer les données
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray();
    
    console.log(`✅ ${data.length} données trouvées dans historique_capteurs`);
    res.json(data);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES CAPTEURS ============
app.get("/api/capteurs/total", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const total = await collection.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES ACTIONNEURS ============
app.get("/api/actionneurs/total", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('actionneurs');
    const total = await collection.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES DONNÉES RÉCENTES ============
app.get("/api/capteurs/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const recentes = await collection
      .find({})
      .sort({ lastUpdate: -1 })
      .limit(50)
      .toArray();
    res.json(recentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ============ ROUTE POUR LA TEMPÉRATURE ============
app.get("/api/capteurs/temperature", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: 'temperature' })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR L'ÉNERGIE ============
app.get("/api/capteurs/energie", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['energie', 'electricite'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LA PRÉSENCE ============
app.get("/api/capteurs/presence", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['presence', 'mouvement'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LA FUMÉE ============
app.get("/api/capteurs/fume", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['fume', 'qualite_air', 'fumée'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ============ ROUTE POUR LES ÉVÉNEMENTS ============

// ============ ROUTE POUR LES ÉVÉNEMENTS ============

app.get("/api/evenements", async (req, res) => {
  try {
    console.log("📋 Route /api/evenements appelée");
    
    const db = mongoose.connection.db;
    
    // Vérifier les collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Collections:", collectionNames);
    
    if (!collectionNames.includes('evenements')) {
      console.log("⚠️ Collection evenements non trouvée");
      return res.json([]);
    }
    
    const evenements = await db.collection('evenements')
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    
    console.log(`✅ ${evenements.length} événements trouvés`);
    
    // Récupérer les salles
    let sallesMap = new Map();
    if (collectionNames.includes('Salles')) {
      const salles = await db.collection('Salles').find({}).toArray();
      salles.forEach(s => sallesMap.set(s._id.toString(), s.name || s.code || 'Salle'));
    }
    
    const result = evenements.map(event => {
      const salleId = event.sallleId?.toString() || event.salleId?.toString() || '';
      const salle = sallesMap.get(salleId) || 'Salle inconnue';
      
      return {
        type: event.type,
        salle: salle,
        timestamp: event.timestamp,
        temperature: event.temperature,
        humidite: event.humidity,
        urgent: event.type === 'salle_pleine'
      };
    });
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});


// 10 DERNIÈRES DONNÉES CAPTEURS
app.get("/api/capteurs/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const recentes = await collection
      .find({})
      .sort({ lastUpdate: -1 })
      .limit(10)
      .toArray();
    res.json(recentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// ============ ROUTE POUR LES ÉVÉNEMENTS ============
app.get("/api/evenements", async (req, res) => {
  try {
    console.log("📋 Route /api/evenements appelée");
    
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Collections:", collectionNames);
    
    if (!collectionNames.includes('evenements')) {
      console.log("⚠️ Collection evenements non trouvée");
      return res.json([]);
    }
    
    const evenements = await db.collection('evenements')
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    
    console.log(`✅ ${evenements.length} événements trouvés`);
    
    let sallesMap = new Map();
    if (collectionNames.includes('Salles')) {
      const salles = await db.collection('Salles').find({}).toArray();
      salles.forEach(s => sallesMap.set(s._id.toString(), s.name || s.code || 'Salle'));
    }
    
    const result = evenements.map(event => {
      const salleId = event.sallleId?.toString() || event.salleId?.toString() || '';
      const salle = sallesMap.get(salleId) || 'Salle inconnue';
      
      return {
        type: event.type,
        salle: salle,
        timestamp: event.timestamp,
        temperature: event.temperature,
        humidite: event.humidity,
        urgent: event.type === 'salle_pleine',
        icone: event.type === 'salle_pleine' ? '🚨' : 
               event.type === 'salle_vide' ? '⚠️' : '📌',
        couleur: event.type === 'salle_pleine' ? '#e74c3c' : 
                 event.type === 'salle_vide' ? '#f39c12' : '#3498db'
      };
    });
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});


// ============ ROUTE DIAGNOSTIC ============
app.get("/api/diagnostic", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const counts = {};
    for (const coll of collections) {
      try {
        const count = await db.collection(coll.name).countDocuments();
        counts[coll.name] = count;
      } catch (e) {
        counts[coll.name] = 'erreur';
      }
    }
    
    res.json({
      status: "✅ Connecté",
      database: mongoose.connection.name,
      collections: collections.map(c => c.name),
      counts: counts
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ============ CONNEXION MONGODB ============
const connectDB = async () => {
  try {
    console.log("🔄 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté!");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📚 Collections disponibles:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error);
    process.exit(1);
  }
};

// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
    console.log("=".repeat(60));
    console.log(`📊 Historique capteurs: http://localhost:${PORT}/api/historique/capteurs`);
    console.log(`📋 Diagnostic: http://localhost:${PORT}/api/diagnostic`);
    console.log("=".repeat(60) + "\n");
  });
});*/
import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

// Configuration DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

// ============ CORS ============
app.use((req, res, next) => {
  console.log(`📨 Requête reçue: ${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ ROUTE DE TEST ============
app.get("/", (req, res) => {
  res.json({ message: "✅ Serveur OK", time: new Date().toLocaleString() });
});

// ============ ROUTE POUR L'HISTORIQUE DES CAPTEURS ============
app.get("/api/historique/capteurs", async (req, res) => {
  try {
    console.log("📊 Route /api/historique/capteurs appelée");
    
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    // Vérifier si la collection existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("📚 Collections disponibles:", collectionNames);
    
    if (!collectionNames.includes('historique_capteurs')) {
      console.log("⚠️ Collection 'historique_capteurs' non trouvée");
      return res.json([]);
    }
    
    // Récupérer les données
    const data = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray();
    
    console.log(`✅ ${data.length} données trouvées dans historique_capteurs`);
    res.json(data);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES 10 DERNIÈRES DONNÉES DE L'HISTORIQUE ============
app.get("/api/historique/recentes", async (req, res) => {
  try {
    console.log("📊 Route /api/historique/recentes appelée");
    
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('historique_capteurs')) {
      console.log("⚠️ Collection 'historique_capteurs' non trouvée");
      return res.json([]);
    }
    
    const recentes = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    console.log(`✅ ${recentes.length} dernières données trouvées`);
    res.json(recentes);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES 10 DERNIÈRES TEMPÉRATURES ============
app.get("/api/historique/temperatures/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    const recentes = await collection
      .find({ type: 'temperature' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.json(recentes);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES 10 DERNIÈRES ÉNERGIES ============
app.get("/api/historique/energies/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    const recentes = await collection
      .find({ type: 'energie' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.json(recentes);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES 10 DERNIÈRES PRÉSENCES ============
app.get("/api/historique/presences/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('historique_capteurs');
    
    const recentes = await collection
      .find({ type: 'presence' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.json(recentes);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES CAPTEURS ============
app.get("/api/capteurs/total", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const total = await collection.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES ACTIONNEURS ============
app.get("/api/actionneurs/total", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('actionneurs');
    const total = await collection.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES DONNÉES RÉCENTES ============
app.get("/api/capteurs/recentes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('capteurs');
    const recentes = await collection
      .find({})
      .sort({ lastUpdate: -1 })
      .limit(10)
      .toArray();
    res.json(recentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LA TEMPÉRATURE ============
app.get("/api/capteurs/temperature", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: 'temperature' })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR L'ÉNERGIE ============
app.get("/api/capteurs/energie", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['energie', 'electricite'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LA PRÉSENCE ============
app.get("/api/capteurs/presence", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['presence', 'mouvement'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LA FUMÉE ============
app.get("/api/capteurs/fume", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const data = await db.collection('capteurs')
      .find({ type: { $in: ['fume', 'qualite_air', 'fumée'] } })
      .sort({ lastUpdate: -1 })
      .limit(30)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR LES ÉVÉNEMENTS ============
app.get("/api/evenements", async (req, res) => {
  try {
    console.log("📋 Route /api/evenements appelée");
    
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Collections:", collectionNames);
    
    if (!collectionNames.includes('evenements')) {
      console.log("⚠️ Collection evenements non trouvée");
      return res.json([]);
    }
    
    const evenements = await db.collection('evenements')
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    
    console.log(`✅ ${evenements.length} événements trouvés`);
    
    let sallesMap = new Map();
    if (collectionNames.includes('Salles')) {
      const salles = await db.collection('Salles').find({}).toArray();
      salles.forEach(s => sallesMap.set(s._id.toString(), s.name || s.code || 'Salle'));
    }
    
    const result = evenements.map(event => {
      const salleId = event.sallleId?.toString() || event.salleId?.toString() || '';
      const salle = sallesMap.get(salleId) || 'Salle inconnue';
      
      return {
        type: event.type,
        salle: salle,
        timestamp: event.timestamp,
        temperature: event.temperature,
        humidite: event.humidity,
        urgent: event.type === 'salle_pleine',
        icone: event.type === 'salle_pleine' ? '🚨' : 
               event.type === 'salle_vide' ? '⚠️' : '📌',
        couleur: event.type === 'salle_pleine' ? '#e74c3c' : 
                 event.type === 'salle_vide' ? '#f39c12' : '#3498db'
      };
    });
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE POUR L'OCCUPATION DES SALLES ============
app.get("/api/salles/occupation", async (req, res) => {
  try {
    console.log("🏢 Route /api/salles/occupation appelée");
    
    const db = mongoose.connection.db;
    const capteursCollection = db.collection('historique_capteurs');
    const sallesCollection = db.collection('Salles');
    
    // Récupérer les salles
    const salles = await sallesCollection.find({}).toArray();
    const sallesMap = new Map();
    salles.forEach(salle => {
      sallesMap.set(salle._id.toString(), {
        nom: salle.name || salle.code || 'Salle inconnue',
        code: salle.code
      });
    });
    
    // Récupérer les données de présence
    const presences = await capteursCollection
      .find({ type: 'presence' })
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray();
    
    // Grouper par salle
    const occupationMap = new Map();
    
    presences.forEach(item => {
      const salleId = item.salleId?.toString() || 'inconnue';
      if (!occupationMap.has(salleId)) {
        occupationMap.set(salleId, { total: 0, count: 0, salleId: salleId });
      }
      const current = occupationMap.get(salleId);
      current.total += item.value;
      current.count += 1;
    });
    
    // Calculer l'occupation moyenne
    const result = Array.from(occupationMap.entries()).map(([id, data]) => {
      const salleInfo = sallesMap.get(id) || { nom: `Salle ${id.substring(0, 6)}`, code: '' };
      const moyenne = data.total / data.count;
      
      return {
        salle: salleInfo.nom,
        personnes: Math.round(moyenne * 10) / 10,
        mesures: data.count
      };
    }).sort((a, b) => b.personnes - a.personnes);
    
    console.log(`✅ ${result.length} salles avec occupation`);
    res.json(result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTE DIAGNOSTIC ============
app.get("/api/diagnostic", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const counts = {};
    for (const coll of collections) {
      try {
        const count = await db.collection(coll.name).countDocuments();
        counts[coll.name] = count;
      } catch (e) {
        counts[coll.name] = 'erreur';
      }
    }
    
    res.json({
      status: "✅ Connecté",
      database: mongoose.connection.name,
      collections: collections.map(c => c.name),
      counts: counts
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ============ CONNEXION MONGODB ============
const connectDB = async () => {
  try {
    console.log("🔄 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté!");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📚 Collections disponibles:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error);
    process.exit(1);
  }
};

// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
    console.log("=".repeat(60));
    console.log(`📊 Historique: http://localhost:${PORT}/api/historique/capteurs`);
    console.log(`📊 10 dernières: http://localhost:${PORT}/api/historique/recentes`);
    console.log(`🌡️ Températures récentes: http://localhost:${PORT}/api/historique/temperatures/recentes`);
    console.log(`⚡ Énergies récentes: http://localhost:${PORT}/api/historique/energies/recentes`);
    console.log(`👥 Présences récentes: http://localhost:${PORT}/api/historique/presences/recentes`);
    console.log(`📋 Événements: http://localhost:${PORT}/api/evenements`);
    console.log(`🏢 Occupation: http://localhost:${PORT}/api/salles/occupation`);
    console.log(`📋 Diagnostic: http://localhost:${PORT}/api/diagnostic`);
    console.log("=".repeat(60) + "\n");
  });
});