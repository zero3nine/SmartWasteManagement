const mongoose = require("mongoose");

const specialRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ["General Waste", "Special Waste"], required: true },
    description: { type: String },
    estimatedSize: { type: Number },        
    address: { type: String },
    contact: { type: String },
    name: { type: String },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Scheduled", "Completed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpecialRequest", specialRequestSchema);
