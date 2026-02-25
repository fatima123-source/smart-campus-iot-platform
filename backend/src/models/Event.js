import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },

  // IMPORTANT : STRING (pas ObjectId)
  salle: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Salle",
  required: true
},

  capteurType: {
    type: String,
    required: true
  },

  valeur: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  notifie: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

// ⚠️ PAS de hook pour l’instant (on simplifie)
const Event = mongoose.model("Event", eventSchema, "evenements");

export default Event;