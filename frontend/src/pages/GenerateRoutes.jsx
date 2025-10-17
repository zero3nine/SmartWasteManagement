import React, { useState } from "react";
import axios from "axios";

function GenerateRoutes({ bins, trucks, refreshBins, refreshTrucks }) {
  const [routes, setRoutes] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const generateRoutes = () => {
    const availableTrucks = trucks.filter(
      (t) => t.type === "general" && t.status === "available"
    );

    const binsToCollect = bins.filter(
      (b) => b.fillLevel >= 90 && b.status === "idle"
    );

    // Assign bins to trucks respecting capacity
    const assignedRoutes = availableTrucks.map((truck) => {
      let truckLoad = 0;
      const assignedBins = [];

      for (const bin of binsToCollect) {
        if (!assignedBins.includes(bin) && truckLoad + bin.size <= truck.capacity) {
          assignedBins.push(bin);
          truckLoad += bin.size;
        }
      }

      // Remove assigned bins from binsToCollect for next truck
      assignedBins.forEach((b) => binsToCollect.splice(binsToCollect.indexOf(b), 1));

      return {
        truckId: truck._id,
        truckPlate: truck.licensePlate,
        bins: assignedBins
      };
    });

    setRoutes(assignedRoutes);
  };

  const confirmRoutes = async () => {
    try {
      // Update truck status to on-duty
      for (const route of routes) {
        await axios.patch(`http://localhost:5000/api/collector/trucks/${route.truckId}`, {
          status: "on-duty"
        });
      }

      // Update bins status to scheduled
      for (const route of routes) {
        for (const bin of route.bins) {
          await axios.patch(`http://localhost:5000/api/admin/bins/${bin._id}`, {
            status: "scheduled",
            pickupTruckId: route.truckId
          });
        }
      }

      for (const route of routes) {
        await axios.post("http://localhost:5000/api/admin/routes", {
          truckId: route.truckId,
          bins: route.bins.map((b) => b._id),
        });
      }

      setConfirmed(true);
      refreshBins();
      refreshTrucks();
      alert("Routes confirmed and statuses updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm routes.");
    }
  };

  return (
    <div className="section-card">
      <h2>Generate Collection Routes</h2>
      {!confirmed && <button className="action-btn" onClick={generateRoutes}>Generate Routes</button>}

      {routes.length > 0 && (
        <div className="routes-list">
          {routes.map((route) => (
            <div key={route.truckId} className="route-card">
              <h3>Truck: {route.truckPlate}</h3>
              <ul>
                {route.bins.map((b) => (
                  <li key={b.id}>
                    {b.location} - {b.type} - Fill: {b.fillLevel}% - Size: {b.size}L
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!confirmed && (
            <button className="action-btn" onClick={confirmRoutes}>
              Confirm Routes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default GenerateRoutes;
