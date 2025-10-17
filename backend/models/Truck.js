const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Truck ID
    licensePlate: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ["general", "special"], default: "general" },
    status: { type: String, enum: ["available", "on-duty", "maintenance"], default: "available" },
    // Current truck location (WGS84)
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "trucks" }
);

module.exports = mongoose.model("Truck", truckSchema);
