import { useEffect, useState } from "react";
import api from "../api/axios";
import ServiceApplication from "./public/ServiceApplication";

function ClientPortal({ initialUser, onLogout }) {
    const [user, setUser] = useState(initialUser);
    const [requests, setRequests] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState("requests");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        let isCurrent = true;
        const fetchPortal = async () => {
            try {
                const [profileResponse, requestResponse] = await Promise.all([
                    api.get("/client/profile"),
                    api.get("/client/service-requests"),
                ]);
                if (!isCurrent) return;
                setUser(profileResponse.data.data);
                setRequests(requestResponse.data.data || []);
                localStorage.setItem("client_user", JSON.stringify(profileResponse.data.data));
                try {
                    const announcementResponse = await api.get("/announcements");
                    if (isCurrent) setAnnouncements(announcementResponse.data.data || []);
                } catch {
                    if (isCurrent) setError("Your account loaded, but announcements are currently unavailable.");
                }
            } catch (requestError) {
                if (isCurrent) {
                    setError(
                        requestError.response?.data?.message ||
                            "Unable to load your client portal. Please try again."
                    );
                }
            } finally {
                if (isCurrent) setLoading(false);
            }
        };
        fetchPortal();
        return () => {
            isCurrent = false;
        };
    }, []);

    const updateProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const formData = new FormData(event.currentTarget);
        const updates = {
            name: formData.get("name"),
            email: formData.get("email"),
            contact_number: formData.get("contact_number"),
            address: formData.get("address"),
        };
        if (passwordForm.password) {
            Object.assign(updates, passwordForm);
        }

        try {
            const response = await api.put("/client/profile", updates);
            setUser(response.data.data);
            localStorage.setItem("client_user", JSON.stringify(response.data.data));
            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            setMessage(response.data.message);
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : requestError.response?.data?.message ||
                        "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const refreshRequests = async () => {
        const response = await api.get("/client/service-requests");
        setRequests(response.data.data || []);
    };

    return (
        <div className="client-portal">
            <header className="client-portal-header">
                <a className="client-portal-brand" href="#client-home">
                    <span className="client-portal-logo">MS</span>
                    <span>
                        <strong>MSWDO</strong>
                        <small>Client Portal</small>
                    </span>
                </a>
                <div className="client-account-actions">
                    <span>Welcome, {user?.name}</span>
                    <button type="button" onClick={onLogout}>Sign out</button>
                </div>
            </header>

            <main className="client-portal-main" id="client-home">
                <section className="client-welcome">
                    <span className="client-eyebrow">YOUR MSWDO ACCOUNT</span>
                    <h1>How can we help you today?</h1>
                    <p>Manage your profile and follow the progress of your service requests.</p>
                </section>

                <nav className="client-tabs" aria-label="Client portal sections">
                    {[
                        ["requests", "My Requests"],
                        ["apply", "Apply for Assistance"],
                        ["profile", "My Profile"],
                        ["announcements", "Announcements"],
                    ].map(([tab, label]) => (
                        <button
                            type="button"
                            key={tab}
                            className={activeTab === tab ? "active" : ""}
                            onClick={() => {
                                setActiveTab(tab);
                                setMessage("");
                                setError("");
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {error && <p className="client-portal-alert error">{error}</p>}
                {message && <p className="client-portal-alert success">{message}</p>}

                {loading ? (
                    <p className="client-portal-empty">Loading your account...</p>
                ) : activeTab === "apply" ? (
                    <ServiceApplication
                        clientUser={user}
                        onSubmitted={async () => {
                            await refreshRequests();
                            setActiveTab("requests");
                        }}
                    />
                ) : activeTab === "profile" ? (
                    <section className="client-panel">
                        <h2>Profile and security</h2>
                        <p>Keep your contact details current. Password changes require your current password.</p>
                        <form className="client-profile-form" onSubmit={updateProfile}>
                            <label>
                                Full name
                                <input name="name" defaultValue={user?.name || ""} required />
                            </label>
                            <label>
                                Email address
                                <input name="email" type="email" defaultValue={user?.email || ""} required />
                            </label>
                            <label>
                                Contact number
                                <input name="contact_number" type="tel" defaultValue={user?.contact_number || ""} />
                            </label>
                            <label>
                                Address
                                <textarea name="address" rows="3" defaultValue={user?.address || ""} />
                            </label>
                            <label>
                                Current password
                                <input
                                    type="password"
                                    value={passwordForm.current_password}
                                    onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
                                    autoComplete="current-password"
                                />
                            </label>
                            <label>
                                New password
                                <input
                                    type="password"
                                    value={passwordForm.password}
                                    onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
                                    autoComplete="new-password"
                                    minLength="8"
                                />
                            </label>
                            <label>
                                Confirm new password
                                <input
                                    type="password"
                                    value={passwordForm.password_confirmation}
                                    onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })}
                                    autoComplete="new-password"
                                />
                            </label>
                            <button className="client-primary-button" type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save profile"}
                            </button>
                        </form>
                    </section>
                ) : activeTab === "announcements" ? (
                    <section className="client-announcement-list">
                        {announcements.length ? announcements.map((item) => (
                            <article className="client-panel" key={item.id}>
                                <span className="client-eyebrow">
                                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : "MSWDO NOTICE"}
                                </span>
                                <h2>{item.title}</h2>
                                <p>{item.content}</p>
                            </article>
                        )) : <p className="client-portal-empty">There are no announcements at this time.</p>}
                    </section>
                ) : (
                    <section className="client-request-list">
                        <div className="client-list-heading">
                            <div>
                                <h2>My service requests</h2>
                                <p>{requests.length} application{requests.length === 1 ? "" : "s"}</p>
                            </div>
                            <button className="client-primary-button" type="button" onClick={() => setActiveTab("apply")}>
                                + New application
                            </button>
                        </div>
                        {requests.length ? requests.map((request) => (
                            <article className="client-request-card" key={request.id}>
                                <div className="client-request-heading">
                                    <div>
                                        <span className="client-eyebrow">{request.reference_number}</span>
                                        <h3>{request.service?.service_name || "Service request"}</h3>
                                    </div>
                                    <span className={`client-status ${request.status}`}>
                                        {request.status?.replaceAll("_", " ")}
                                    </span>
                                </div>
                                <p>Submitted {request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() : "—"}</p>
                                {request.remarks && <p className="client-request-remarks"><strong>Staff update:</strong> {request.remarks}</p>}
                                {request.appointments?.length > 0 && (
                                    <div className="client-appointments">
                                        <strong>Appointments</strong>
                                        {request.appointments.map((appointment) => (
                                            <p key={appointment.id}>
                                                {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time?.slice(0, 5)} · {appointment.location} · {appointment.status}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </article>
                        )) : <p className="client-portal-empty">You have not submitted any requests yet.</p>}
                    </section>
                )}
            </main>
        </div>
    );
}

export default ClientPortal;
