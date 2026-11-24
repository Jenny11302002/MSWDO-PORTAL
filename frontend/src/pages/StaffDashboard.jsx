
import { useEffect, useState } from "react";
import api from "../api/axios";

function StaffDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/staff/dashboard");
                setDashboard(response.data.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const statistics = [
        { label: "Total Requests", value: dashboard?.total_requests ?? 0 },
        { label: "Pending", value: dashboard?.pending_requests ?? 0 },
        { label: "Under Review", value: dashboard?.under_review_requests ?? 0 },
        { label: "Approved", value: dashboard?.approved_requests ?? 0 },
        { label: "Rejected", value: dashboard?.rejected_requests ?? 0 },
        { label: "Completed", value: dashboard?.completed_requests ?? 0 },
    ];

    if (loading) {
        return <div className="dashboard-message">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-message error-message">{error}</div>;
    }

    const barangayStatistics = dashboard?.barangay_statistics || [];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <span className="dashboard-badge">Operations overview</span>
                    <h1>MSWDO Staff Dashboard</h1>
                    <p>Welcome to the Admin Management System</p>
                </div>
                <div className="dashboard-header-actions">
                    <span className="dashboard-pill">Live updates</span>
                    <span className="dashboard-pill soft">Today</span>
                </div>
            </header>

            <section className="statistics-grid">
                {statistics.map((item) => (
                    <div className="stat-card" key={item.label}>
                        <div className="stat-card-top">
                            <h3>{item.label}</h3>
                            <span className="stat-icon">↗</span>
                        </div>
                        <p>{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="recent-requests">
                <div className="table-header-row">
                    <h2>Recent Service Requests</h2>
                    <span className="table-tag">Updated now</span>
                </div>

                {dashboard?.recent_requests?.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Date Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recent_requests.map((request) => (
                                    <tr key={request.id}>
                                        <td>{request.applicant_name}</td>
                                        <td>
                                            {request.service?.service_name || "N/A"}
                                        </td>
                                        <td>
                                            <span className={`status ${request.status}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No service requests found.</p>
                )}
            </section>

            <section className="recent-requests barangay-statistics">
                <div className="table-header-row">
                    <h2>Applications per Barangay</h2>
                    <span className="table-tag">By area</span>
                </div>
                <p className="section-description">
                    Number of service applications received from each barangay.
                </p>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Barangay</th>
                                <th>Total Applications</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barangayStatistics.map((item) => (
                                <tr key={item.barangay}>
                                    <td>{item.barangay}</td>
                                    <td>
                                        <strong>{item.total_applications}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>Total Applications</th>
                                <th>
                                    {barangayStatistics.reduce(
                                        (total, item) =>
                                            total + Number(item.total_applications),
                                        0
                                    )}
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default StaffDashboard;
