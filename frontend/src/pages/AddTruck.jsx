import React, { useState } from "react";
import axios from "axios";
import "../styles/addTruck.css";

function AddTruck({ addTruck }) {
  const [formData, setFormData] = useState({
    id: "",
    licensePlate: "",
    location: "",
    capacity: "",
    type: "General",
    status: "Available",
    userId: localStorage.getItem("userId"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await axios.post("http://localhost:5000/api/collector/trucks", formData);
      addTruck(res.data);
      setSuccess("Truck added successfully!");
      setFormData({
        id: "",
        licensePlate: "",
        location: "",
        capacity: "",
        type: "General",
        status: "Available",
        userId: localStorage.getItem("userId"),
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

        <label>Location</label>
        <input
          type="text"
          name="location"
          className="input-field"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter Location"
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
