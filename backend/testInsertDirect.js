// testInsertDirect.js
import mongoose from "mongoose";

const mongoURI = "mongodb://localhost:27017/ton_nom_de_db"; // 🔹 mets ton nom de DB

// Connecte-toi à MongoDB
async function main() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connecté à MongoDB");

    // On choisit directement la collection "evenements"
    const collection = mongoose.connection.collection("evenements");

    // Document test
    const doc = {
      type: "temperature_elevee",
      salleId: "65f1a1111111111111111111",
      capteurType: "temperature",
      valeur: 30,
      capacite: 20,
      message: "Test insertion directe",
      traite: false,
      timestamp: new Date()
    };

    const result = await collection.insertOne(doc);
    console.log("✅ Document inséré :", result.insertedId);

    // Fermer la connexion
    await mongoose.connection.close();
    console.log("🔒 Connexion fermée");
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

main();