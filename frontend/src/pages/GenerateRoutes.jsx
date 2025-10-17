import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function GenerateRoutes({ bins, trucks, refreshBins, refreshTrucks }) {
  const [routes, setRoutes] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
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

  const generateRoutes = () => {
    const availableTrucks = trucks.filter(
      (t) => t.type === "general" && t.status === "available"
    );

    const binsToCollect = bins.filter(
      (b) => b.fillLevel >= 90 && b.status === "idle"
    );

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
      let truckLoad = 0;
      const assignedBins = [];

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

      return {
        truckId: truck._id,
        truckPlate: truck.licensePlate,
        truckLocation: getLatLng(truck),
        bins: assignedBins,
      };
    });

    setRoutes(assignedRoutes.filter((r) => r.bins.length > 0));
  };

  const confirmRoutes = async () => {
    try {
      // Update truck status to on-duty
      for (const route of routes) {
        await axios.patch(`http://localhost:5000/api/collector/trucks/${route.truckId}`, {
          status: "on-duty",
        });
      }

      // Update bins status to scheduled
      for (const route of routes) {
        for (const bin of route.bins) {
          await axios.patch(`http://localhost:5000/api/admin/bins/${bin._id}`, {
            status: "scheduled",
            pickupTruckId: route.truckId,
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
              <ul>
                {route.bins.map((b) => (
                  <li key={b._id || b.id}>
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
