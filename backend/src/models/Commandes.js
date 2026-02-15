import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    application: {
      type: String,
      required: true
    },

    device: {
      type: String,
      required: true,
      enum: ["Light", "Climatiseur", "Alarme"]
    },

    salleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salle",
      required: true
    },

    codeSalle: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true,
      enum: ["TURN_ON", "TURN_OFF", "SET_TEMP", "BOOST", "ECO", "TRIGGER", "STOP"]
    },

    status: {
      type: String,
      enum: ["PENDING", "EXECUTED", "FAILED"],
      default: "PENDING"
    },

    value: Number,
    mode: String,
    reason: String,      // 👈 Pour stocker la raison du rejet
    executedAt: Date,    // 👈 Date d'exécution
    rejectedAt: Date     // 👈 Date de rejet
  },
  {
    timestamps: true     // 👈 Gère automatiquement createdAt et updatedAt
  }
);

export default mongoose.model("Command", commandSchema);