// routes/specialRequestRoutes.js
const express = require("express");
const router = express.Router();
const SpecialRequest = require("../models/SpecialRequest");

// Create new special request
router.post("/", async (req, res) => {
  const { userId, type, description, scheduledDate } = req.body;
  try {
    const newRequest = await SpecialRequest.create({
      userId,
      type,
      description,
      scheduledDate,
    });
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating special request:", err);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// Get all requests for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const requests = await SpecialRequest.find({ userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

module.exports = router;
