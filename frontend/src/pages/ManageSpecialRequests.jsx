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
  const [confirmPopup, setConfirmPopup] = useState(null); // for edit confirmation

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

  // Approve or Reject request
  const updateRequestStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/special-request/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
      setConfirmPopup(null);
    } catch (err) {
      console.error("Failed to update request status:", err);
    }
  };

  // Toggle status (Approved <-> Rejected)
  const toggleStatus = (request) => {
    const newStatus = request.status === "Approved" ? "Rejected" : "Approved";
    updateRequestStatus(request._id, newStatus);
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
                          updateRequestStatus(r._id, "Approved");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(r._id, "Rejected");
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
                      Edit
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
            <p>
              <strong>Name:</strong> {selectedRequest.name || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {selectedRequest.contact || "N/A"}
            </p>
            <p>
              <strong>Type:</strong> {selectedRequest.type}
            </p>
            <p>
              <strong>Description:</strong> {selectedRequest.description}
            </p>
            <p>
              <strong>Estimated Size:</strong> {selectedRequest.estimatedSize || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {selectedRequest.address || "N/A"}
            </p>
            <p>
              <strong>Scheduled Date:</strong>{" "}
              {new Date(selectedRequest.scheduledDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {selectedRequest.status}
            </p>

            <div className="popup-actions">
              {selectedRequest.status === "Pending" ? (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => updateRequestStatus(selectedRequest._id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => updateRequestStatus(selectedRequest._id, "Rejected")}
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

      {/* Confirmation Popup */}
      {confirmPopup && (
        <div className="popup-overlay" onClick={() => setConfirmPopup(null)}>
          <div className="popup-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Change Request Status?</h3>
            <p>
              This request is currently <strong>{confirmPopup.status}</strong>.
              <br />
              Do you want to change it to{" "}
              <strong>
                {confirmPopup.status === "Approved" ? "Rejected" : "Approved"}
              </strong>
              ?
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
