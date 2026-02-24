import mongoose from "mongoose";

const salleSchema = new mongoose.Schema({
  code: String,
  name: String,
  type: String,
  department: String,
  building: String,
  annexe: String,
  floor: Number,
  capacity: Number,
  description: String
}, { collection: "Salles" });

export default mongoose.model("Salle", salleSchema);

