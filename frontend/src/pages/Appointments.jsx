
import { useEffect, useState } from "react";
import api from "../api/axios";

function Appointments({ canManage = true, canViewRequests = true }) {
    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        service_request_id: "",
        appointment_date: "",
        appointment_time: "",
        location: "MSWDO Office",
        purpose: "",
        remarks: "",
        status: "scheduled",
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        let isCurrent = true;
        const requestList = canManage && canViewRequests
            ? api.get("/service-requests")
            : Promise.resolve({ data: { data: [] } });
        Promise.all([api.get("/appointments"), requestList])
            .then(([appointmentResponse, requestResponse]) => {
                if (!isCurrent) return;
                setAppointments(appointmentResponse.data.data || []);
                setRequests(requestResponse.data.data || []);
                setError("");
            })
            .catch((err) => {
                if (isCurrent) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load appointments."
                    );
                }
            })
            .finally(() => {
                if (isCurrent) setLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [canManage, canViewRequests]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const openEditForm = (appointment) => {
        setEditingId(appointment.id);
        setForm({
            service_request_id: appointment.service_request_id,
            appointment_date: appointment.appointment_date?.slice(0, 10) || "",
            appointment_time: appointment.appointment_time?.slice(0, 5) || "",
            location: appointment.location || "",
            purpose: appointment.purpose || "",
            remarks: appointment.remarks || "",
            status: appointment.status,
        });
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingId) {
                const response = await api.patch(
                    `/appointments/${editingId}`,
                    {
                        appointment_date: form.appointment_date,
                        appointment_time: form.appointment_time,
                        location: form.location,
                        purpose: form.purpose,
                        remarks: form.remarks,
                        status: form.status,
                    }
                );

                setAppointments((previous) =>
                    previous.map((item) =>
                        item.id === editingId
                            ? response.data.data
                            : item
                    )
                );

                setMessage("Appointment updated successfully.");
            } else {
                const response = await api.post("/appointments", form);

                setAppointments((previous) => [
                    response.data.data,
                    ...previous,
                ]);

                setMessage("Appointment scheduled successfully.");
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : err.response?.data?.message ||
                      "Unable to save appointment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) {
            return;
        }

        try {
            await api.delete(`/appointments/${id}`);

            setAppointments((previous) =>
                previous.filter((item) => item.id !== id)
            );

            setMessage("Appointment deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete appointment."
            );
        }
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const request = appointment.service_request;

        const searchText = [
            request?.applicant_name,
            request?.reference_number,
            appointment.location,
            appointment.purpose,
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchText.includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatStatus = (status) => {
        return status?.replace("_", " ");
    };

    return (
        <div className="appointments-page">
            <div className="appointments-header">
                <div>
                    <h1>Appointment Management</h1>
                    <p>Schedule and manage applicant appointments.</p>
                </div>

                {canManage && <button
                    className="appointment-add-button"
                    onClick={openCreateForm}
                >
                    + Schedule Appointment
                </button>}
            </div>

            {message && (
                <div className="appointment-success">{message}</div>
            )}

            {error && (
                <div className="appointment-error">{error}</div>
            )}

            <div className="appointment-summary">
                <div>
                    <span>Total Appointments</span>
                    <h2>{appointments.length}</h2>
                </div>

                <div>
                    <span>Scheduled</span>
                    <h2>
                        {appointments.filter(
                            (item) => item.status === "scheduled"
                        ).length}
                    </h2>
                </div>

                <div>
                    <span>Completed</span>
                    <h2>
                        {appointments.filter(
                            (item) => item.status === "completed"
                        ).length}
                    </h2>
                </div>

                <div>
                    <span>Cancelled</span>
                    <h2>
                        {appointments.filter(
                            (item) => item.status === "cancelled"
                        ).length}
                    </h2>
                </div>
            </div>

            {showForm && canManage && (
                <div className="appointment-form-panel">
                    <h2>
                        {editingId ? "Edit Appointment" : "Schedule New Appointment"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {!editingId && (
                            <div className="appointment-form-group">
                                <label>Service Request / Applicant</label>

                                <select
                                    name="service_request_id"
                                    value={form.service_request_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select applicant
                                    </option>

                                    {requests.map((request) => (
                                        <option
                                            key={request.id}
                                            value={request.id}
                                        >
                                            {request.applicant_name} - {request.reference_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="appointment-form-grid">
                            <div className="appointment-form-group">
                                <label>Appointment Date</label>
                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={form.appointment_date}
                                    onChange={handleChange}
                                    min={new Date().toLocaleDateString("en-CA")}
                                    required
                                />
                            </div>

                            <div className="appointment-form-group">
                                <label>Appointment Time</label>
                                <input
                                    type="time"
                                    name="appointment_time"
                                    value={form.appointment_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="appointment-form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="appointment-form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    disabled={!editingId}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="appointment-form-group full-width">
                                <label>Purpose</label>
                                <textarea
                                    name="purpose"
                                    value={form.purpose}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="appointment-form-group full-width">
                                <label>Remarks</label>
                                <textarea
                                    name="remarks"
                                    value={form.remarks}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="appointment-form-actions">
                            <button
                                type="button"
                                className="appointment-cancel-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="appointment-save-button"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Schedule Appointment"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="appointment-table-panel">
                <div className="appointment-table-heading">
                    <h2>Appointment List</h2>

                    <div className="appointment-filters">
                        <input
                            type="text"
                            placeholder="Search applicant or reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="appointment-empty">Loading appointments...</p>
                ) : filteredAppointments.length === 0 ? (
                    <p className="appointment-empty">No appointments found.</p>
                ) : (
                    <div className="appointment-table-wrapper">
                        <table className="appointment-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Reference No.</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>
                                            {appointment.service_request?.applicant_name || "N/A"}
                                        </td>
                                        <td>
                                            {appointment.service_request?.reference_number || "N/A"}
                                        </td>
                                        <td>
                                            {appointment.appointment_date?.slice(0, 10)}
                                        </td>
                                        <td>
                                            {appointment.appointment_time?.slice(0, 5)}
                                        </td>
                                        <td>{appointment.location}</td>
                                        <td>
                                            <span className={`appointment-status ${appointment.status}`}>
                                                {formatStatus(appointment.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="appointment-actions">
                                                {canManage && <button
                                                    onClick={() => openEditForm(appointment)}
                                                >
                                                    Edit
                                                </button>}

                                                    {canManage && <button
                                                    className="delete"
                                                    onClick={() => handleDelete(appointment.id)}
                                                >
                                                    Delete
                                                    </button>}
                                            </div>
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

export default Appointments;
