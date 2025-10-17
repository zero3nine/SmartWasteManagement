import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboardHome.css";

function HomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role"); // get user role

  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) {
        setLoading(false); // no user logged in
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/special-request/${userId}`
        );

        // Filter requests in the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const filteredRequests = response.data
          .filter((r) => r.userId === userId && new Date(r.createdAt) >= threeMonthsAgo)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8); // show last 8 requests

        setRecentRequests(filteredRequests);
      } catch (err) {
        console.error("Error fetching special requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const isResident = role === "resident";

  if (loading) return <p className="loading">Loading your dashboard...</p>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Welcome, {username || "Resident"} 👋</h1>
        <p>Your Smart Waste Management Dashboard</p>
      </header>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className={`action-btn ${!isResident ? "disabled-btn" : ""}`}
          onClick={() => isResident && navigate("/special-request")}
          disabled={!isResident}
        >
          ♻️ Request Special Pickup
        </button>
        <button
          className={`action-btn ${!isResident ? "disabled-btn" : ""}`}
          onClick={() => isResident && navigate("/pay-bill")}
          disabled={!isResident}
        >
          💳 Pay Your Bill
        </button>
      </div>

      {/* Recent Requests */}
      <section className="section-card">
        <h2>Recent Special Collection Requests</h2>

        {!userId ? (
          <p>Please log in to view your special requests.</p>
        ) : recentRequests.length > 0 ? (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Scheduled Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((r) => (
                <tr key={r._id}>
                  <td>{r.type}</td>
                  <td className={`status ${r.status.toLowerCase()}`}>
                    {r.status}
                  </td>
                  <td>
                    {r.scheduledDate
                      ? new Date(r.scheduledDate).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No special requests in the last 3 months.</p>
        )}
      </section>
    </div>
  );
}

export default HomePage;
