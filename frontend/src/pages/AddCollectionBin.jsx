import React, { useState } from "react";
import axios from "axios";
import "../styles/addCollectionBin.css";

function AddCollectionBin({ addBin }) {
  const [formData, setFormData] = useState({
    id: "",
    location: "",
    size: "",
    fillLevel: 0,
    type: "General Waste",
    status: "Idle",
    pickupTruckId: "",
    lastCollected: new Date().toISOString().slice(0, 10), // today
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const geocodeAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const best = data[0];
    return { lat: Number(best.lat), lng: Number(best.lon) };
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Simple validation
    if (!formData.id || !formData.location) {
      setError("Bin ID and Location are required.");
      return;
    }

    if (formData.fillLevel < 0 || formData.fillLevel > 100) {
      setError("Fill Level must be between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      const geo = formData.location ? await geocodeAddress(formData.location) : null;

      const payload = {
        id: formData.id,
        location: formData.location,
        size: formData.size ? Number(formData.size) : undefined,
        fillLevel: Number(formData.fillLevel),
        type: formData.type,
        status: formData.status,
        pickupTruckId: formData.pickupTruckId || undefined,
        lastCollected: formData.lastCollected,
        coordinates: geo ? { latitude: geo.lat, longitude: geo.lng } : undefined,
      };

      const res = await axios.post("http://localhost:5000/api/admin/bins", payload);
      addBin(res.data); // Update parent state
      setSuccess("Bin added successfully!");
      setFormData({
        id: "",
        location: "",
        size: "",
        fillLevel: 0,
        type: "General Waste",
        status: "Idle",
        pickupTruckId: "",
        lastCollected: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add bin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Add Collection Bin</h2>
      <form onSubmit={handleSubmit}>
        <label>Bin ID</label>
        <input
          type="text"
          name="id"
          className="input-field"
          value={formData.id}
          onChange={handleChange}
          placeholder="Enter Bin ID"
        />

        <label>Location (address)</label>
        <input
          type="text"
          name="location"
          className="input-field"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location/address"
        />

        <label>Size (liters)</label>
        <input
          type="number"
          name="size"
          className="input-field"
          value={formData.size}
          onChange={handleChange}
          placeholder="Enter size in liters"
          min="0"
          max="1000"
        />

        <label>Fill Level (%)</label>
        <input
          type="number"
          name="fillLevel"
          className="input-field"
          value={formData.fillLevel}
          onChange={handleChange}
          min="0"
          max="100"
        />

        <label>Type</label>
        <select
          name="type"
          className="select-field"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="General Waste">General Waste</option>
          <option value="Special Waste">Special Waste</option>
        </select>

        <label>Last Collected Date</label>
        <input
          type="date"
          name="lastCollected"
          className="input-field"
          value={formData.lastCollected}
          onChange={handleChange}
        />

        {/* latitude/longitude fields removed; coordinates are auto-geocoded from address */}

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Adding..." : "Add Bin"}
        </button>
      </form>
    </div>
  );
}

export default AddCollectionBin;
