const express = require("express");
const router = express.Router();
const SpecialRequest = require("../models/SpecialRequest");

// POST /api/special-request → create a new special request
router.post("/", async (req, res) => {
  try {
    const { userId, type, description, estimatedSize, address, name, contact, scheduledDate } = req.body;

    if (!userId || !type || !scheduledDate) {
      return res.status(400).json({ message: "User, type, and scheduled date are required." });
    }

    const newRequest = await SpecialRequest.create({
      userId,
      type,
      description,
      estimatedSize,
      address,
      name, 
      contact,
      scheduledDate,
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create special request", error: err.message });
  }
});

// GET /api/special-request → get all requests (admin view)
router.get("/", async (req, res) => {
  try {
    const requests = await SpecialRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// GET /api/special-request/:userId → get requests for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const requests = await SpecialRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user requests", error: err.message });
  }
});

// PATCH /api/special-request/:id → update request status or details
router.patch("/:id", async (req, res) => {
  try {
    const updatedRequest = await SpecialRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    res.json(updatedRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update request", error: err.message });
  }
});

// DELETE /api/special-request/:id → delete a request
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SpecialRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete request", error: err.message });
  }
});

router.patch("/:id/done", async (req, res) => {
  try {
    const updatedReq = await SpecialRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    res.json(updatedReq);
  } catch (err) {
    res.status(500).json({ message: "Failed to update special request", error: err.message });
  }
});


module.exports = router;
