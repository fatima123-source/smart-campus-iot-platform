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
    type: String, // presence, temperature, humidity
    required: true
  },

  valeur: {
    type: Number,
    required: true
  },

  capacite: Number,

  description: String,

  notifie: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model("Event", eventSchema,"evenements");
export default Event;
