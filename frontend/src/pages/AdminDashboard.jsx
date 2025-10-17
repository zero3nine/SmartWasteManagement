import React, { useState, useEffect } from "react";
import axios from "axios";
import AddCollectionBin from "./AddCollectionBin";
import ManageSpecialRequests from "./ManageSpecialRequests";
import GenerateRoutes from "./GenerateRoutes";
import "../styles/dashboardAdmin.css";

function AdminDashboard() {
  const [bins, setBins] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [activeTab, setActiveTab] = useState("specialRequests");
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

  // Fetch trucks from backend
  const fetchTrucks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/collector/trucks");
      setTrucks(res.data);
    } catch (err) {
      console.error("Error fetching trucks:", err);
    }
  };

  // Fetch bins on mount
  useEffect(() => {
    fetchBins();
    fetchTrucks();
  }, []);

  // Add a new bin and refresh the list
  const addBinHandler = (newBin) => {
    setBins([newBin, ...bins]);
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
          className={`tab-btn ${activeTab === "specialRequests" ? "active" : ""}`}
          onClick={() => setActiveTab("specialRequests")}
        >
          Special Requests
        </button>
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
        <button
          className={`tab-btn ${activeTab === "generateRoutes" ? "active" : ""}`}
          onClick={() => setActiveTab("generateRoutes")}
        >
          Generate Routes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "specialRequests" && <ManageSpecialRequests />}
        {activeTab === "addBin" && <AddCollectionBin addBin={addBinHandler} />}
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
                    <th>Size (liters)</th>
                    <th>Fill Level</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {bins.map((b) => (
                    <tr key={b._id}>
                      <td>{b.id}</td>
                      <td>{b.location}</td>
                      <td>{b.size}</td>
                      <td>{b.fillLevel}%</td>
                      <td>{b.type}</td>
                      <td>{b.status}</td>
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
        {activeTab === "generateRoutes" && (
          <GenerateRoutes bins={bins} trucks={trucks} refreshBins={fetchBins} refreshTrucks={fetchTrucks} />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
