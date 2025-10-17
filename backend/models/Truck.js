const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Truck ID
    licensePlate: { type: String, required: true },
    capacity: { type: Number, required: true },
<<<<<<< HEAD
    type: { type: String, enum: ["general", "special"], default: "general" },
    status: { type: String, enum: ["available", "on-duty", "maintenance"], default: "available" },
    // Current truck location (WGS84)
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
=======
    type: { type: String, enum: ["General", "Special"], default: "General" },
    status: { type: String, enum: ["Available", "On Duty", "Maintenance"], default: "Available" },
>>>>>>> origin/main
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "trucks" }
);

module.exports = mongoose.model("Truck", truckSchema);
