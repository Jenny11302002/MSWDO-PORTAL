import { useState } from "react";
import api from "../../api/axios";

function PublicTracking() {
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
            const response = await api.post("/track-request", {
                reference_number: referenceNumber.trim(),
            });

            setTrackingData(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Application not found. Please check your reference number."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status) =>
        status?.replaceAll("_", " ");

    return (
        <div className="public-tracking-page">
            <div className="public-tracking-container">
                <span className="public-tracking-label">
                    MSWDO ONLINE SERVICES
                </span>

                <h1>Track Your Application</h1>

                <p>
                    Enter your application reference number to check
                    the current status of your request.
                </p>

                <form onSubmit={handleTrack}>
                    <label>Application Reference Number</label>

                    <input
                        type="text"
                        placeholder="Example: MSWDO-MHXSK2XJDO"
                        value={referenceNumber}
                        onChange={(e) =>
                            setReferenceNumber(e.target.value)
                        }
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Searching..." : "Track Application"}
                    </button>
                </form>

                {error && (
                    <div className="public-tracking-error">
                        {error}
                    </div>
                )}

                {trackingData && (
                    <div className="public-tracking-result">
                        <h2>Application Details</h2>

                        <div>
                            <label>Reference Number</label>
                            <p>{trackingData.reference_number}</p>
                        </div>

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
                            <label>Application Status</label>
                            <span
                                className={`public-tracking-status ${trackingData.status}`}
                            >
                                {formatStatus(trackingData.status)}
                            </span>
                        </div>

                        <div>
                            <label>Staff Remarks</label>
                            <p>
                                {trackingData.remarks ||
                                    "No staff remarks yet."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicTracking;