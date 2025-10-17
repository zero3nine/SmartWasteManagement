import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/addSpecialRequest.css";

function AddSpecialRequest() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedSize, setEstimatedSize] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Calculate minimum date for pickup (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0]; // YYYY-MM-DD format

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/special-request", {
        userId,
        name,
        type,
        description,
        estimatedSize,
        address,
        contact,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      });
      setLoading(false);
      setSuccess("Request submitted successfully!");
      // Optional: navigate to dashboard after delay
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to submit request.");
      setLoading(false);
    }
  };

  return (
    <div className="add-request-container">
      <div className="add-request-box">
        <h2 className="add-request-title">Request Special Pickup</h2>
        <p className="input-note">Fill out the form below to schedule a special pickup.</p>

        <form onSubmit={handleSubmit}>
          {/* Pickup Type */}
          <label htmlFor="garbageType">Pickup Type</label>
          <select
            className="select-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Pickup Type</option>
            <option value="General Waste">General Waste</option>
            <option value="Special Waste">Special Waste</option>
          </select>

          {/* Description */}
          <label htmlFor="description">Description</label>
          <textarea
            className="textarea-field"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details (optional)"
          />

          {/* Estimated Size */}
          <label htmlFor="estimatedSize">Estimated Size</label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={estimatedSize}
            onChange={(e) => setEstimatedSize(e.target.value)}
            placeholder="Estimated Size (in kg/L)"
            required
          />

          {/* Address */}
          <label htmlFor="address">Pickup Address</label>
          <input
            className="input-field"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Pickup Address"
            required
          />

          {/* Name */}
          <label htmlFor="name">Name</label>
          <input
            className="input-field"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />

          {/* Contact */}
          <label htmlFor="contact">Contact Number</label>
          <input
            className="input-field"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact Number"
            required
          />

          {/* Scheduled Date */}
          <label htmlFor="scheduledDate">Pickup Date</label>
          <input
            id="scheduledDate"
            className="input-field"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={minDateString}
            required
          />

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddSpecialRequest;
