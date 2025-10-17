const express = require("express");
const router = express.Router();
const Truck = require("../models/Truck");
const Route = require("../models/Route");
const SpecialRequest = require("../models/SpecialRequest");
const Bin = require("../models/Bin");

// GET all trucks
router.get("/trucks", async (req, res) => {
  try {
    const trucks = await Truck.find().sort({ createdAt: -1 });
    res.json(trucks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch trucks." });
  }
});

// POST add a new truck
router.post("/trucks", async (req, res) => {
  const { id, licensePlate, capacity, type, status, userId, address } = req.body;

  if (!id || !licensePlate || !capacity || !userId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await Truck.findOne({ id });
    if (existing) return res.status(400).json({ message: "Truck ID already exists." });

    const newTruck = new Truck({ id, licensePlate, capacity, type, status, userId, address });
    await newTruck.save();
    res.status(201).json(newTruck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add truck." });
  }
});

//Get truck by userId
router.get("/trucks/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const trucks = await Truck.find({ userId }).sort({ createdAt: -1 });
    res.json(trucks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch trucks." });
  }
});

// Update truck by ID
router.patch("/trucks/:id", async (req, res) => {
  try {
    const updatedTruck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTruck);
  } catch (err) {
    res.status(500).json({ message: "Failed to update truck." });
  }
});

// GET routes assigned to collector's trucks
router.get("/routes/:userId", async (req, res) => {
  try {
    // Find all trucks owned by this collector
    const collectorTrucks = await Truck.find({ userId: req.params.userId }).select("_id");
    const truckIds = collectorTrucks.map((t) => t._id);

    // Find routes assigned to those trucks
    const routes = await Route.find({ truckId: { $in: truckIds } })
      .populate("truckId", "licensePlate status")
      .populate("bins", "location type status fillLevel")
      .populate("specialRequests", "address type estimatedSize status");

    res.json(routes);
  } catch (err) {
    console.error("Error fetching collector routes:", err);
    res.status(500).json({ message: "Failed to fetch assigned routes", error: err.message });
  }
});

// PATCH mark a bin as done
router.patch("/bins/:binId/done", async (req, res) => {
  try {
    const { binId } = req.params;
    const updatedBin = await Bin.findByIdAndUpdate(
      binId,
      { status: "Idle", fillLevel: 0 },
      { new: true }
    );
    if (!updatedBin) return res.status(404).json({ message: "Bin not found" });
    res.json(updatedBin);
  } catch (err) {
    console.error("Error marking bin done:", err);
    res.status(500).json({ message: "Failed to update bin", error: err.message });
  }
});


// PATCH finish route
router.patch("/routes/finish/:routeId", async (req, res) => {
  try {
    // Find route
    const route = await Route.findById(req.params.routeId);
    if (!route) return res.status(404).json({ message: "Route not found" });

    // Update truck status to Available
    await Truck.findByIdAndUpdate(route.truckId, { status: "Available" });

    await Route.findByIdAndDelete(req.params.routeId);

    res.json({ message: "Route finished successfully" });
  } catch (err) {
    console.error("Error finishing route:", err);
    res.status(500).json({ message: "Failed to finish route", error: err.message });
  }
});


module.exports = router;
