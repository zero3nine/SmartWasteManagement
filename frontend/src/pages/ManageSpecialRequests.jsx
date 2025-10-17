import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/manageSpecialRequests.css";

function ManageSpecialRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [costPopup, setCostPopup] = useState(null); // For entering cost
  const [costValue, setCostValue] = useState("");   // Cost input value
  const [confirmPopup, setConfirmPopup] = useState(null); // For editing status

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/special-request");
      const sorted = res.data.sort(
        (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      setRequests(sorted);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Approve with cost
  const approveWithCost = async () => {
    if (!costValue || isNaN(costValue)) {
      alert("Please enter a valid cost.");
      return;
    }

    try {
      const res = await axios.patch(`http://localhost:5000/api/special-request/${costPopup.requestId}`, {
        status: "Approved",
        cost: parseFloat(costValue),
      });

      const updatedRequest = res.data;

      await axios.post("http://localhost:5000/api/payments", {
      userId: updatedRequest.userId,
      specialRequestId: updatedRequest._id,
      amount: parseFloat(costValue),
      currency: "LKR",
    });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === costPopup.requestId
            ? { ...r, status: "Approved", cost: parseFloat(costValue) }
            : r
        )
      );

      setCostPopup(null);
      setCostValue("");

     alert("Special request approved. Payment created for the user.");
    } catch (err) {
      console.error("Failed to approve request with cost:", err);
      alert("Failed to approve request. Try again.");
    }
  };

  // Reject request
  const rejectRequest = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/special-request/${id}`, { status: "Rejected" });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "Rejected" } : r))
      );
    } catch (err) {
      console.error("Failed to reject request:", err);
      alert("Failed to reject request. Try again.");
    }
  };

  // Toggle status for edit popup
  const toggleStatus = (request) => {
    const newStatus = request.status === "Approved" ? "Rejected" : "Approved";
    if (newStatus === "Approved") {
      setCostPopup({ requestId: request._id, currentCost: request.cost || "" });
    } else {
      rejectRequest(request._id);
      setConfirmPopup(null);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact?.toLowerCase().includes(searchTerm.toLowerCase());
    const date = new Date(r.scheduledDate);
    const from = filterFrom ? new Date(filterFrom) : null;
    const to = filterTo ? new Date(filterTo) : null;
    const inDateRange = (!from || date >= from) && (!to || date <= to);
    return matchesSearch && inDateRange;
  });

  return (
    <div className="manage-requests-container">
      <h1>Manage Special Requests</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, type, or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label>
          From:{" "}
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Size</th>
              <th>Description</th>
              <th>Address</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r) => (
              <tr key={r._id} onClick={() => setSelectedRequest(r)}>
                <td>{r.name || "N/A"}</td>
                <td>{r.contact || "N/A"}</td>
                <td>{r.type}</td>
                <td>{r.estimatedSize || "N/A"}</td>
                <td>{r.description}</td>
                <td>{r.address}</td>
                <td>{new Date(r.scheduledDate).toLocaleDateString()}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === "Pending" ? (
                    <>
                      <button
                        className="approve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCostPopup({ requestId: r._id, currentCost: r.cost || "" });
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectRequest(r._id);
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmPopup(r);
                      }}
                    >
                      Edit Status
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Popup for individual request */}
      {selectedRequest && (
        <div className="popup-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Details</h2>
            <p><strong>Name:</strong> {selectedRequest.name || "N/A"}</p>
            <p><strong>Contact:</strong> {selectedRequest.contact || "N/A"}</p>
            <p><strong>Type:</strong> {selectedRequest.type}</p>
            <p><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Estimated Size:</strong> {selectedRequest.estimatedSize || "N/A"}</p>
            <p><strong>Address:</strong> {selectedRequest.address || "N/A"}</p>
            <p><strong>Scheduled Date:</strong> {new Date(selectedRequest.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>

            <div className="popup-actions">
              {selectedRequest.status === "Pending" ? (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => setCostPopup({ requestId: selectedRequest._id, currentCost: selectedRequest.cost || "" })}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => rejectRequest(selectedRequest._id)}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => setConfirmPopup(selectedRequest)}
                >
                  Edit Status
                </button>
              )}
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for entering cost */}
      {costPopup && (
        <div className="popup-overlay" onClick={() => setCostPopup(null)}>
          <div className="popup-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Approve Special Request</h3>
            <p>Enter the cost for this special request:</p>
            <input
              type="number"
              value={costValue}
              onChange={(e) => setCostValue(e.target.value)}
              placeholder="Enter cost"
            />
            <div className="popup-actions">
              <button className="approve-btn" onClick={approveWithCost}>Approve</button>
              <button className="close-btn" onClick={() => setCostPopup(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup for editing status */}
      {confirmPopup && (
        <div className="popup-overlay" onClick={() => setConfirmPopup(null)}>
          <div className="popup-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Change Request Status?</h3>
            <p>
              This request is currently <strong>{confirmPopup.status}</strong>.<br />
              Do you want to change it to{" "}
              <strong>{confirmPopup.status === "Approved" ? "Rejected" : "Approved"}</strong>?
            </p>
            <div className="popup-actions">
              <button
                className="approve-btn"
                onClick={() => toggleStatus(confirmPopup)}
              >
                Yes, Change
              </button>
              <button
                className="close-btn"
                onClick={() => setConfirmPopup(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSpecialRequests;