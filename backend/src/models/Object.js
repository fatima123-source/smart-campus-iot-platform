import mongoose from "mongoose";

const ObjectSchema = new mongoose.Schema({
  nomObjet: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["temperature", "fumee", "presence", "consomation", "autre"],
    required: true
  },
  customType: {
    type: String,
    default: null
  },
  statut: {
    type: String,
    enum: ["actif", "inactif"],
    default: "actif"
  },
  actionneurLie: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model("Object", ObjectSchema);
