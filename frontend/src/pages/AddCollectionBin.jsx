import React, { useState, useEffect } from "react";
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
    lastCollected: new Date().toISOString().slice(0, 10),
    userId: "", // attach user
  });

  const [users, setUsers] = useState([]); // list of users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users"); // your backend endpoint to get all users
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

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

    if (!formData.id || !formData.location || !formData.userId) {
      setError("Bin ID, Location, and User are required.");
      return;
    }

    if (formData.fillLevel < 0 || formData.fillLevel > 100) {
      setError("Fill Level must be between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/bins", formData);
      addBin(res.data);
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
        userId: "",
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

        <label>Location</label>
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

        <label>Assign to User</label>
        <select
          name="userId"
          className="select-field"
          value={formData.userId}
          onChange={handleChange}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>

        <label>Last Collected Date</label>
        <input
          type="date"
          name="lastCollected"
          className="input-field"
          value={formData.lastCollected}
          onChange={handleChange}
        />

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
