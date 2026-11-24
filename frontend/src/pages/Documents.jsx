
import { useEffect, useState } from "react";
import api from "../api/axios";

function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await api.get("/staff/documents");
                const allDocuments = (response.data.data || []).map((document) => ({
                        ...document,
                        applicant_name: document.service_request?.applicant_name,
                        reference_number: document.service_request?.reference_number,
                        request_id: document.service_request_id,
                    }));

                setDocuments(allDocuments);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load documents."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter((document) => {
        const keyword = search.toLowerCase();

        return (
            document.document_name?.toLowerCase().includes(keyword) ||
            document.original_name?.toLowerCase().includes(keyword) ||
            document.applicant_name?.toLowerCase().includes(keyword) ||
            document.reference_number?.toLowerCase().includes(keyword)
        );
    });

    const formatFileSize = (bytes) => {
        if (!bytes) return "N/A";
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="documents-page">
            <div className="documents-header">
                <div>
                    <h1>Documents Management</h1>
                    <p>View and manage applicant supporting documents.</p>
                </div>

                <div className="document-count">
                    {documents.length} Total Documents
                </div>
            </div>

            <div className="documents-panel">
                <div className="documents-toolbar">
                    <input
                        type="text"
                        placeholder="Search document, applicant, or reference number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="documents-message">
                        Loading documents...
                    </p>
                ) : error ? (
                    <p className="documents-message error-message">
                        {error}
                    </p>
                ) : filteredDocuments.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Original File</th>
                                    <th>Applicant</th>
                                    <th>Reference No.</th>
                                    <th>File Size</th>
                                    <th>Date Uploaded</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDocuments.map((document) => (
                                    <tr key={document.id}>
                                        <td>{document.document_name || "N/A"}</td>
                                        <td>{document.original_name || "N/A"}</td>
                                        <td>{document.applicant_name || "N/A"}</td>
                                        <td>{document.reference_number || "N/A"}</td>
                                        <td>{formatFileSize(document.file_size)}</td>
                                        <td>
                                            {document.created_at
                                                ? new Date(
                                                    document.created_at
                                                ).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        
<td>
    <div className="document-actions">
        <button
            className="view-document-button"
            onClick={async () => {
                const previewWindow = window.open("", "_blank");

                if (!previewWindow) {
                    alert("Please allow pop-ups to preview documents.");
                    return;
                }

                try {
                    const response = await api.get(
                        `/documents/${document.id}/view`,
                        { responseType: "blob" }
                    );

                    const fileURL = window.URL.createObjectURL(
                        new Blob([response.data], {
                            type: response.headers["content-type"],
                        })
                    );

                    previewWindow.location.href = fileURL;
                } catch {
                    previewWindow.close();
                    alert("Unable to preview document.");
                }
            }}
        >
            View
        </button>

        <button
            className="download-document-button"
            onClick={async () => {
                try {
                    const response = await api.get(
                        `/documents/${document.id}/download`,
                        { responseType: "blob" }
                    );

                    const url = window.URL.createObjectURL(
                        new Blob([response.data])
                    );

                    const link = window.document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", document.original_name);

                    window.document.body.appendChild(link);
                    link.click();
                    link.remove();

                    window.URL.revokeObjectURL(url);
                } catch {
                    alert("Unable to download document.");
                }
            }}
        >
            Download
        </button>
    </div>
</td>

                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="documents-message">
                        No uploaded documents found.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Documents;
