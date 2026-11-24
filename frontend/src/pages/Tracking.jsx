
import { useState } from "react";
import api from "../api/axios";

function Tracking() {
    const [referenceNumber, setReferenceNumber] = useState("");
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setTrackingData(null);

        try {
            const response = await api.post("/staff/track-request", {
                reference_number: referenceNumber.trim(),
            });

            setTrackingData(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to find service request."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status) => {
        return status?.replace("_", " ");
    };

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <div>
                    <h1>Request Tracking</h1>
                    <p>Search and monitor applicant service requests.</p>
                </div>
            </div>

            <div className="tracking-search-panel">
                <div className="tracking-search-heading">
                    <h2>Track Service Request</h2>
                    <p>Enter the applicant's reference number below.</p>
                </div>

                <form onSubmit={handleTrack} className="tracking-form">
                    <input
                        type="text"
                        placeholder="Example: MSWDO-M1YKLIMP30"
                        value={referenceNumber}
                        onChange={(e) =>
                            setReferenceNumber(e.target.value)
                        }
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Searching..." : "Track Request"}
                    </button>
                </form>

                {error && (
                    <p className="tracking-error">{error}</p>
                )}
            </div>

            {trackingData && (
                <div className="tracking-result">
                    <div className="tracking-result-header">
                        <div>
                            <h2>Request Information</h2>
                            <p>{trackingData.reference_number}</p>
                        </div>

                        <span className={`status ${trackingData.status}`}>
                            {formatStatus(trackingData.status)}
                        </span>
                    </div>

                    <div className="tracking-details-grid">
                        <div>
                            <label>Applicant Name</label>
                            <p>{trackingData.applicant_name}</p>
                        </div>

                        <div>
                            <label>Service Requested</label>
                            <p>{trackingData.service_name}</p>
                        </div>

                        <div>
                            <label>Submission Date</label>
                            <p>
                                {trackingData.submitted_at
                                    ? new Date(
                                        trackingData.submitted_at
                                    ).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>

                        <div>
                            <label>Current Status</label>
                            <p className={`status-text ${trackingData.status}`}>
                                {formatStatus(trackingData.status)}
                            </p>
                        </div>
                    </div>

                    <h3>Staff Remarks</h3>
                    <p className="tracking-remarks">
                        {trackingData.remarks || "No staff remarks yet."}
                    </p>

                    <h3>Submitted Documents</h3>

                    {trackingData.documents?.length > 0 ? (
                        <div className="tracking-document-list">
                            {trackingData.documents.map((document) => (
                                <div
                                    key={document.id}
                                    className="tracking-document-item"
                                >
                                    <span>
                                        📄 {document.document_name}
                                    </span>
                                    <span>{document.original_name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No uploaded documents.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Tracking;
