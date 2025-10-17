// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // your User model

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username email"); // only return username & email
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
