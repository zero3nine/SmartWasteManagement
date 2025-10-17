const mongoose = require("mongoose");

const BinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // bin ID
  location: { type: String, required: true },
  size: { type: Number, default: 20 }, // in liters
  fillLevel: { type: Number, default: 0 },
  type: { type: String, enum: ["General Waste", "Special Waste"], default: "General Waste" },
  status: { type: String, enum: ["Idle", "Scheduled"], default: "Idle" },
  pickupTruckId: { type: String, default: null },
  lastCollected: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Bin", BinSchema);
