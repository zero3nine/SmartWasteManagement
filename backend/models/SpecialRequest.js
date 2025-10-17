// models/SpecialRequest.js
const mongoose = require("mongoose");

const specialRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "Large Item", "Electronics", etc.
  description: { type: String },
  scheduledDate: { type: Date },
  status: { type: String, default: "Pending" }, // Pending, Approved, Completed
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SpecialRequest", specialRequestSchema);
