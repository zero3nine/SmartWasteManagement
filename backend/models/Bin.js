const mongoose = require("mongoose");

const BinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // bin ID
  location: { type: String, required: true },
  fillLevel: { type: Number, default: 0 },
  type: { type: String, enum: ["general", "organic", "recyclable"], default: "general" },
  lastCollected: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Bin", BinSchema);
