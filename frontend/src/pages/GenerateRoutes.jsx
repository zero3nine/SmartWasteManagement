<<<<<<< HEAD
import React, { useState, useMemo, useEffect } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> origin/main
import axios from "axios";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function GenerateRoutes({ bins, trucks, refreshBins, refreshTrucks }) {
  const [routes, setRoutes] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
<<<<<<< HEAD
  const [drivingPolylines, setDrivingPolylines] = useState({}); // { [truckId]: LatLng[] }

  const cityCenter = useMemo(() => {
    // Fallback map center (Colombo)
    return { lat: 6.9271, lng: 79.8612 };
  }, []);

  const haversineKm = (a, b) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };
=======
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
>>>>>>> origin/main

  const generateRoutes = () => {
    const availableTrucks = trucks.filter((t) => t.status === "Available");

    // Only collect bins that are full and idle
    const binsToCollect = bins.filter(
      (b) => b.fillLevel >= 90 && b.status === "Idle"
    );

<<<<<<< HEAD
    // If coordinates exist for most items, use distance-based nearest neighbor; else fallback to capacity-only
    const coordReady = (item) =>
      item &&
      ((item.location && item.location.latitude != null && item.location.longitude != null) ||
        (item.coordinates && item.coordinates.latitude != null && item.coordinates.longitude != null));

    const getLatLng = (item) => {
      if (!item) return null;
      const lat = item.location?.latitude ?? item.coordinates?.latitude;
      const lng = item.location?.longitude ?? item.coordinates?.longitude;
      return lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null;
    };

    const canUseGeo =
      availableTrucks.some(coordReady) && binsToCollect.some(coordReady);

    const remainingBins = [...binsToCollect];

    const assignedRoutes = availableTrucks.map((truck) => {
=======
    const remainingBins = [...binsToCollect];
    const remainingRequests = [...specialRequests];
    const assignedRoutes = [];

    for (const truck of availableTrucks) {
>>>>>>> origin/main
      let truckLoad = 0;
      const assignedBins = [];
      const assignedRequests = [];

<<<<<<< HEAD
      if (canUseGeo) {
        let currentPos = getLatLng(truck) || cityCenter;
        while (remainingBins.length > 0) {
          // Find nearest bin that fits capacity
          let nearestIdx = -1;
          let nearestDist = Infinity;
          for (let i = 0; i < remainingBins.length; i++) {
            const bin = remainingBins[i];
            const pos = getLatLng(bin);
            if (!pos) continue;
            if (truckLoad + Number(bin.size || 0) > Number(truck.capacity)) continue;
            const d = haversineKm(currentPos, pos);
            if (d < nearestDist) {
              nearestDist = d;
              nearestIdx = i;
            }
          }
          if (nearestIdx === -1) break;
          const chosen = remainingBins.splice(nearestIdx, 1)[0];
          assignedBins.push(chosen);
          truckLoad += Number(chosen.size || 0);
          currentPos = getLatLng(chosen) || currentPos;
=======
      // Assign bins matching truck type
      for (const bin of [...remainingBins]) {
        if (
          bin.type === `${truck.type} Waste` &&
          truckLoad + bin.size <= truck.capacity
        ) {
          assignedBins.push(bin);
          truckLoad += bin.size;
          remainingBins.splice(remainingBins.indexOf(bin), 1);
>>>>>>> origin/main
        }
      } else {
        // Fallback: simple first-fit by capacity
        for (const bin of [...remainingBins]) {
          if (truckLoad + Number(bin.size || 0) <= Number(truck.capacity)) {
            assignedBins.push(bin);
            truckLoad += Number(bin.size || 0);
          }
        }
        // Remove assigned bins from remaining
        assignedBins.forEach((b) => {
          const idx = remainingBins.indexOf(b);
          if (idx >= 0) remainingBins.splice(idx, 1);
        });
      }

<<<<<<< HEAD
      return {
        truckId: truck._id,
        truckPlate: truck.licensePlate,
        truckLocation: getLatLng(truck),
        bins: assignedBins,
      };
    });
=======
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
>>>>>>> origin/main

    setRoutes(assignedRoutes.filter((r) => r.bins.length > 0));
  };

  const confirmRoutes = async () => {
    try {
      for (const route of routes) {
        // Update truck status to "On Duty"
        await axios.patch(`http://localhost:5000/api/collector/trucks/${route.truckId}`, {
<<<<<<< HEAD
          status: "on-duty",
=======
          status: "On Duty",
>>>>>>> origin/main
        });

        // Mark assigned bins as scheduled
        for (const bin of route.bins) {
          await axios.patch(`http://localhost:5000/api/admin/bins/${bin._id}`, {
<<<<<<< HEAD
            status: "scheduled",
=======
            status: "Scheduled",
>>>>>>> origin/main
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

  const mapCenter = useMemo(() => {
    // Prefer a truck with location, else city center
    const t = trucks.find(
      (tr) => tr.location?.latitude != null && tr.location?.longitude != null
    );
    return t
      ? { lat: Number(t.location.latitude), lng: Number(t.location.longitude) }
      : cityCenter;
  }, [trucks, cityCenter]);

  const binToLatLng = (b) => {
    const lat = b.coordinates?.latitude;
    const lng = b.coordinates?.longitude;
    return lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Fetch OSRM driving polylines when routes change
  useEffect(() => {
    const fetchDrivingPolylines = async () => {
      const newPolys = {};
      for (const route of routes) {
        // Build straight points first; fallback truck start to first bin if missing
        const straightPoints = [];
        const firstBinPos = route.bins.length > 0 ? binToLatLng(route.bins[0]) : null;
        const start = route.truckLocation || firstBinPos;
        if (start) straightPoints.push(start);
        route.bins.forEach((b) => {
          const p = binToLatLng(b);
          if (p) straightPoints.push(p);
        });
        if (straightPoints.length < 2) continue;

        let mergedCoords = [];
        try {
          for (let i = 0; i < straightPoints.length - 1; i++) {
            const a = straightPoints[i];
            const b = straightPoints[i + 1];
            const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
            console.log("OSRM request:", url);
            let attempt = 0;
            let ok = false;
            while (attempt < 2 && !ok) {
              attempt++;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                const coords = data?.routes?.[0]?.geometry?.coordinates || [];
                const asLatLng = coords.map(([lng, lat]) => ({ lat, lng }));
                if (mergedCoords.length > 0 && asLatLng.length > 0) {
                  asLatLng.shift();
                }
                mergedCoords = mergedCoords.concat(asLatLng);
                ok = true;
              } else {
                console.error("OSRM error", res.status, res.statusText);
                await sleep(500);
              }
            }
            // Be nice to the demo server
            await sleep(150);
          }
        } catch (e) {
          console.warn("OSRM failed, will fallback to straight polyline", e);
          mergedCoords = straightPoints; // fallback straight line
        }
        if (!mergedCoords || mergedCoords.length < 2) {
          mergedCoords = straightPoints; // ensure at least straight line
        }
        newPolys[route.truckId] = mergedCoords;
      }
      setDrivingPolylines(newPolys);
    };

    if (routes.length > 0) {
      fetchDrivingPolylines();
    } else {
      setDrivingPolylines({});
    }
  }, [routes]);

  return (
    <div className="section-card">
      <h2>Generate Collection Routes</h2>
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
              <ul>
                {route.bins.map((b) => (
                  <li key={b._id || b.id}>
                    {b.location} - {b.type} - Fill: {b.fillLevel}% - Size: {b.size}L
                  </li>
                ))}
              </ul>
=======

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
>>>>>>> origin/main
            </div>
          ))}

          {!confirmed && (
            <button className="action-btn" onClick={confirmRoutes}>
              Confirm Routes
            </button>
          )}
        </div>
      )}

      <div style={{ height: 500, marginTop: 16 }}>
        <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Show all trucks */}
          {trucks.map((t) => {
            const pos = t.location?.latitude != null && t.location?.longitude != null
              ? { lat: Number(t.location.latitude), lng: Number(t.location.longitude) }
              : null;
            if (!pos) return null;
            return (
              <CircleMarker key={t._id} center={pos} radius={8} pathOptions={{ color: "#1f77b4" }}>
                <Tooltip>Truck {t.licensePlate}</Tooltip>
              </CircleMarker>
            );
          })}

          {/* Show all bins */}
          {bins.map((b) => {
            const pos = binToLatLng(b);
            if (!pos) return null;
            return (
              <CircleMarker key={b._id} center={pos} radius={6} pathOptions={{ color: "#2ca02c" }}>
                <Tooltip>
                  {b.location} | Fill {b.fillLevel}%
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Show generated routes: baseline straight line always; OSRM overlays when available */}
          {routes.map((route) => {
            // Straight baseline
            const straight = [];
            const firstBinPos = route.bins.length > 0 ? binToLatLng(route.bins[0]) : null;
            const start = route.truckLocation || firstBinPos;
            if (start) straight.push(start);
            route.bins.forEach((b) => {
              const p = binToLatLng(b);
              if (p) straight.push(p);
            });
            const hasStraight = straight.length >= 2;

            const driving = drivingPolylines[route.truckId];
            const hasDriving = driving && driving.length >= 2;

            return (
              <>
                {hasStraight && (
                  <Polyline
                    key={`straight-${route.truckId}`}
                    positions={straight}
                    pathOptions={{ color: "#e5b93c", opacity: 0.9, weight: 4 }}
                  />
                )}
                {hasDriving && (
                  <Polyline
                    key={`drive-${route.truckId}`}
                    positions={driving}
                    pathOptions={{ color: "#ff4f0e", opacity: 0.95, weight: 5 }}
                  />
                )}
              </>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default GenerateRoutes;
