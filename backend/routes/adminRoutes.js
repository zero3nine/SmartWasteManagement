const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

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

module.exports = router;
