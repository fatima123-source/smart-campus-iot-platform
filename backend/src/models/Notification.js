import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  event: { type: mongoose.Schema.Types.Mixed },
  lu: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);


