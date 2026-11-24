import StaffUsers from "./pages/StaffUsers";
import { useState } from "react";
import api from "./api/axios";
import StaffDashboard from "./pages/StaffDashboard";
import ServiceRequests from "./pages/ServiceRequests";
import Services from "./pages/Services";
import Documents from "./pages/Documents";
import Tracking from "./pages/Tracking";
import Appointments from "./pages/Appointments";
import PublicHome from "./pages/public/PublicHome";
import ServiceApplication from "./pages/public/ServiceApplication";
import PublicTracking from "./pages/public/PublicTracking";
import PublicDocumentUpload from "./pages/public/PublicDocumentUpload";
import ClientAuth from "./pages/public/ClientAuth";
import ClientPortal from "./pages/ClientPortal";
import StaffClients from "./pages/StaffClients";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import AdminSettings from "./pages/AdminSettings";
import "./App.css";

const getStoredUser = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
};

function App() {
    const currentUser = getStoredUser("staff_user");
    const staffName = currentUser?.full_name || currentUser?.name || "Staff Member";
    const staffRole = currentUser?.role || "staff";

    const isAdmin = currentUser?.role === "admin";

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("staff_token")
    );
    const [clientUser, setClientUser] = useState(() =>
        localStorage.getItem("client_token") ? getStoredUser("client_user") : null
    );

    const [activeSection, setActiveSection] = useState("dashboard");
    
    const [showClientAuth, setShowClientAuth] = useState(false);
    const [showApplication, setShowApplication] = useState(false);

const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Service Requests" },
    { id: "services", label: "Service Management" },
    { id: "documents", label: "Documents" },
    { id: "tracking", label: "Tracking" },
    { id: "appointments", label: "Appointments" },
    ...(isAdmin
        ? [
            { id: "clients", label: "Client Management" },
            { id: "announcements", label: "Announcements" },
            { id: "reports", label: "Reports & Insights" },
            { id: "staff-users", label: "Administrator" },
            { id: "system-settings", label: "System Settings" },
        ]
        : []),
];
const visibleMenuItems = menuItems.filter((item) =>
    isAdmin
    || currentUser?.permissions === null
    || currentUser?.permissions === undefined
    || currentUser.permissions[item.id]?.view === true
);
const hasPermission = (module, ability = "view") =>
    isAdmin
    || currentUser?.permissions === null
    || currentUser?.permissions === undefined
    || currentUser.permissions[module]?.[ability] === true;
    const [showTracking, setShowTracking] = useState(false);

    const [showDocumentUpload, setShowDocumentUpload] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/staff/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("staff_token");
            localStorage.removeItem("staff_user");
            setIsLoggedIn(false);
            setActiveSection("dashboard");
        }
    };

    const handleClientLogout = async () => {
        try {
            await api.post("/client/logout");
        } catch (err) {
            console.error("Client logout error:", err);
        } finally {
            localStorage.removeItem("client_token");
            localStorage.removeItem("client_user");
            setClientUser(null);
        }
    };

    if (isLoggedIn) {
        return (
            <div className="staff-layout">
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">M</div>
                        <h2>MSWDO</h2>
                        <p>Admin Portal</p>
                    </div>

                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">{staffName.charAt(0).toUpperCase()}</div>
                        <div>
                            <strong>{staffName}</strong>
                            <span>{staffRole === "admin" ? "Administrator" : "Staff Member"}</span>
                        </div>
                    </div>

                    <div className="sidebar-menu">
                        <p className="menu-heading">MAIN MENU</p>

                        {visibleMenuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-item ${
                                    activeSection === item.id ? "active" : ""
                                }`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </aside>

                <main className="dashboard-content">
                    {activeSection === "dashboard" ? (
                        <StaffDashboard />
                    ) : activeSection === "requests" ? (
                        <ServiceRequests
                            canManage={hasPermission("requests", "manage")}
                            canViewDocuments={hasPermission("documents", "view")}
                        />
                    ) : activeSection === "services" ? (
                        <Services canManage={hasPermission("services", "manage")} />
                    ) : activeSection === "documents" ? (
                        <Documents />
                    ) : activeSection === "tracking" ? (
                        <Tracking />
                    ) : activeSection === "appointments" ? (
                        <Appointments
                            canManage={hasPermission("appointments", "manage")}
                            canViewRequests={hasPermission("requests", "view")}
                        />
                    ) : activeSection === "clients" && isAdmin ? (
                        <StaffClients />
                    ) : activeSection === "announcements" && isAdmin ? (
                        <Announcements />
                    ) : activeSection === "reports" && isAdmin ? (
                        <Reports />
                    ) : activeSection === "staff-users" && isAdmin ? (
                        <StaffUsers />
                    ) : activeSection === "system-settings" && isAdmin ? (
                        <AdminSettings />
                    ) : (
                        <div className="coming-soon">
                            <h2>
                                {menuItems.find(
                                    (item) => item.id === activeSection
                                )?.label}
                            </h2>
                            <p>This section is under development.</p>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    if (clientUser || localStorage.getItem("client_token")) {
    return (
        <ClientPortal
            initialUser={clientUser}
            onLogout={handleClientLogout}
        />
    );
    }

    if (showClientAuth) {
    return (
        <ClientAuth
            onAuthenticated={(user) => {
                if (user.role === "staff" || user.role === "admin") {
                    setClientUser(null);
                    setIsLoggedIn(true);
                } else {
                    setClientUser(user);
                }
                setShowClientAuth(false);
            }}
            onBack={() => setShowClientAuth(false)}
        />
    );
    }

    return (
        <div>
            {showApplication ? (
                <>
                    <div className="public-staff-access">
                        <button onClick={() => setShowApplication(false)}>
                            Back to Home
                        </button>
                    </div>
                    <ServiceApplication />
                </>
            ) : showTracking ? (
                <>
                    <div className="public-staff-access">
                        <button onClick={() => setShowTracking(false)}>
                            Back to Home
                        </button>
                    </div>
                    <PublicTracking />
                </>
            ) : showDocumentUpload ? (
                <>
                    <div className="public-staff-access">
                        <button onClick={() => setShowDocumentUpload(false)}>
                            Back to Home
                        </button>
                    </div>
                    <PublicDocumentUpload />
                </>
            ) : (
                <>
                    <PublicHome
                        onApply={() => setShowApplication(true)}
                        onTrack={() => setShowTracking(true)}
                        onUpload={() => setShowDocumentUpload(true)}
                        onClientLogin={() => setShowClientAuth(true)}
                    />
                </>
            )}
        </div>
    );
}

export default App;
