const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck",
    required: true,
  },
  bins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
      unique: true,
    },
  ],
  specialRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecialRequest",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Route", routeSchema);
