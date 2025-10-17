import React, { useState, useEffect } from "react";
import axios from "axios";
import AddCollectionBin from "./AddCollectionBin";
import "../styles/dashboardAdmin.css";

function AdminDashboard() {
  const [bins, setBins] = useState([]);
  const [activeTab, setActiveTab] = useState("addBin");
  const [loadingBins, setLoadingBins] = useState(true);

  // Fetch bins from backend
  const fetchBins = async () => {
    setLoadingBins(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/bins");
      setBins(res.data);
    } catch (err) {
      console.error("Error fetching bins:", err);
    } finally {
      setLoadingBins(false);
    }
  };

  // Fetch bins on mount
  useEffect(() => {
    fetchBins();
  }, []);

  // Add a new bin and refresh the list
  const addBin = async (newBin) => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/bins", newBin);
      setBins([res.data, ...bins]); // immediately update table
    } catch (err) {
      console.error("Failed to add bin:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage collection bins, generate routes, and monitor trucks.</p>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "addBin" ? "active" : ""}`}
          onClick={() => setActiveTab("addBin")}
        >
          Add Collection Bins
        </button>
        <button
          className={`tab-btn ${activeTab === "binsList" ? "active" : ""}`}
          onClick={() => setActiveTab("binsList")}
        >
          View Bins
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "addBin" && <AddCollectionBin addBin={addBin} />}
        {activeTab === "binsList" && (
          <div className="section-card">
            <h2>Current Bins</h2>
            {loadingBins ? (
              <p>Loading bins...</p>
            ) : bins.length > 0 ? (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Bin ID</th>
                    <th>Location</th>
                    <th>Fill Level</th>
                    <th>Type</th>
                    <th>Last Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {bins.map((b) => (
                    <tr key={b._id}>
                      <td>{b.id}</td>
                      <td>{b.location}</td>
                      <td>{b.fillLevel}%</td>
                      <td>{b.type}</td>
                      <td>{new Date(b.lastCollected).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No bins added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
