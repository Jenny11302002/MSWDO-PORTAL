import { useEffect, useState } from "react";
import api from "../api/axios";
import "./StaffUsers.css";

const PERMISSION_MODULES = [
    { key: "requests", label: "Service Requests", manage: true },
    { key: "services", label: "Service Management", manage: true },
    { key: "documents", label: "Documents", manage: true },
    { key: "tracking", label: "Tracking", manage: false },
    { key: "appointments", label: "Appointments", manage: true },
];

const defaultStaffPermissions = () => ({
    dashboard: { view: true },
    requests: { view: true, manage: true },
    services: { view: true, manage: true },
    documents: { view: true, manage: true },
    tracking: { view: true },
    appointments: { view: true, manage: true },
});

function StaffUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [passwordUser, setPasswordUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
        permissions: defaultStaffPermissions(),
    });

    const [passwordForm, setPasswordForm] = useState({
        password: "",
        password_confirmation: "",
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/staff-users");
            setUsers(response.data.data || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load staff accounts."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        api.get("/admin/staff-users")
            .then((response) => {
                if (isCurrent) {
                    setUsers(response.data.data || []);
                    setError("");
                }
            })
            .catch((err) => {
                if (isCurrent) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load staff accounts."
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

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            role: "staff",
            permissions: defaultStaffPermissions(),
        });
        setEditingUser(null);
        setShowForm(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            permissions: user.permissions || defaultStaffPermissions(),
        });
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
            if (editingUser) {
                const accountData = {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                };
                if (form.role === "staff") {
                    accountData.permissions = form.permissions;
                }
                const response = await api.put(
                    `/admin/staff-users/${editingUser.id}`,
                    accountData
                );

                setSuccess(
                    response.data.message || "Staff information updated successfully."
                );
            } else {
                const accountData = { ...form };
                if (form.role === "admin") delete accountData.permissions;
                await api.post("/admin/staff-users", accountData);
                setSuccess("New staff account created successfully.");
            }

            resetForm();
            await fetchUsers();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join(" ")
                    : err.response?.data?.message || "Unable to save account."
            );
        } finally {
            setSaving(false);
        }
    };

    const updatePermission = (module, ability, checked) => {
        const permissions = {
            ...form.permissions,
            [module]: {
                ...form.permissions[module],
                [ability]: checked,
            },
        };
        if (ability === "view" && !checked && permissions[module].manage !== undefined) {
            permissions[module].manage = false;
        }
        if (ability === "manage" && checked) {
            permissions[module].view = true;
        }
        if (module === "requests" && ability === "view" && !checked) {
            permissions.appointments.manage = false;
        }
        setForm({ ...form, permissions });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await api.put(
                `/admin/staff-users/${passwordUser.id}/password`,
                passwordForm
            );

            setSuccess(
                `Password changed for ${passwordUser.name}.`
            );

            setPasswordUser(null);
            setPasswordForm({
                password: "",
                password_confirmation: "",
            });

            await fetchUsers();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join(" ")
                    : err.response?.data?.message || "Unable to change password."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.is_active ? "deactivate" : "activate";

        if (!window.confirm(
            `Are you sure you want to ${action} ${user.name}'s account?`
        )) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            const response = await api.patch(
                `/admin/staff-users/${user.id}/status`
            );

            setSuccess(response.data.message);
            await fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update account status."
            );
        }
    };

    const totalStaff = users.filter(
        (user) => user.role === "staff"
    ).length;

    const totalAdmins = users.filter(
        (user) => user.role === "admin"
    ).length;

    const activeUsers = users.filter(
        (user) => user.is_active
    ).length;

    const inactiveUsers = users.length - activeUsers;

    const colors = {
        navy: "#102B4E",
        blue: "#173F68",
        teal: "#0D9488",
        light: "#F1F6FA",
        text: "#243B53",
        muted: "#718096",
        border: "#DCE5EE",
    };

    const cardStyle = {
        background: "#FFFFFF",
        padding: "22px",
        borderRadius: "14px",
        border: `1px solid ${colors.border}`,
        boxShadow: "0 3px 12px rgba(16,43,78,0.05)",
    };

    return (
        <div style={{
            background: colors.light,
            minHeight: "100vh",
            padding: "28px",
            color: colors.text,
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                marginBottom: "25px",
            }}>
                <div>
                    <h1 style={{
                        color: colors.navy,
                        margin: 0,
                        fontSize: "27px",
                    }}>
                        Administrator
                    </h1>
                    <p style={{ color: colors.muted, marginTop: "7px" }}>
                        Manage staff accounts, roles, passwords, and access status.
                    </p>
                </div>

                <button
                    className="staff-user-primary-button"
                    onClick={() => {
                        resetForm();
                        setError("");
                        setSuccess("");
                        setShowForm(true);
                    }}
                >
                    + Add New Staff
                </button>
            </div>

            {error && (
                <div style={{
                    background: "#FEE2E2",
                    color: "#991B1B",
                    padding: "13px",
                    borderRadius: "8px",
                    marginBottom: "18px",
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: "#D1FAE5",
                    color: "#065F46",
                    padding: "13px",
                    borderRadius: "8px",
                    marginBottom: "18px",
                }}>
                    {success}
                </div>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "25px",
            }}>
                {[
                    ["Total Accounts", users.length, colors.navy],
                    ["Staff Members", totalStaff, colors.blue],
                    ["Administrators", totalAdmins, colors.teal],
                    ["Active Accounts", activeUsers, "#15803D"],
                    ["Inactive Accounts", inactiveUsers, "#B45309"],
                ].map(([label, value, color]) => (
                    <div key={label} style={cardStyle}>
                        <p style={{
                            color: colors.muted,
                            margin: 0,
                            fontSize: "13px",
                        }}>
                            {label}
                        </p>
                        <h2 style={{
                            color,
                            margin: "10px 0 0",
                            fontSize: "29px",
                        }}>
                            {value}
                        </h2>
                    </div>
                ))}
            </div>

            {showForm && (
                <div style={{
                    ...cardStyle,
                    marginBottom: "25px",
                }}>
                    <h2 style={{
                        color: colors.navy,
                        marginTop: 0,
                    }}>
                        {editingUser ? "Edit Staff Information" : "Create Staff Account"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "15px",
                        }}>
                            <label>
                                Full Name
                                <input
                                    style={inputStyle}
                                    value={form.name}
                                    onChange={(e) => setForm({
                                        ...form,
                                        name: e.target.value,
                                    })}
                                    required
                                />
                            </label>

                            <label>
                                Email Address
                                <input
                                    style={inputStyle}
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({
                                        ...form,
                                        email: e.target.value,
                                    })}
                                    required
                                />
                            </label>

                            {!editingUser && (
                                <label>
                                    Password
                                    <input
                                        style={inputStyle}
                                        type="password"
                                        minLength="8"
                                        value={form.password}
                                        onChange={(e) => setForm({
                                            ...form,
                                            password: e.target.value,
                                        })}
                                        required
                                    />
                                </label>
                            )}
                            <label>
                                Account Role
                                <select
                                    style={inputStyle}
                                    value={form.role}
                                    onChange={(e) => setForm({
                                        ...form,
                                        role: e.target.value,
                                    })}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </label>
                        </div>

                        {form.role === "staff" ? (
                            <div className="staff-permissions-panel">
                                <div>
                                    <h3>Staff module permissions</h3>
                                    <p>Dashboard access is always available. Choose what this staff member can view and manage.</p>
                                </div>
                                <div className="staff-permissions-table">
                                    <div className="staff-permission-row staff-permission-heading">
                                        <span>Module</span>
                                        <span>View</span>
                                        <span>Manage</span>
                                    </div>
                                    {PERMISSION_MODULES.map((module) => (
                                        <div className="staff-permission-row" key={module.key}>
                                            <span>{module.label}</span>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(form.permissions[module.key]?.view)}
                                                    onChange={(event) => updatePermission(
                                                        module.key,
                                                        "view",
                                                        event.target.checked
                                                    )}
                                                />
                                                <span className="visually-hidden">
                                                    View {module.label}
                                                </span>
                                            </label>
                                            {module.manage ? (
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(form.permissions[module.key]?.manage)}
                                                        disabled={module.key === "appointments" && !form.permissions.requests?.view}
                                                        onChange={(event) => updatePermission(
                                                            module.key,
                                                            "manage",
                                                            event.target.checked
                                                        )}
                                                    />
                                                    <span className="visually-hidden">
                                                        Manage {module.label}
                                                    </span>
                                                </label>
                                            ) : (
                                                <span className="staff-permission-na">—</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="staff-admin-access-note">
                                Administrator accounts have full access to all modules and settings.
                            </p>
                        )}

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px",
                        }}>
                            <button
                                type="submit"
                                disabled={saving}
                                className="staff-user-primary-button"
                            >
                                {saving ? "Saving..." : "Save Account"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="staff-user-secondary-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {passwordUser && (
                <div style={{
                    ...cardStyle,
                    marginBottom: "25px",
                }}>
                    <h2 style={{ color: colors.navy, marginTop: 0 }}>
                        Change Password: {passwordUser.name}
                    </h2>

                    <form onSubmit={handlePasswordChange}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "15px",
                        }}>
                            <label>
                                New Password
                                <input
                                    style={inputStyle}
                                    type="password"
                                    minLength="8"
                                    value={passwordForm.password}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        password: e.target.value,
                                    })}
                                    required
                                />
                            </label>

                            <label>
                                Confirm New Password
                                <input
                                    style={inputStyle}
                                    type="password"
                                    minLength="8"
                                    value={passwordForm.password_confirmation}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        password_confirmation: e.target.value,
                                    })}
                                    required
                                />
                            </label>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px",
                        }}>
                            <button
                                type="submit"
                                disabled={saving}
                                className="staff-user-primary-button"
                            >
                                {saving ? "Updating..." : "Update Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setPasswordUser(null)}
                                className="staff-user-secondary-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                ...cardStyle,
                overflowX: "auto",
            }}>
                <h2 style={{
                    color: colors.navy,
                    marginTop: 0,
                }}>
                    Staff Accounts
                </h2>

                {loading ? (
                    <p>Loading staff accounts...</p>
                ) : (
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "750px",
                    }}>
                        <thead>
                            <tr style={{
                                background: colors.navy,
                                color: "#FFFFFF",
                                textAlign: "left",
                            }}>
                                {[
                                    "Name",
                                    "Email",
                                    "Role",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th key={heading} style={{
                                        padding: "14px",
                                    }}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{
                                    borderBottom: `1px solid ${colors.border}`,
                                }}>
                                    <td style={cellStyle}>{user.name}</td>
                                    <td style={cellStyle}>{user.email}</td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            background: user.role === "admin"
                                                ? "#DBEAFE"
                                                : "#CCFBF1",
                                            color: user.role === "admin"
                                                ? "#1D4ED8"
                                                : "#0F766E",
                                            padding: "5px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                        }}>
                                            {user.role === "admin" ? "ADMIN" : "STAFF"}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            color: user.is_active
                                                ? "#15803D"
                                                : "#B91C1C",
                                            fontWeight: "600",
                                        }}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={{
                                        ...cellStyle,
                                        whiteSpace: "nowrap",
                                    }}>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="staff-user-secondary-button"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => {
                                                setPasswordUser(user);
                                                setPasswordForm({
                                                    password: "",
                                                    password_confirmation: "",
                                                });
                                            }}
                                            className="staff-user-secondary-button"
                                        >
                                            Password
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={
                                                user.is_active
                                                    ? "staff-user-danger-button"
                                                    : "staff-user-secondary-button"
                                            }
                                        >
                                            {user.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && users.length === 0 && (
                    <p style={{
                        color: colors.muted,
                        textAlign: "center",
                        padding: "25px",
                    }}>
                        No staff accounts found.
                    </p>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    marginTop: "7px",
    marginBottom: "12px",
    fontSize: "14px",
};

const cellStyle = {
    padding: "14px",
    fontSize: "14px",
};

export default StaffUsers;
