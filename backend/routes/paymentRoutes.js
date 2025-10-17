const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE PAYMENT INTENT 
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: "paymentId is required" });

    const payment = await Payment.findById(paymentId).populate("binId");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status === "paid") return res.status(400).json({ message: "Payment already paid" });
    if (!payment.amount || payment.amount <= 0) return res.status(400).json({ message: "Invalid payment amount" });

    // Create Payment Intent
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // in rupees
      currency: "inr",
      metadata: { paymentId: payment._id.toString() },
    });

    // Save PaymentIntent ID in the payment document
    payment.stripePaymentIntentId = intent.id;
    await payment.save();

    res.json({ clientSecret: intent.client_secret, paymentId: payment._id });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    res.status(500).json({ message: "Server error creating payment intent", error: err.message });
  }
});

//CONFIRM PAYMENT
router.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: "paymentId is required" });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status === "paid") return res.status(400).json({ message: "Payment already paid" });

    // Here we mark it as paid (optimistic)
    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    res.json({ message: "Payment marked as paid", payment });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
});

// GET USER PAYMENTS
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const payments = await Payment.find({ userId }).populate("binId").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: "Server error fetching payments", error: err.message });
  }
});

module.exports = router;
