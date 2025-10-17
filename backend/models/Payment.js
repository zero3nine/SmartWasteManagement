// backend/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  binId: { type: mongoose.Schema.Types.ObjectId, ref: "Bin" },
  specialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "SpecialRequest" },
  amount: { type: Number, required: true }, // in Rupees
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
  stripeSessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
