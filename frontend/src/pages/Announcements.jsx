import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = { title: "", content: "", is_published: false };

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadAnnouncements = async () => {
        try {
            const response = await api.get("/admin/announcements");
            setAnnouncements(response.data.data || []);
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load announcements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        const fetchAnnouncements = async () => {
            try {
                const response = await api.get("/admin/announcements");
                if (isCurrent) setAnnouncements(response.data.data || []);
            } catch (requestError) {
                if (isCurrent) {
                    setError(requestError.response?.data?.message || "Unable to load announcements.");
                }
            } finally {
                if (isCurrent) setLoading(false);
            }
        };
        fetchAnnouncements();
        return () => {
            isCurrent = false;
        };
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = editingId
                ? await api.put(`/admin/announcements/${editingId}`, form)
                : await api.post("/admin/announcements", form);
            setMessage(response.data.message);
            resetForm();
            await loadAnnouncements();
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : requestError.response?.data?.message || "Unable to save announcement."
            );
        } finally {
            setSaving(false);
        }
    };

    const edit = (announcement) => {
        setEditingId(announcement.id);
        setForm({
            title: announcement.title,
            content: announcement.content,
            is_published: announcement.is_published,
        });
        setShowForm(true);
    };

    const remove = async (announcement) => {
        if (!window.confirm(`Delete "${announcement.title}"?`)) return;
        setError("");
        setMessage("");
        try {
            const response = await api.delete(`/admin/announcements/${announcement.id}`);
            setMessage(response.data.message);
            await loadAnnouncements();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to delete announcement.");
        }
    };

    return (
        <section className="announcements-management">
            <header className="staff-module-header">
                <div>
                    <span>MSWDO ADMINISTRATION</span>
                    <h1>Announcements</h1>
                    <p>Publish office updates and notices for clients.</p>
                </div>
                <button
                    className="client-primary-button"
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + New announcement
                </button>
            </header>
            {error && <p className="staff-module-alert error">{error}</p>}
            {message && <p className="staff-module-alert success">{message}</p>}
            {showForm && (
                <form className="announcement-form" onSubmit={submit}>
                    <h2>{editingId ? "Edit announcement" : "Create announcement"}</h2>
                    <label>
                        Title
                        <input
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                            maxLength="255"
                            required
                        />
                    </label>
                    <label>
                        Message
                        <textarea
                            value={form.content}
                            onChange={(event) => setForm({ ...form, content: event.target.value })}
                            rows="5"
                            required
                        />
                    </label>
                    <label className="announcement-publish-toggle">
                        <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
                        />
                        Publish now (visible to clients)
                    </label>
                    <div className="announcement-form-actions">
                        <button type="button" onClick={resetForm}>Cancel</button>
                        <button className="client-primary-button" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save announcement"}
                        </button>
                    </div>
                </form>
            )}
            {loading ? (
                <p className="staff-module-empty">Loading announcements...</p>
            ) : announcements.length ? (
                <div className="announcement-admin-list">
                    {announcements.map((announcement) => (
                        <article className="client-panel" key={announcement.id}>
                            <div className="announcement-admin-heading">
                                <div>
                                    <span className={`client-status ${announcement.is_published ? "active" : "inactive"}`}>
                                        {announcement.is_published ? "Published" : "Draft"}
                                    </span>
                                    <h2>{announcement.title}</h2>
                                </div>
                                <div className="announcement-admin-actions">
                                    <button type="button" onClick={() => edit(announcement)}>Edit</button>
                                    <button type="button" onClick={() => remove(announcement)}>Delete</button>
                                </div>
                            </div>
                            <p>{announcement.content}</p>
                            <small>{announcement.published_at ? new Date(announcement.published_at).toLocaleString() : "Not published"}</small>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="staff-module-empty">No announcements have been created.</p>
            )}
        </section>
    );
}

export default Announcements;
