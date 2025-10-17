import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/assignedRoutes.css";

function AssignedRoutes() {
  const collectorId = localStorage.getItem("userId");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch routes for the collector’s trucks
  const fetchAssignedRoutes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/collector/routes/${collectorId}`);
      setRoutes(res.data);
    } catch (err) {
      console.error("Error fetching assigned routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedRoutes();
  }, []);

  // Mark a bin as done
  const markBinDone = async (routeId, binId) => {
    try {
      await axios.patch(`http://localhost:5000/api/collector/bins/${binId}/done`);
      setRoutes((prev) =>
        prev.map((route) =>
          route._id === routeId
            ? {
                ...route,
                bins: route.bins.map((b) =>
                  b._id === binId ? { ...b, status: "Idle", fillLevel: 0, done: true } : b
                ),
              }
            : route
        )
      );
    } catch (err) {
      console.error("Error marking bin done:", err);
    }
  };

  // Mark a special request as done
  const markRequestDone = async (routeId, reqId) => {
    try {
      await axios.patch(`http://localhost:5000/api/special-request/${reqId}/done`);
      setRoutes((prev) =>
        prev.map((route) =>
          route._id === routeId
            ? {
                ...route,
                specialRequests: route.specialRequests.map((r) =>
                  r._id === reqId ? { ...r, status: "Completed", done: true } : r
                ),
              }
            : route
        )
      );
    } catch (err) {
      console.error("Error marking special request done:", err);
    }
  };

  // Finish the entire route
  const finishRoute = async (routeId) => {
    try {
      await axios.patch(`http://localhost:5000/api/collector/routes/finish/${routeId}`);
      setRoutes((prev) => prev.filter((r) => r._id !== routeId)); // Remove finished route
    } catch (err) {
      console.error("Error finishing route:", err);
    }
  };

  return (
    <div className="assigned-routes-container">
      <h1>Assigned Routes</h1>
      {loading ? (
        <p>Loading assigned routes...</p>
      ) : routes.length === 0 ? (
        <p>No routes assigned to your trucks yet.</p>
      ) : (
        routes.map((route) => {
          const allBinsDone = route.bins.every((b) => b.done || b.status === "idle");
          const allRequestsDone =
            !route.specialRequests ||
            route.specialRequests.every((r) => r.done || r.status === "Completed");
          const canFinish = allBinsDone && allRequestsDone;

          return (
            <div key={route._id} className="route-card">
              <h3>Truck: {route.truckId?.licensePlate || "N/A"}</h3>

              <p>Assigned Bins:</p>
              <ul className="bin-list">
                {route.bins.map((bin) => (
                  <li key={bin._id} className="bin-item">
                    <span>
                      🗑️ <strong>{bin.location || bin._id}</strong> – {bin._id} {bin.status} ({bin.fillLevel}%)
                    </span>
                    {bin.done || bin.status === "idle" ? (
                      <span className="done-check">✅</span>
                    ) : (
                      <button
                        className="done-btn"
                        onClick={() => markBinDone(route._id, bin._id)}
                      >
                        Done
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {route.specialRequests && route.specialRequests.length > 0 && (
                <>
                  <p>Special Requests:</p>
                  <ul className="special-request-list">
                    {route.specialRequests.map((req) => (
                      <li key={req._id} className="special-request-item">
                        <span>
                          📦 <strong>{req.address || req._id}</strong> – {req.type} ({req.estimatedSize}L) – {req.status}
                        </span>
                        {req.done || req.status === "Completed" ? (
                          <span className="done-check">✅</span>
                        ) : (
                          <button
                            className="done-btn"
                            onClick={() => markRequestDone(route._id, req._id)}
                          >
                            Done
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                className={`finish-route-btn ${!canFinish ? "disabled" : ""}`}
                onClick={() => canFinish && finishRoute(route._id)}
                disabled={!canFinish}
              >
                {canFinish ? "Finish Route" : "Finish Route (Pending)"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AssignedRoutes;
