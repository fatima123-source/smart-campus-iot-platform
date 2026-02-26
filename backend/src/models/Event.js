import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },

  salleId: {
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
    type: String
  },

  notifie: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
} ,{ collection: "events" });

const Event = mongoose.model("Event", eventSchema);
export default Event;