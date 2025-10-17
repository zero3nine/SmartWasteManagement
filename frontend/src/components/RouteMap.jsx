import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const defaultCenter = [6.9271, 79.8612]; // Colombo as a reasonable default

function RouteMap({ truckCoords, binCoords, requestCoords, routeLine }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({ markers: [], polylines: [] });

  useEffect(() => {
    if (!mapInstanceRef.current) {
      const center = truckCoords ? [truckCoords.lat, truckCoords.lng] : defaultCenter;
      mapInstanceRef.current = L.map(mapRef.current).setView(center, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    // Clear old layers
    layersRef.current.markers.forEach((m) => m.remove());
    layersRef.current.polylines.forEach((p) => p.remove());
    layersRef.current = { markers: [], polylines: [] };

    // Add markers
    if (truckCoords) {
      const m = L.marker([truckCoords.lat, truckCoords.lng]).addTo(mapInstanceRef.current);
      m.bindPopup('Truck');
      layersRef.current.markers.push(m);
    }
    (binCoords || []).forEach((b, idx) => {
      const m = L.marker([b.lat, b.lng]).addTo(mapInstanceRef.current);
      m.bindPopup(`Bin ${idx + 1}`);
      layersRef.current.markers.push(m);
    });
    (requestCoords || []).forEach((r, idx) => {
      const m = L.marker([r.lat, r.lng]).addTo(mapInstanceRef.current);
      m.bindPopup(`Special Request ${idx + 1}`);
      layersRef.current.markers.push(m);
    });

    const points = [];
    if (truckCoords) points.push([truckCoords.lat, truckCoords.lng]);
    for (const b of binCoords || []) points.push([b.lat, b.lng]);

    // Add polylines
    if (Array.isArray(routeLine) && routeLine.length > 1) {
      const pl = L.polyline(routeLine, { color: '#0077ff', weight: 4 }).addTo(mapInstanceRef.current);
      layersRef.current.polylines.push(pl);
      mapInstanceRef.current.fitBounds(pl.getBounds(), { padding: [16, 16] });
    } else if (points.length > 1) {
      const pl = L.polyline(points, { color: '#999999', dashArray: '6' }).addTo(mapInstanceRef.current);
      layersRef.current.polylines.push(pl);
      mapInstanceRef.current.fitBounds(pl.getBounds(), { padding: [16, 16] });
    }
  }, [truckCoords, binCoords, requestCoords, routeLine]);

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '16px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default RouteMap;


