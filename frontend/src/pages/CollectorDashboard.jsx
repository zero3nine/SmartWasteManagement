import React, { useState, useEffect } from "react";
import AddTruck from "./AddTruck";
import AssignedRoutes from "./AssignedRoutes";
import axios from "axios";
import "../styles/dashboardCollector.css";

function CollectorDashboard() {
  const userId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("addTruck");
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trucks belonging to this collector
  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/collector/trucks/${userId}`);
      setTrucks(res.data);
    } catch (err) {
      console.error("Error fetching trucks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const addTruckHandler = (newTruck) => {
    setTrucks([newTruck, ...trucks]);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Collector Dashboard</h1>
        <p>Manage your trucks and assigned collection routes.</p>
      </header>

      {/* Tabs */}
      <div className="collector-tabs">
        <button
          className={`tab-btn ${activeTab === "addTruck" ? "active" : ""}`}
          onClick={() => setActiveTab("addTruck")}
        >
          Add Truck
        </button>
        <button
          className={`tab-btn ${activeTab === "trucksList" ? "active" : ""}`}
          onClick={() => setActiveTab("trucksList")}
        >
          View Trucks
        </button>
        <button
          className={`tab-btn ${activeTab === "assignedRoutes" ? "active" : ""}`}
          onClick={() => setActiveTab("assignedRoutes")}
        >
          Assigned Routes
        </button>
      </div>

      <div className="tab-content">
        {/* Add Truck Section */}
        {activeTab === "addTruck" && <AddTruck addTruck={addTruckHandler} />}

        {/* Truck List Section */}
        {activeTab === "trucksList" && (
          <div className="section-card">
            <h2>Registered Trucks</h2>
            {loading ? (
              <p>Loading trucks...</p>
            ) : trucks.length > 0 ? (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Truck ID</th>
                    <th>License Plate</th>
                    <th>Location</th>
                    <th>Capacity (kg)</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((t) => (
                    <tr key={t._id}>
                      <td>{t.id}</td>
                      <td>{t.licensePlate}</td>
                      <td>{t.location}</td>
                      <td>{t.capacity}</td>
                      <td>{t.type}</td>
                      <td>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No trucks registered yet.</p>
            )}
          </div>
        )}

        {/* Assigned Routes Section */}
        {activeTab === "assignedRoutes" && (
          <div className="section-card">
            <AssignedRoutes />
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectorDashboard;
