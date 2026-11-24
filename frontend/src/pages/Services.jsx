
import { useEffect, useState } from "react";
import api from "../api/axios";

function Services({ canManage = true }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const emptyForm = {
        service_name: "",
        description: "",
        requirements: "",
        eligibility: "",
        instructions: "",
        is_active: true,
    };

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchServices = async () => {
        try {
            setLoading(true);
           const response = await api.get("/staff/services");
            setServices(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load services."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        api.get("/staff/services")
            .then((response) => {
                if (isCurrent) setServices(response.data.data || []);
            })
            .catch((err) => {
                if (isCurrent) {
                    setError(
                        err.response?.data?.message || "Unable to load services."
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (service) => {
        setForm({
            service_name: service.service_name || "",
            description: service.description || "",
            requirements: service.requirements || "",
            eligibility: service.eligibility || "",
            instructions: service.instructions || "",
            is_active: Boolean(service.is_active),
        });

        setEditingId(service.id);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await api.put(`/services/${editingId}`, form);
                setSuccess("Service updated successfully.");
            } else {
                await api.post("/services", form);
                setSuccess("Service added successfully.");
            }

            resetForm();
            await fetchServices();
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : err.response?.data?.message || "Unable to save service."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (service) => {
        setError("");
        setSuccess("");

        try {
            await api.put(`/services/${service.id}`, {
                is_active: !service.is_active,
            });

            setSuccess(
                `${service.service_name} ${
                    service.is_active ? "deactivated" : "activated"
                } successfully.`
            );

            await fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update service status."
            );
        }
    };

    return (
        <div className="services-management">
            <div className="services-page-header">
                <div>
                    <span>MSWDO ADMINISTRATION</span>
                    <h1>Service Management</h1>
                    <p>Manage social welfare services and their information.</p>
                </div>

                {canManage && <button
                    className="services-add-button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                        setError("");
                        setSuccess("");
                    }}
                >
                    + Add New Service
                </button>}
            </div>

            {error && <div className="services-alert error">{error}</div>}
            {success && <div className="services-alert success">{success}</div>}

            {showForm && (
                <form className="services-form" onSubmit={handleSubmit}>
                    <h2>{editingId ? "Edit Service" : "Add New Service"}</h2>

                    <div className="services-form-grid">
                        <div className="services-field full-width">
                            <label>Service Name</label>
                            <input
                                name="service_name"
                                value={form.service_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter service name"
                            />
                        </div>

                        <div className="services-field full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        <div className="services-field full-width">
                            <label>Requirements</label>
                            <textarea
                                name="requirements"
                                value={form.requirements}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Separate requirements using commas"
                            />
                        </div>

                        <div className="services-field full-width">
                            <label>Eligibility</label>
                            <textarea
                                name="eligibility"
                                value={form.eligibility}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        <div className="services-field full-width">
                            <label>Application Instructions</label>
                            <textarea
                                name="instructions"
                                value={form.instructions}
                                onChange={handleChange}
                                rows="4"
                            />
                        </div>

                        <label className="services-status-field">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            Active service
                        </label>
                    </div>

                    <div className="services-form-actions">
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Save Changes"
                                : "Add Service"}
                        </button>
                    </div>
                </form>
            )}

            <div className="services-summary">
                <div>
                    <strong>{services.length}</strong>
                    <span>Total Services</span>
                </div>
                <div>
                    <strong>
                        {services.filter((service) => service.is_active).length}
                    </strong>
                    <span>Active Services</span>
                </div>
                <div>
                    <strong>
                        {services.filter((service) => !service.is_active).length}
                    </strong>
                    <span>Inactive Services</span>
                </div>
            </div>

            <div className="services-table-container">
                <h2>Available Services</h2>

                {loading ? (
                    <p>Loading services...</p>
                ) : services.length === 0 ? (
                    <p>No services found.</p>
                ) : (
                    <div className="services-table-scroll">
                        <table className="services-table">
                            <thead>
                                <tr>
                                    <th>Service Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td>
                                            <strong>{service.service_name}</strong>
                                        </td>
                                        <td>{service.description || "—"}</td>
                                        <td>
                                            <span
                                                className={`services-status ${
                                                    service.is_active
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {service.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            {canManage && <div className="services-row-actions">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(service)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleToggleStatus(service)
                                                    }
                                                >
                                                    {service.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Services;
