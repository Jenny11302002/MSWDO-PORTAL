
import { useEffect, useState } from "react";
import api from "../api/axios";

function ServiceRequests({ canManage = true, canViewDocuments = true }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newStatus, setNewStatus] = useState("pending");
    const [staffRemarks, setStaffRemarks] = useState("");
    const [saving, setSaving] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");
    const [documentLoading, setDocumentLoading] = useState(false);
    const [documentError, setDocumentError] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get("/service-requests");
                setRequests(response.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load service requests."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);
const openRequestDetails = async (request) => {
    setSelectedRequest({ ...request, documents: [] });
    setNewStatus(request.status);
    setStaffRemarks(request.remarks || "");
    setUpdateMessage("");
    setDocumentError("");

    if (!canViewDocuments) return;

    setDocumentLoading(true);
    try {
        const response = await api.get(
            `/service-requests/${request.id}/documents`
        );
        setSelectedRequest((current) => current?.id === request.id
            ? { ...current, documents: response.data.data || [] }
            : current);
    } catch (err) {
        setDocumentError(
            err.response?.data?.message || "Unable to load request documents."
        );
    } finally {
        setDocumentLoading(false);
    }
};

const handleStatusUpdate = async () => {
    if (!selectedRequest) return;

    setSaving(true);
    setUpdateMessage("");

    try {
        const response = await api.patch(
            `/service-requests/${selectedRequest.id}/status`,
            {
                status: newStatus,
                remarks: staffRemarks,
            }
        );

        const updatedRequest = response.data.data;

        setRequests((previousRequests) =>
            previousRequests.map((request) =>
                request.id === selectedRequest.id
                    ? { ...request, ...updatedRequest }
                    : request
            )
        );

        setSelectedRequest((previousRequest) => ({
            ...previousRequest,
            ...updatedRequest,
        }));

        setUpdateMessage("Request status successfully updated.");
    } catch (err) {
        setUpdateMessage(
            err.response?.data?.message ||
            "Unable to update request status."
        );
    } finally {
        setSaving(false);
    }
};

    const filteredRequests = requests.filter((request) => {
        const keyword = search.toLowerCase();

        const matchesSearch =
            request.applicant_name?.toLowerCase().includes(keyword) ||
            request.reference_number?.toLowerCase().includes(keyword) ||
            request.service?.service_name?.toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "all" || request.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="requests-page">
            <div className="requests-header">
                <div>
                    <h1>Service Requests</h1>
                    <p>Manage and review submitted service requests.</p>
                </div>

                <div className="request-count">
                    {requests.length} Total Requests
                </div>
            </div>

            <div className="requests-panel">
                <div className="requests-toolbar">
                    <input
                        type="text"
                        placeholder="Search applicant, reference number, or service..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {loading ? (
                    <p className="requests-message">Loading requests...</p>
                ) : error ? (
                    <p className="requests-message error-message">{error}</p>
                ) : filteredRequests.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reference No.</th>
                                    <th>Applicant</th>
                                    <th>Service</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Date Submitted</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td>{request.reference_number}</td>
                                        <td>{request.applicant_name}</td>
                                        <td>
                                            {request.service?.service_name || "N/A"}
                                        </td>
                                        <td>{request.contact_number}</td>
                                        <td>
                                            <span className={`status ${request.status}`}>
                                                {request.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td>
                                            {request.submitted_at
                                                ? new Date(request.submitted_at).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td>
                                            <button
                                                className="view-details-button"
                                                onClick={() => openRequestDetails(request)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="requests-message">
                        No service requests found.
                    </p>
                )}
            </div>

            {selectedRequest && (
                <div className="modal-overlay">
                    <div className="request-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Request Details</h2>
                                <p>
                                    Reference No: {selectedRequest.reference_number}
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedRequest(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <h3>Applicant Information</h3>

                            <div className="detail-grid">
                                <div>
                                    <label>Full Name</label>
                                    <p>{selectedRequest.applicant_name}</p>
                                </div>

                                <div>
                                    <label>Contact Number</label>
                                    <p>{selectedRequest.contact_number}</p>
                                </div>

                                <div>
                                    <label>Email Address</label>
                                    <p>{selectedRequest.email || "N/A"}</p>
                                </div>

                                <div>
                                    <label>Address</label>
                                    <p>{selectedRequest.address || "N/A"}</p>
                                </div>

                                <div>
                                    <label>Service Requested</label>
                                    <p>
                                        {selectedRequest.service?.service_name || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <label>Status</label>
                                    <p>
                                        <span className={`status ${selectedRequest.status}`}>
                                            {selectedRequest.status?.replace("_", " ")}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <h3>Request Description</h3>
                            <p className="detail-description">
                                {selectedRequest.description || "No description provided."}
                            </p>

                            {canManage && (
                                <>
                            <h3>Update Request Status</h3>

<div className="status-update-form">
    <label>Request Status</label>
    <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
    >
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="completed">Completed</option>
    </select>

    <label>Staff Remarks</label>
    <textarea
        value={staffRemarks}
        onChange={(e) => setStaffRemarks(e.target.value)}
        placeholder="Enter remarks for this request..."
        rows="4"
    />

    {updateMessage && (
        <p className="update-message">{updateMessage}</p>
    )}

    <button
        className="save-status-button"
        onClick={handleStatusUpdate}
        disabled={saving}
    >
        {saving ? "Saving..." : "Save Changes"}
    </button>
</div>
                                </>
                            )}

                            {canViewDocuments && (
                                <>
                            <h3>Uploaded Documents</h3>

                            {documentLoading ? (
                                <p>Loading documents...</p>
                            ) : documentError ? (
                                <p className="error-message">{documentError}</p>
                            ) : selectedRequest.documents?.length > 0 ? (
                                <div className="document-list">
                                    {selectedRequest.documents.map((document) => (
                                        <div key={document.id} className="document-item">
                                            <span>📄 {document.document_name}</span>
                                            <span>{document.original_name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No uploaded documents.</p>
                            )}
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setSelectedRequest(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServiceRequests;
