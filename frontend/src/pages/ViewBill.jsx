import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/payment.css"; // create a simple CSS file for styling

function ViewBill() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [specialRequests, setSpecialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    baseFee: 1000,
    specialCost: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchMonthlyRequests = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/special-request/${userId}`);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Only approved requests in current month
        const monthlyApproved = res.data.filter((r) => {
          const date = new Date(r.scheduledDate);
          return (
            r.status === "Completed" &&
            date >= firstDay &&
            date <= lastDay &&
            r.cost // make sure cost exists
          );
        });

        setSpecialRequests(monthlyApproved);

        const specialCost = monthlyApproved.reduce((sum, r) => sum + (r.cost || 0), 0);
        const baseFee = 1000;
        const tax = 0.15 * (baseFee + specialCost);
        const total = baseFee + specialCost + tax;

        setTotals({ baseFee, specialCost, tax, total });
      } catch (err) {
        console.error("Error fetching special requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRequests();
  }, [userId]);

  const confirmPayment = () => {
    // Redirect to payment page, you can pass totals as state if needed
    navigate("/payment", { state: { totals, specialRequests } });
  };

  if (loading) return <p className="loading">Loading your bill...</p>;

  return (
    <div className="pay-bill-container">
      <h1>Your Monthly Bill</h1>

      <div className="bill-details">
        <p>
          <strong>Base Fee:</strong> Rs. {totals.baseFee}
        </p>
        <p>
          <strong>Special Requests Cost:</strong> Rs. {totals.specialCost}
        </p>
        <p>
          <strong>Tax (15%):</strong> Rs. {totals.tax.toFixed(2)}
        </p>
        <hr />
        <p className="total">
          <strong>Total Amount:</strong> Rs. {totals.total.toFixed(2)}
        </p>
      </div>

      {specialRequests.length > 0 && (
        <div className="special-requests-summary">
          <h3>Special Requests Included:</h3>
          <ul>
            {specialRequests.map((r) => (
              <li key={r._id}>
                {r.type} — Rs. {r.cost} — Scheduled on {new Date(r.scheduledDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="confirm-pay-btn" onClick={confirmPayment}>
        Confirm & Pay
      </button>
    </div>
  );
}

export default ViewBill;
