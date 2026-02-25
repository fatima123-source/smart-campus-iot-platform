// src/models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Subscription", subscriptionSchema);