import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function StaffClients() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadClients = async () => {
        try {
            const response = await api.get("/admin/clients");
            setClients(response.data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load client accounts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        const fetchClients = async () => {
            try {
                const response = await api.get("/admin/clients");
                if (isCurrent) setClients(response.data.data || []);
            } catch (requestError) {
                if (isCurrent) {
                    setError(requestError.response?.data?.message || "Unable to load client accounts.");
                }
            } finally {
                if (isCurrent) setLoading(false);
            }
        };
        fetchClients();
        return () => {
            isCurrent = false;
        };
    }, []);

    const filteredClients = useMemo(() => {
        const keyword = search.toLowerCase();
        return clients.filter((client) => {
            const matchesSearch = [
                client.name,
                client.email,
                client.contact_number,
                client.address,
            ].some((value) => value?.toLowerCase().includes(keyword));
            return matchesSearch &&
                (status === "all" || (status === "active") === client.is_active);
        });
    }, [clients, search, status]);

    const toggleStatus = async (client) => {
        const action = client.is_active ? "deactivate" : "activate";
        if (!window.confirm(`Are you sure you want to ${action} ${client.name}'s account?`)) return;
        setError("");
        setMessage("");
        try {
            const response = await api.patch(`/admin/clients/${client.id}/status`);
            setMessage(response.data.message);
            await loadClients();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to update this client account.");
        }
    };

    return (
        <section className="staff-clients-page">
            <header className="staff-module-header">
                <div>
                    <span>MSWDO ADMINISTRATION</span>
                    <h1>Client Management</h1>
                    <p>Search client profiles, review activity, and manage account access.</p>
                </div>
                <strong>{clients.length} clients</strong>
            </header>
            {error && <p className="staff-module-alert error">{error}</p>}
            {message && <p className="staff-module-alert success">{message}</p>}

            <div className="staff-module-toolbar">
                <input
                    type="search"
                    placeholder="Search name, email, phone, or address..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter clients by status">
                    <option value="all">All accounts</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {loading ? (
                <p className="staff-module-empty">Loading client accounts...</p>
            ) : filteredClients.length ? (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Requests</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client.id}>
                                    <td>
                                        <strong>{client.name}</strong>
                                        <br />
                                        <small>{client.email}</small>
                                    </td>
                                    <td>{client.contact_number || "—"}</td>
                                    <td>{client.address || "—"}</td>
                                    <td>{client.service_requests_count || 0}</td>
                                    <td><span className={`client-status ${client.is_active ? "active" : "inactive"}`}>{client.is_active ? "Active" : "Inactive"}</span></td>
                                    <td>
                                        <button className="client-table-action" type="button" onClick={() => toggleStatus(client)}>
                                            {client.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="staff-module-empty">No client accounts match your search.</p>
            )}
        </section>
    );
}

export default StaffClients;
