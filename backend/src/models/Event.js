const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  nomEvent: {
    type: String,
    required: true
  },
  sensorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensor",
    required: true
  },
  typeEvent: {
    type: String,
    required: true
  },
  valeur: {
    type: Number,
    required: true
  },
  seuil: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ["normal", "detecte"],
    default: "normal"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", eventSchema);

