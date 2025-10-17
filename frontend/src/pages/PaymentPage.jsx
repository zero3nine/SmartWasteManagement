import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/paymentsPage.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SFuw3RyAs1xkGz2KIVUJz8IUuA66QT7kkwZ5YTIpJ88vBwmcL798hbJ7O90L5IRXtJzRSWEMmpIYtr8LBhxb7zG0064dUb9H6");

//  Payment Form Component 
const PaymentForm = ({ paymentId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      setLoading(true);
      setError("");

      // Create Payment Intent on backend
      const { data } = await axios.post("http://localhost:5000/api/payments/create-payment-intent", { paymentId });
      const clientSecret = data.clientSecret;

      // Confirm Card Payment
      const cardElement = elements.getElement(CardNumberElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
        return;
      }

      // Mark payment as paid in backend
      await axios.post("http://localhost:5000/api/payments/confirm-payment", { paymentId });

      onSuccess(); // close modal and refresh payments
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="payment-form-overlay">
    <div className="payment-form-container">
      <h4>Pay Your Bill</h4>
      <form onSubmit={handleSubmit}>
        <div className="stripe-row">
          <label>Card Number</label>
          <CardNumberElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>

        <div className="stripe-row">
          <label>Expiry Date</label>
          <CardExpiryElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>

        <div className="stripe-row">
          <label>CVC</label>
          <CardCvcElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="payment-buttons">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

// Main Payments Page 
const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePaymentId, setActivePaymentId] = useState(null); // Payment being processed
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/payments/user/${userId}`);
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentForm = (paymentId) => setActivePaymentId(paymentId);
  const closePaymentForm = () => setActivePaymentId(null);

  const handlePaymentSuccess = () => {
    closePaymentForm();
    fetchPayments();
  };

  const unpaid = payments.filter((p) => p.status === "unpaid");
  const paid = payments.filter((p) => p.status === "paid");

  if (loading) return <p className="loading">Loading your payments...</p>;

  return (
    <div className="payments-container">
      <h2>Your Payments</h2>
      {error && <p className="error-message">{error}</p>}

      <section className="payment-section">
        <h4>Unpaid Bills</h4>
        {unpaid.length === 0 ? (
          <p>No unpaid bills at the moment.</p>
        ) : (
          <table className="table payments-table">
            <thead>
              <tr>
                <th>Bin ID</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unpaid.map((p) => (
                <tr key={p._id}>
                  <td>{p.binId?.id || "N/A"}</td>
                  <td>{p.amount}</td>
                  <td><span className="status unpaid">{p.status}</span></td>
                  <td>
                    <button className="btn btn-primary" onClick={() => openPaymentForm(p._id)}>
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="payment-section mt-4">
        <h4>Paid Bills</h4>
        {paid.length === 0 ? (
          <p>No paid bills yet.</p>
        ) : (
          <table className="table payments-table">
            <thead>
              <tr>
                <th>Bin ID</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {paid.map((p) => (
                <tr key={p._id}>
                  <td>{p.binId?.id || "N/A"}</td>
                  <td>{p.amount}</td>
                  <td><span className="status paid">{p.status}</span></td>
                  <td>{new Date(p.paidAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {activePaymentId && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            paymentId={activePaymentId}
            onCancel={closePaymentForm}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentsPage;
