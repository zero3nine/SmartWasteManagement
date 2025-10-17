import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/addSpecialRequest.css";

function AddSpecialRequest() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/special-request", {
        userId,
        type,
        description,
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
          <select
            className="select-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Pickup Type</option>
            <option value="Large Item">Large Item</option>
            <option value="Electronics">Electronics</option>
            <option value="Hazardous Waste">Hazardous Waste</option>
            <option value="Other">Other</option>
          </select>

          <textarea
            className="textarea-field"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details (optional)"
          />

          <input
            className="input-field"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
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
