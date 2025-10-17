import React, { useState } from "react";
import axios from "axios";
import "../styles/addTruck.css";

function AddTruck({ addTruck }) {
  const [formData, setFormData] = useState({
    id: "",
    licensePlate: "",
    capacity: "",
    type: "General",
    status: "Available",
    userId: localStorage.getItem("userId"),
    address: "",
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.id || !formData.licensePlate || !formData.capacity) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      // Geocode address if provided
      const geo = formData.address ? await geocodeAddress(formData.address) : null;
      const payload = {
        id: formData.id,
        licensePlate: formData.licensePlate,
        capacity: Number(formData.capacity),
        type: formData.type,
        status: formData.status,
        userId: formData.userId,
        location: geo ? { latitude: geo.lat, longitude: geo.lng } : undefined,
      };

      const res = await axios.post("http://localhost:5000/api/collector/trucks", payload);
      addTruck(res.data);
      setSuccess("Truck added successfully!");
      setFormData({
        id: "",
        licensePlate: "",
        capacity: "",
<<<<<<< HEAD
        type: "general",
        status: "available",
        userId: localStorage.getItem("userId"),
        address: "",
=======
        type: "General",
        status: "Available",
        userId: localStorage.getItem("userId"),
>>>>>>> origin/main
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add truck.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Add Truck</h2>
      <form onSubmit={handleSubmit}>
        <label>Truck ID</label>
        <input
          type="text"
          name="id"
          className="input-field"
          value={formData.id}
          onChange={handleChange}
          placeholder="Enter Truck ID"
        />

        <label>License Plate</label>
        <input
          type="text"
          name="licensePlate"
          className="input-field"
          value={formData.licensePlate}
          onChange={handleChange}
          placeholder="Enter License Plate"
        />

        <label>Capacity (kg)</label>
        <input
          type="number"
          name="capacity"
          className="input-field"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="Enter Capacity"
        />

        <label>Type</label>
        <select
          name="type"
          className="select-field"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="General">General</option>
          <option value="Special">Special</option>
        </select>

        <label>Status</label>
        <select
          name="status"
          className="select-field"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Available">Available</option>
          <option value="On Duty">On Duty</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <label>Address</label>
        <input
          type="text"
          name="address"
          className="input-field"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter truck address (for map start)"
        />

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Adding..." : "Add Truck"}
        </button>
      </form>
    </div>
  );
}

export default AddTruck;
