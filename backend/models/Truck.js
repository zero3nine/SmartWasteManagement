const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Truck ID
    licensePlate: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ["General", "Special"], default: "General" },
    status: { type: String, enum: ["Available", "On Duty", "Maintenance"], default: "Available" },
    userId: { type: String, required: true },
    // Human-readable address for the truck's base/current location
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "trucks" }
);

module.exports = mongoose.model("Truck", truckSchema);
