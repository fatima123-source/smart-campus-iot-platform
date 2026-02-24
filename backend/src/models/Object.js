import mongoose from "mongoose";

const ObjectSchema = new mongoose.Schema({
  nomObjet: {
    type: String,
    required: true
  },

  typeObjet: {
    type: String,
    enum: ["capteur", "actionneur"],
    required: true
  },

  categorie: {
    type: String,
    required: true
  },

  statut: {
    type: String,
    enum: ["actif", "inactif"],
    default: "actif"
  }

}, { timestamps: true });

export default mongoose.model("Object", ObjectSchema);