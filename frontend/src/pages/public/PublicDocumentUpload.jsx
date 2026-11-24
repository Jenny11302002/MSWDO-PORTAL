
import { useState } from "react";
import api from "../../api/axios";

function PublicDocumentUpload() {
    const [referenceNumber, setReferenceNumber] = useState("");
    const [documents, setDocuments] = useState([
        { documentName: "", file: null },
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const documentTypes = [
        "Valid ID",
        "Barangay Certificate",
        "Certificate of Indigency",
        "Other Supporting Document",
    ];

    const updateDocument = (index, field, value) => {
        setDocuments((previous) =>
            previous.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const addDocument = () => {
        if (documents.length >= 10) {
            setError("You can upload a maximum of 10 documents.");
            return;
        }

        setError("");
        setDocuments((previous) => [
            ...previous,
            { documentName: "", file: null },
        ]);
    };

    const removeDocument = (index) => {
        setDocuments((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        const formData = new FormData();
        formData.append("reference_number", referenceNumber.trim());

        documents.forEach((item, index) => {
            formData.append(
                `documents[${index}][document_name]`,
                item.documentName
            );

            formData.append(
                `documents[${index}][document]`,
                item.file
            );
        });

        try {
            const response = await api.post(
                "/public-upload-document",
                formData
            );

            setMessage(response.data.message);
            setReferenceNumber("");
            setDocuments([{ documentName: "", file: null }]);
        } catch (err) {
            const errors = err.response?.data?.errors;

            setError(
                errors
                    ? Object.values(errors).flat().join(" ")
                    : err.response?.data?.message ||
                      "Unable to upload documents."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="public-upload-page">
            <div className="public-upload-container">
                <span className="public-upload-label">
                    MSWDO ONLINE SERVICES
                </span>

                <h1>Upload Requirements</h1>

                <p>
                    Submit all supporting documents required for your
                    social welfare assistance application.
                </p>

                <form onSubmit={handleUpload}>
                    <label>Application Reference Number</label>

                    <input
                        type="text"
                        placeholder="Enter your application reference number"
                        value={referenceNumber}
                        onChange={(e) =>
                            setReferenceNumber(e.target.value)
                        }
                        required
                    />

                    <div className="public-upload-section-heading">
                        <strong>Supporting Documents</strong>
                        <span>{documents.length}/10 files</span>
                    </div>

                    {documents.map((item, index) => (
                        <div
                            className="public-document-entry"
                            key={index}
                        >
                            <div className="public-document-entry-header">
                                <strong>Document {index + 1}</strong>

                                {documents.length > 1 && (
                                    <button
                                        type="button"
                                        className="public-remove-document"
                                        onClick={() =>
                                            removeDocument(index)
                                        }
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <label>Document Type</label>

                            <select
                                value={item.documentName}
                                onChange={(e) =>
                                    updateDocument(
                                        index,
                                        "documentName",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Select document type
                                </option>

                                {documentTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            <label>Select Document File</label>

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    updateDocument(
                                        index,
                                        "file",
                                        e.target.files[0] || null
                                    )
                                }
                                required
                            />

                            <small>
                                PDF, JPG, JPEG, PNG. Maximum 5 MB.
                            </small>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="public-add-document"
                        onClick={addDocument}
                        disabled={loading || documents.length >= 10}
                    >
                        + Add Another Document
                    </button>

                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Uploading Documents..."
                            : "Upload All Documents"}
                    </button>
                </form>

                {message && (
                    <div className="public-upload-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="public-upload-error">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicDocumentUpload;
