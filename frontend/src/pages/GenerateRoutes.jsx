import React, { useState, useEffect } from "react";
import axios from "axios";

function GenerateRoutes({ bins, trucks, refreshBins, refreshTrucks }) {
  const [routes, setRoutes] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [specialRequests, setSpecialRequests] = useState([]);

  useEffect(() => {
    const fetchSpecialRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/special-request");
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        // Only include approved special requests scheduled for today
        const approvedToday = res.data.filter((req) => {
          if (req.status !== "Approved" || !req.scheduledDate) return false;

          const reqDate = new Date(req.scheduledDate);
          return reqDate >= startOfToday && reqDate <= endOfToday;
        });

        setSpecialRequests(approvedToday);
      } catch (err) {
        console.error("Error fetching special requests:", err);
      }
    };

    fetchSpecialRequests();
  }, []);

  const generateRoutes = () => {
    const availableTrucks = trucks.filter((t) => t.status === "Available");

    // Only collect bins that are full and idle
    const binsToCollect = bins.filter(
      (b) => b.fillLevel >= 90 && b.status === "Idle"
    );

    const remainingBins = [...binsToCollect];
    const remainingRequests = [...specialRequests];
    const assignedRoutes = [];

    for (const truck of availableTrucks) {
      let truckLoad = 0;
      const assignedBins = [];
      const assignedRequests = [];

      // Assign bins matching truck type
      for (const bin of [...remainingBins]) {
        if (
          bin.type === `${truck.type} Waste` &&
          truckLoad + bin.size <= truck.capacity
        ) {
          assignedBins.push(bin);
          truckLoad += bin.size;
          remainingBins.splice(remainingBins.indexOf(bin), 1);
        }
      }

      // Assign special requests matching truck type
      for (const req of [...remainingRequests]) {
        if (
          req.type === `${truck.type} Waste` &&
          truckLoad + req.estimatedSize <= truck.capacity
        ) {
          assignedRequests.push(req);
          truckLoad += req.estimatedSize;
          remainingRequests.splice(remainingRequests.indexOf(req), 1);
        }
      }

      if (assignedBins.length > 0 || assignedRequests.length > 0) {
        assignedRoutes.push({
          truckId: truck._id,
          truckPlate: truck.licensePlate,
          bins: assignedBins,
          specialRequests: assignedRequests,
        });
      }
    }

    setRoutes(assignedRoutes);
  };

  const confirmRoutes = async () => {
    try {
      for (const route of routes) {
        // Update truck status to "On Duty"
        await axios.patch(`http://localhost:5000/api/collector/trucks/${route.truckId}`, {
          status: "On Duty",
        });

        // Mark assigned bins as scheduled
        for (const bin of route.bins) {
          await axios.patch(`http://localhost:5000/api/admin/bins/${bin._id}`, {
            status: "Scheduled",
            pickupTruckId: route.truckId,
          });
        }

        // Mark assigned special requests as scheduled
        for (const req of route.specialRequests) {
          await axios.patch(`http://localhost:5000/api/special-request/${req._id}`, {
            status: "Scheduled",
            assignedTruckId: route.truckId, // safer field name than pickupTruckId
          });
        }

        // Save generated route record
        await axios.post("http://localhost:5000/api/admin/routes", {
          truckId: route.truckId,
          bins: route.bins.map((b) => b._id),
          specialRequests: route.specialRequests.map((r) => r._id),
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

      {!confirmed && (
        <button className="action-btn" onClick={generateRoutes}>
          Generate Routes
        </button>
      )}

      {routes.length > 0 && (
        <div className="routes-list">
          {routes.map((route) => (
            <div key={route.truckId} className="route-card">
              <h3>Truck: {route.truckPlate}</h3>

              <h4>Assigned Bins</h4>
              {route.bins.length > 0 ? (
                <ul>
                  {route.bins.map((b) => (
                    <li key={b._id}>
                      🗑 {b.location} — {b.type} — Fill: {b.fillLevel}% — Size: {b.size}L
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No bins assigned.</p>
              )}

              <h4>Special Requests</h4>
              {route.specialRequests.length > 0 ? (
                <ul>
                  {route.specialRequests.map((r) => (
                    <li key={r._id}>
                      📦 {r.address} — {r.type} — Size: {r.estimatedSize}L
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No special requests assigned.</p>
              )}
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
