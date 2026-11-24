import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminSettings.css";

const DEFAULT_SETTINGS = {
    office: {
        name: "Municipal Social Welfare and Development Office",
        address: "",
        email: "",
        phone: "",
    },
    reports: {
        default_period: "30",
    },
    notifications: {
        email_enabled: false,
        sms_enabled: false,
        email_recipient: "",
        sms_recipient: "",
    },
};

function AdminSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let isCurrent = true;
        api.get("/admin/settings")
            .then((response) => {
                if (isCurrent) setSettings(response.data.data);
            })
            .catch((err) => {
                if (isCurrent) {
                    setLoadFailed(true);
                    setError(
                        err.response?.data?.message ||
                        "Unable to load system settings."
                    );
                }
            })
            .finally(() => {
                if (isCurrent) setLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const updateSetting = (section, field, value) => {
        setSettings((current) => ({
            ...current,
            [section]: {
                ...current[section],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put("/admin/settings", settings);
            setSettings(response.data.data);
            setSuccess(response.data.message || "System settings saved.");
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join(" ")
                    : err.response?.data?.message || "Unable to save system settings."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-settings-page">Loading system settings...</div>;
    }

    return (
        <div className="admin-settings-page">
            <header className="admin-settings-header">
                <div>
                    <span className="admin-settings-eyebrow">ADMINISTRATION</span>
                    <h1>System Settings</h1>
                    <p>Manage shared office information and portal defaults.</p>
                </div>
            </header>

            {error && <div className="admin-settings-alert" role="alert">{error}</div>}
            {success && <div className="admin-settings-success" role="status">{success}</div>}

            <form onSubmit={handleSubmit}>
                <section className="admin-settings-card">
                    <div className="admin-settings-section-title">
                        <span className="admin-settings-icon">⌂</span>
                        <div>
                            <h2>Office profile</h2>
                            <p>Contact details displayed and used by the portal.</p>
                        </div>
                    </div>
                    <div className="admin-settings-grid">
                        <label className="admin-settings-field admin-settings-field-wide">
                            Office name
                            <input
                                value={settings.office.name}
                                onChange={(event) => updateSetting(
                                    "office",
                                    "name",
                                    event.target.value
                                )}
                                maxLength="255"
                                required
                            />
                        </label>
                        <label className="admin-settings-field admin-settings-field-wide">
                            Office address
                            <textarea
                                value={settings.office.address || ""}
                                onChange={(event) => updateSetting(
                                    "office",
                                    "address",
                                    event.target.value
                                )}
                                rows="3"
                                maxLength="1000"
                            />
                        </label>
                        <label className="admin-settings-field">
                            Contact email
                            <input
                                type="email"
                                value={settings.office.email || ""}
                                onChange={(event) => updateSetting(
                                    "office",
                                    "email",
                                    event.target.value
                                )}
                                maxLength="255"
                            />
                        </label>
                        <label className="admin-settings-field">
                            Contact number
                            <input
                                type="tel"
                                value={settings.office.phone || ""}
                                onChange={(event) => updateSetting(
                                    "office",
                                    "phone",
                                    event.target.value
                                )}
                                maxLength="30"
                            />
                        </label>
                    </div>
                </section>

                <section className="admin-settings-card">
                    <div className="admin-settings-section-title">
                        <span className="admin-settings-icon admin-settings-icon-blue">▦</span>
                        <div>
                            <h2>Report defaults</h2>
                            <p>Choose the date range used when an administrator opens reports.</p>
                        </div>
                    </div>
                    <label className="admin-settings-field admin-settings-period">
                        Default report period
                        <select
                            value={settings.reports.default_period}
                            onChange={(event) => updateSetting(
                                "reports",
                                "default_period",
                                event.target.value
                            )}
                        >
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 12 months</option>
                            <option value="all">All time</option>
                        </select>
                    </label>
                    <p className="admin-settings-help">
                        Reports can still be changed to any date range before generation.
                    </p>
                </section>

                <section className="admin-settings-card">
                    <div className="admin-settings-section-title">
                        <span className="admin-settings-icon admin-settings-icon-amber">◉</span>
                        <div>
                            <h2>Notification settings</h2>
                            <p>Configure preferred notification channels and destination contacts.</p>
                        </div>
                    </div>
                    <div className="admin-settings-notifications">
                        <div className="admin-settings-channel">
                            <label className="admin-settings-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email_enabled}
                                    onChange={(event) => updateSetting(
                                        "notifications",
                                        "email_enabled",
                                        event.target.checked
                                    )}
                                />
                                <span>Email channel</span>
                            </label>
                            <label className="admin-settings-field">
                                Notification email
                                <input
                                    type="email"
                                    value={settings.notifications.email_recipient || ""}
                                    onChange={(event) => updateSetting(
                                        "notifications",
                                        "email_recipient",
                                        event.target.value
                                    )}
                                    maxLength="255"
                                />
                            </label>
                        </div>
                        <div className="admin-settings-channel">
                            <label className="admin-settings-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.sms_enabled}
                                    onChange={(event) => updateSetting(
                                        "notifications",
                                        "sms_enabled",
                                        event.target.checked
                                    )}
                                />
                                <span>SMS channel</span>
                            </label>
                            <label className="admin-settings-field">
                                Notification mobile number
                                <input
                                    type="tel"
                                    value={settings.notifications.sms_recipient || ""}
                                    onChange={(event) => updateSetting(
                                        "notifications",
                                        "sms_recipient",
                                        event.target.value
                                    )}
                                    maxLength="30"
                                />
                            </label>
                        </div>
                    </div>
                    <p className="admin-settings-warning">
                        Channel preferences are saved here. Actual email/SMS delivery requires a configured provider and is not connected yet.
                    </p>
                </section>

                <div className="admin-settings-footer">
                    <button
                        className="admin-settings-save"
                        type="submit"
                        disabled={saving || loadFailed}
                    >
                        {saving ? "Saving..." : "Save settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminSettings;
