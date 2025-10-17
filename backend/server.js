require('dotenv').config({ path: './.env', debug: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//Imports
const authRoutes = require("./routes/auth");
const specialRequestRoutes = require("./routes/specialRequestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const collectorRoutes = require("./routes/collectorRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes")

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Simple API route
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello World from Express + MongoDB Atlas!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/special-request", specialRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/collector", collectorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.log("❌ MongoDB connection error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));