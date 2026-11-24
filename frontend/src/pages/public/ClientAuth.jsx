import { useState } from "react";
import api from "../../api/axios";

function ClientAuth({ onAuthenticated, onBack }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({
        name: "",
        email: "",
        contact_number: "",
        address: "",
        password: "",
        password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            let response;
            if (mode === "login") {
                const credentials = { email: form.email, password: form.password };
                try {
                    response = await api.post("/staff/login", credentials);
                } catch (staffLoginError) {
                    if (![401, 403].includes(staffLoginError.response?.status)) {
                        throw staffLoginError;
                    }
                    response = await api.post("/client/login", credentials);
                }
            } else {
                response = await api.post("/client/register", form);
            }

            const { user, token } = response.data.data;
            if (user.role === "client") {
                localStorage.removeItem("staff_token");
                localStorage.removeItem("staff_user");
                localStorage.setItem("client_token", token);
                localStorage.setItem("client_user", JSON.stringify(user));
            } else if (["staff", "admin"].includes(user.role)) {
                localStorage.removeItem("client_token");
                localStorage.removeItem("client_user");
                localStorage.setItem("staff_token", token);
                localStorage.setItem("staff_user", JSON.stringify(user));
            } else {
                throw new Error("This account cannot access the portal.");
            }
            onAuthenticated(user);
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : requestError.response?.data?.message ||
                      requestError.message ||
                    "Unable to sign in. Check your credentials and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const isRegistering = mode === "register";

    return (
        <main className="client-auth-page">
            <section className="client-auth-card">
                <button className="client-back-link" type="button" onClick={onBack}>
                    Back to home
                </button>
                <span className="client-eyebrow">MSWDO ONLINE SERVICES</span>
                <h1>
                    {isRegistering
                        ? "Create your client account"
                        : "Welcome back"}
                </h1>
                <p className="client-auth-intro">
                    {isRegistering
                        ? "Register to manage your profile and keep track of your assistance requests."
                        : "Sign in with your client, staff, or administrator account."}
                </p>

                <form onSubmit={handleSubmit} className="client-auth-form">
                    {isRegistering && (
                        <>
                            <label>
                                Full name
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </label>
                            <label>
                                Contact number
                                <input
                                    name="contact_number"
                                    type="tel"
                                    value={form.contact_number}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                />
                            </label>
                            <label>
                                Complete address
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    rows="2"
                                />
                            </label>
                        </>
                    )}
                    <label>
                        Email address
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete={isRegistering ? "new-password" : "current-password"}
                            minLength={isRegistering ? 8 : undefined}
                            required
                        />
                    </label>
                    {isRegistering && (
                        <label>
                            Confirm password
                            <input
                                name="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength="8"
                                required
                            />
                        </label>
                    )}

                    {error && <p className="client-form-error">{error}</p>}

                    <button className="client-primary-button" type="submit" disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : isRegistering
                              ? "Create account"
                              : "Sign in"}
                    </button>
                </form>

                <p className="client-auth-switch">
                    {isRegistering ? "Already registered?" : "New to the portal?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(isRegistering ? "login" : "register");
                            setError("");
                        }}
                    >
                        {isRegistering ? "Sign in" : "Create an account"}
                    </button>
                </p>
            </section>
        </main>
    );
}

export default ClientAuth;
