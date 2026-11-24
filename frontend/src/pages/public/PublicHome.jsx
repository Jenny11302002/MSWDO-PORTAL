import { useEffect, useState } from "react";
import api from "../../api/axios";

function PublicHome({ onApply, onTrack, onUpload, onClientLogin }) {
    const [services, setServices] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [office, setOffice] = useState({
        name: "Municipal Social Welfare and Development Office",
        address: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [announcementError, setAnnouncementError] = useState("");
    const [officeError, setOfficeError] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get("/services");
                setServices(response.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load available services."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await api.get("/announcements");
                setAnnouncements(response.data.data || []);
            } catch (err) {
                setAnnouncementError(
                    err.response?.data?.message ||
                    "Unable to load current announcements."
                );
            }
        };

        fetchAnnouncements();
    }, []);

    useEffect(() => {
        const fetchOfficeProfile = async () => {
            try {
                const response = await api.get("/office-profile");
                setOffice(response.data.data);
            } catch (err) {
                setOfficeError(
                    err.response?.data?.message ||
                    "Unable to load office contact information."
                );
            }
        };

        fetchOfficeProfile();
    }, []);

    return (
        <div className="public-home">
            <nav className="public-navbar">
                <div className="public-brand">
                    <div className="public-logo">MS</div>
                    <div>
                        <h2>{office.name === "Municipal Social Welfare and Development Office" ? "MSWDO" : office.name}</h2>
                        <span>Online Services Portal</span>
                    </div>
                </div>

                <div className="public-nav-links">
                    <a href="#home">Home</a>
                    <a href="#services">Services</a>
                    <a href="#announcements">Announcements</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </div>

                <button
                    type="button"
                    className="public-login-button"
                    onClick={onClientLogin}
                >
                    Login / Sign Up
                </button>
            </nav>

            <section className="public-hero" id="home">
                <div className="public-hero-content">
                    <span className="public-eyebrow">
                        {office.name.toUpperCase()}
                    </span>

                    <h1>
                        Making public support
                        <span> accessible, clear, and efficient.</span>
                    </h1>

                    <p>
                        Apply for assistance, upload supporting documents, and
                        monitor your application status with a simple and secure
                        digital experience designed for families and clients.
                    </p>

                    <div className="public-trust-row" aria-label="Service benefits">
                        <span>Fast processing</span>
                        <span>Open access</span>
                        <span>Secure portal</span>
                    </div>

                    <div className="public-hero-actions">
                        <button
                            type="button"
                            className="public-primary-button"
                            onClick={onApply}
                        >
                            Apply for Assistance
                        </button>

                        <button
                            type="button"
                            className="public-secondary-button"
                            onClick={onTrack}
                        >
                            Track Application
                        </button>

                        <button
                            type="button"
                            className="public-secondary-button"
                            onClick={onUpload}
                        >
                            Upload Requirements
                        </button>

                        <a href="#services" className="public-secondary-button">
                            Explore Services
                        </a>
                    </div>
                </div>

                <div className="public-hero-card">
                    <div className="public-hero-icon">♥</div>
                    <h2>Serbisyo para sa Lahat</h2>
                    <p>
                        Dedicated to providing accessible and responsive
                        social welfare services to every individual and family.
                    </p>
                    <div className="public-card-line"></div>
                    <div className="public-hero-metrics">
                        <div>
                            <strong>24/7</strong>
                            <span>Digital access</span>
                        </div>
                        <div>
                            <strong>1 Portal</strong>
                            <span>All services</span>
                        </div>
                    </div>
                    <span>MSWDO Online Service Portal</span>
                </div>
            </section>

            <section className="public-metrics-section" aria-label="Portal highlights">
                <div className="public-metric-card">
                    <strong>5+</strong>
                    <span>Available service programs</span>
                </div>
                <div className="public-metric-card">
                    <strong>100%</strong>
                    <span>Online application support</span>
                </div>
                <div className="public-metric-card">
                    <strong>Guided</strong>
                    <span>Application tracking</span>
                </div>
            </section>

            <section className="public-steps-section">
                <div className="public-section-heading">
                    <span>HOW IT WORKS</span>
                    <h2>Simple steps to get the support you need</h2>
                </div>

                <div className="public-steps-grid">
                    <article className="public-step-card">
                        <div className="public-step-number">01</div>
                        <h3>Choose a service</h3>
                        <p>Browse the social welfare options available to families and individuals.</p>
                    </article>
                    <article className="public-step-card">
                        <div className="public-step-number">02</div>
                        <h3>Submit your request</h3>
                        <p>Fill out your application form and upload the necessary requirements.</p>
                    </article>
                    <article className="public-step-card">
                        <div className="public-step-number">03</div>
                        <h3>Track progress</h3>
                        <p>Monitor your request updates and stay informed through the portal.</p>
                    </article>
                </div>
            </section>

            <section className="public-services-section" id="services">
                <div className="public-section-heading">
                    <span>OUR SERVICES</span>
                    <h2>Available Social Welfare Services</h2>
                    <p>
                        Explore the services offered by the Municipal Social
                        Welfare and Development Office.
                    </p>
                </div>

                {loading ? (
                    <p className="public-loading">Loading services...</p>
                ) : error ? (
                    <p className="public-error">{error}</p>
                ) : services.filter((service) => service.is_active).length === 0 ? (
                    <p className="public-loading">
                        No services are currently available.
                    </p>
                ) : (
                    <div className="public-services-grid">
                        {services
                            .filter((service) => service.is_active)
                            .map((service) => (
                                <div className="public-service-card" key={service.id}>
                                    <div className="public-service-icon">✦</div>

                                    <h3>{service.service_name}</h3>

                                    <p>
                                        {service.description ||
                                            "Contact the MSWDO office for more information."}
                                    </p>

                                    <div className="public-requirements">
                                        <strong>Requirements</strong>
                                        <p>
                                            {service.requirements ||
                                                "Please contact the MSWDO office."}
                                        </p>
                                    </div>
                                    {service.eligibility && (
                                        <div className="public-requirements">
                                            <strong>Eligibility</strong>
                                            <p>{service.eligibility}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </section>

            <section className="public-announcements-section" id="announcements">
                <div className="public-section-heading">
                    <span>MSWDO UPDATES</span>
                    <h2>Announcements</h2>
                    <p>Office updates and notices for our clients.</p>
                </div>
                {announcements.length ? (
                    <div className="public-announcements-grid">
                        {announcements.map((announcement) => (
                            <article className="public-announcement-card" key={announcement.id}>
                                <span className="public-announcement-date">
                                    {announcement.published_at
                                        ? new Date(announcement.published_at).toLocaleDateString()
                                        : "MSWDO NOTICE"}
                                </span>
                                <h3>{announcement.title}</h3>
                                <p>{announcement.content}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="public-loading">No announcements at this time.</p>
                )}
                {announcementError && (
                    <p className="public-error">{announcementError}</p>
                )}
            </section>

            <section className="public-about-section" id="about">
                <div>
                    <span>ABOUT MSWDO</span>
                    <h2>Committed to helping families and communities thrive.</h2>
                </div>

                <p>
                    The Municipal Social Welfare and Development Office provides
                    programs and assistance to individuals and families who need
                    support. Our digital portal is designed to make access to
                    services, application updates, and office communication more
                    transparent and user-friendly.
                </p>
            </section>

            <section className="public-contact-section" id="contact">
                <h2>Need Assistance?</h2>
                <p>
                    Visit or contact {office.name} for inquiries, document concerns,
                    and further assistance.
                </p>
                {(office.address || office.email || office.phone) && (
                    <div className="public-contact-details">
                        {office.address && <span>{office.address}</span>}
                        {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
                        {office.phone && <a href={`tel:${office.phone}`}>{office.phone}</a>}
                    </div>
                )}
                {officeError && <p className="public-error">{officeError}</p>}
            </section>

            <footer className="public-footer">
                <strong>{office.name} Online Services Portal</strong>
                <span>© 2026 {office.name}</span>
            </footer>
        </div>
    );
}

export default PublicHome;