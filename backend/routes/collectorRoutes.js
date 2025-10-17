const express = require("express");
const router = express.Router();
const Truck = require("../models/Truck");

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
  const { id, licensePlate, capacity, type, status, userId } = req.body;

  if (!id || !licensePlate || !capacity || !userId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await Truck.findOne({ id });
    if (existing) return res.status(400).json({ message: "Truck ID already exists." });

    const newTruck = new Truck({ id, licensePlate, capacity, type, status, userId });
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


module.exports = router;
