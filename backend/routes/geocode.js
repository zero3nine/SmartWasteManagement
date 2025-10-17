const express = require("express");
const router = express.Router();
const { geocodeAddress } = require("../utils/geocode");

// GET /api/geocode?address=...
router.get("/", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || address.trim().length === 0) {
      return res.status(400).json({ message: "address query param is required" });
    }
    const coords = await geocodeAddress(address);
    if (!coords) {
      return res.status(404).json({ message: "Coordinates not found for the given address" });
    }
    res.json(coords);
  } catch (err) {
    console.error("Geocoding error:", err);
    res.status(500).json({ message: "Failed to geocode address" });
  }
});

module.exports = router;


