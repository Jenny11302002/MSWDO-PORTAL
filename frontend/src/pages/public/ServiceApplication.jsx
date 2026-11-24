import { useEffect, useState } from "react";
import api from "../../api/axios";

function ServiceApplication({ clientUser, onSubmitted }) {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [loadingServices, setLoadingServices] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const [form, setForm] = useState(() => ({
        service_id: "",
        applicant_name: clientUser?.name || "",
        contact_number: clientUser?.contact_number || "",
        email: clientUser?.email || "",
        address: clientUser?.address || "",
        description: "",
    }));

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get("/services");
                setServices(
                    (response.data.data || []).filter(
                        (service) => service.is_active
                    )
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load available services."
                );
            } finally {
                setLoadingServices(false);
            }
        };

        fetchServices();
    }, []);

   const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
        ...prev,
        [name]: value,
    }));

    if (name === "service_id") {
        const selected = services.find(
            (service) => String(service.id) === String(value)
        );

        setSelectedService(selected || null);
    }
};
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess(null);
        setSelectedService(null);

        try {
            const response = await api.post(
                clientUser ? "/client/service-requests" : "/service-requests",
                {
                ...form,
                service_id: Number(form.service_id),
                }
            );

            setSuccess(response.data.data);
            if (onSubmitted) await onSubmitted(response.data.data);
            setForm({
                service_id: "",
                applicant_name: "",
                contact_number: "",
                email: "",
                address: "",
                description: "",
            });
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(" ")
                    : err.response?.data?.message ||
                      "Unable to submit your application."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="application-page">
            <div className="application-header">
                <span>MSWDO ONLINE SERVICES</span>
                <h1>Apply for Social Welfare Assistance</h1>
                <p>
                    Complete the form below to submit your service request.
                    Please provide accurate information.
                </p>
            </div>

            {success && (
                <div className="application-success">
                    <h2>Application Submitted Successfully!</h2>
                    <p>
                        Your application has been received by the MSWDO.
                    </p>

                    <div className="application-reference">
                        <span>Your Reference Number</span>
                        <strong>{success.reference_number}</strong>
                    </div>

                    <p>
                        Please save your reference number to track your
                        application.
                    </p>
                </div>
            )}

            {error && (
                <div className="application-error">
                    {error}
                </div>
            )}

            <form
                className="application-form"
                onSubmit={handleSubmit}
            >
                <h2>Applicant Information</h2>

                <div className="application-form-grid">
                    <div className="application-form-group full-width">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="applicant_name"
                            placeholder="Enter your complete name"
                            value={form.applicant_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="application-form-group">
                        <label>Contact Number</label>
                        <input
                            type="tel"
                            name="contact_number"
                            placeholder="09XXXXXXXXX"
                            value={form.contact_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="application-form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="application-form-group full-width">
                        <label>Complete Address</label>
                        <textarea
                            name="address"
                            placeholder="House number, street, barangay, municipality"
                            value={form.address}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>
                </div>

                <h2>Service Request Details</h2>

                <div className="application-form-grid">
                    <div className="application-form-group full-width">
                        <label>Select Social Welfare Service</label>

                        <select
                            name="service_id"
                            value={form.service_id}
                            onChange={handleChange}
                            required
                            disabled={loadingServices}
                        >
                            <option value="">
                                {loadingServices
                                    ? "Loading services..."
                                    : "Select a service"}
                            </option>

                            {services.map((service) => (
                                <option
                                    key={service.id}
                                    value={service.id}
                                >
                                    {service.service_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedService && (
    <div className="application-form-group full-width">
        <div className="application-service-details">

            <h3>{selectedService.service_name}</h3>

            <p>{selectedService.description}</p>

            {selectedService.requirements && (
                <div className="application-detail-card">
                    <h4>📄 Requirements</h4>
                    <ul>
                        {selectedService.requirements
                            .split(",")
                            .map((requirement, index) => (
                                <li key={index}>
                                    {requirement.trim()}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {selectedService.eligibility && (
                <div className="application-detail-card">
                    <h4>👥 Eligibility</h4>
                    <p>{selectedService.eligibility}</p>
                </div>
            )}

            {selectedService.instructions && (
                <div className="application-detail-card">
                    <h4>📋 Application Instructions</h4>
                    <p className="application-instructions">
                        {selectedService.instructions}
                    </p>
                </div>
            )}

        </div>
    </div>
)}
                    <div className="application-form-group full-width">
                        <label>Reason for Request</label>
                        <textarea
                            name="description"
                            placeholder="Explain why you are requesting assistance..."
                            value={form.description}
                            onChange={handleChange}
                            rows="5"
                            required
                        />
                    </div>
                </div>

                <div className="application-notice">
                    Please review your information before submitting.
                    The MSWDO staff will review your application.
                </div>

                <button
                    type="submit"
                    className="application-submit-button"
                    disabled={submitting || loadingServices || services.length === 0}
                >
                    {submitting
                        ? "Submitting..."
                        : "Submit Application"}
                </button>
            </form>
        </div>
    );
}

export default ServiceApplication;