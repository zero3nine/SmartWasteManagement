import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboardHome.css";

function CollectorDashboard() {
  const navigate = useNavigate();
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const collectorId = localStorage.getItem("userId"); // assuming collector login

  useEffect(() => {
    const fetchCollectorData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/special-requests/collector/${collectorId}`);
        setAssignedRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectorData();
  }, [collectorId]);

  if (loading) return <p className="loading">Loading your dashboard...</p>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Collector Dashboard</h1>
        <p>View and manage assigned pickups</p>
      </header>

      <section className="section-card">
        <h2>Assigned Special Pickup Requests</h2>
        {assignedRequests.length > 0 ? (
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Scheduled Date</th>
              </tr>
            </thead>
            <tbody>
              {assignedRequests.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId}</td>
                  <td>{r.type}</td>
                  <td className={`status ${r.status.toLowerCase()}`}>{r.status}</td>
                  <td>{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No requests assigned yet.</p>
        )}
      </section>

      <div className="quick-actions">
        <button className="action-btn" onClick={() => navigate("/collector/update-status")}>
          ✅ Update Request Status
        </button>
      </div>
    </div>
  );
}

export default CollectorDashboard;
