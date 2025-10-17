const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");
const Route = require("../models/Route");

// POST /api/admin/bins → add a new bin
router.post("/bins", async (req, res) => {
  try {
    const bin = await Bin.create(req.body);
    res.status(201).json(bin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add bin", error: err.message });
  }
});

// GET /api/admin/bins → get all bins
router.get("/bins", async (req, res) => {
  try {
    const bins = await Bin.find().sort({ createdAt: -1 });
    res.status(200).json(bins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bins", error: err.message });
  }
});

// Update bin by ID
router.patch("/bins/:id", async (req, res) => {
  try {
    const updatedBin = await Bin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBin);
  } catch (err) {
    res.status(500).json({ message: "Failed to update bin." });
  }
});

//POST /api/admin/routes → save generated collection routes
router.post("/routes", async (req, res) => {
  try {
    const { truckId, driverId, bins, specialRequests, date } = req.body;

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required." });
    }

    // Allow routes that have either bins or special requests
    if ((!bins || bins.length === 0) && (!specialRequests || specialRequests.length === 0)) {
      return res.status(400).json({ message: "At least one bin or special request is required." });
    }

    const routeDate = date ? new Date(date) : new Date();

    const newRoute = new Route({
      truckId,
      bins: bins || [],
      specialRequests: specialRequests || [],
    });

    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) {
    console.error("Error saving route:", err);
    res.status(500).json({ message: "Failed to save route", error: err.message });
  }
});

// GET /api/admin/routes → view all saved routes
router.get("/routes", async (req, res) => {
  try {
    const routes = await Route.find()
      .populate("truckId", "licensePlate status")
      .populate("bins", "location type status")
      .populate("specialRequests", "address type estimatedSize status");
    res.json(routes);
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Failed to fetch routes", error: err.message });
  }
});



module.exports = router;
