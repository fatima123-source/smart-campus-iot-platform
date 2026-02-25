import mongoose from "mongoose";
import Event from "../models/Event.js";
import Salle from "../models/Salle.js";

mongoose.connect("mongodb+srv://<user>:<pass>@<cluster>/smart-campus", {
  dbName: "smart-campus",
})
.then(() => console.log("✅ MongoDB connected"))
.catch(console.error);

async function migrate() {
  const events = await Event.find();
  for (const e of events) {
    // Cherche la salle correspondante via salleId
    const salle = await Salle.findById(e.salleId);
    if (salle) {
      e.salle = salle._id; // ⚡ Remplir le champ salle
      await e.save();
      console.log(`✅ Événement ${e._id} migré`);
    } else {
      console.log(`⚠️ Salle non trouvée pour ${e._id}`);
    }
  }
  console.log("Migration terminée");
  process.exit();
}

migrate();