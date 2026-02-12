import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    application: { type: String, required: true },
    device: { type: String, required: true, enum: ["light", "clim", "alarm"] },
    salleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Salle" },
    codeSalle: { type: String, required: true },
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

    value: Number, // pour SET_TEMP
    mode: String,  // pour BOOST / ECO
    reason: String // pour TRIGGER
  },
  { timestamps: true }
);

export default mongoose.model("Command", commandSchema);
