import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./Reports.css";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const getPresetDates = (period) => {
    if (period === "all") return { start: "", end: "" };
    const days = Number(period) || 30;
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * DAY_IN_MS);
    return {
        start: toDateInputValue(start),
        end: toDateInputValue(end),
    };
};
const REPORT_STATUSES = [
    { key: "pending", label: "Pending", color: "#e5a528" },
    { key: "under_review", label: "Under review", color: "#8b5cf6" },
    { key: "approved", label: "Approved", color: "#0d9488" },
    { key: "rejected", label: "Rejected", color: "#e35d6a" },
    { key: "completed", label: "Completed", color: "#3478c8" },
];

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
};

const escapeCsv = (value) => {
    const text = String(value ?? "");
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
};

const getRequestDate = (request) =>
    request.submitted_at || request.created_at || request.updated_at;

const getServiceName = (request) =>
    request.service?.service_name || request.service?.name || "Unassigned";

function Reports() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataError, setDataError] = useState("");
    const [settingsError, setSettingsError] = useState("");
    const [filterError, setFilterError] = useState("");
    const [startDate, setStartDate] = useState(() => getPresetDates("30").start);
    const [endDate, setEndDate] = useState(() => getPresetDates("30").end);
    const [appliedRange, setAppliedRange] = useState(() => getPresetDates("30"));

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get("/service-requests");
            setRequests(response.data.data || []);
            setDataError("");
        } catch (err) {
            setDataError(
                err.response?.data?.message || "Unable to load report data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        api.get("/service-requests")
            .then((response) => {
                if (isCurrent) {
                    setRequests(response.data.data || []);
                    setDataError("");
                }
            })
            .catch((err) => {
                if (isCurrent) {
                    setDataError(
                        err.response?.data?.message || "Unable to load report data."
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

    useEffect(() => {
        let isCurrent = true;
        api.get("/admin/settings")
            .then((response) => {
                if (!isCurrent) return;
                const range = getPresetDates(
                    response.data.data.reports.default_period
                );
                setStartDate(range.start);
                setEndDate(range.end);
                setAppliedRange(range);
            })
            .catch((err) => {
                if (isCurrent) {
                    setSettingsError(
                        err.response?.data?.message ||
                        "Unable to load report preferences."
                    );
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const filteredRequests = useMemo(() => {
        const start = appliedRange.start
            ? new Date(`${appliedRange.start}T00:00:00`).getTime()
            : null;
        const end = appliedRange.end
            ? new Date(`${appliedRange.end}T23:59:59.999`).getTime()
            : null;

        return requests.filter((request) => {
            const requestDate = new Date(getRequestDate(request)).getTime();
            if (Number.isNaN(requestDate)) return false;
            return (start === null || requestDate >= start)
                && (end === null || requestDate <= end);
        });
    }, [requests, appliedRange]);

    const statusCounts = useMemo(
        () => REPORT_STATUSES.map((status) => ({
            ...status,
            count: filteredRequests.filter(
                (request) => request.status === status.key
            ).length,
        })),
        [filteredRequests]
    );

    const serviceCounts = useMemo(() => {
        const counts = new Map();
        filteredRequests.forEach((request) => {
            const name = getServiceName(request);
            counts.set(name, (counts.get(name) || 0) + 1);
        });
        return [...counts.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [filteredRequests]);

    const monthlyCounts = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 6 }, (_, index) => {
            const month = new Date(
                now.getFullYear(),
                now.getMonth() - (5 - index),
                1
            );
            const key = `${month.getFullYear()}-${String(
                month.getMonth() + 1
            ).padStart(2, "0")}`;
            const count = filteredRequests.filter((request) => {
                const date = new Date(getRequestDate(request));
                return !Number.isNaN(date.getTime())
                    && `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}` === key;
            }).length;
            return {
                label: month.toLocaleDateString(undefined, { month: "short" }),
                count,
            };
        });
    }, [filteredRequests]);

    const setPresetRange = (days) => {
        const range = getPresetDates(String(days));
        setStartDate(range.start);
        setEndDate(range.end);
        setAppliedRange(range);
    };

    const applyRange = (event) => {
        event.preventDefault();
        if (startDate && endDate && startDate > endDate) {
            setFilterError("Start date must be on or before the end date.");
            return;
        }
        setFilterError("");
        setAppliedRange({ start: startDate, end: endDate });
    };

    const exportCsv = () => {
        const headers = [
            "Reference number",
            "Applicant",
            "Service",
            "Status",
            "Date submitted",
        ];
        const rows = filteredRequests.map((request) => [
            request.reference_number,
            request.applicant_name,
            getServiceName(request),
            request.status?.replaceAll("_", " "),
            formatDate(getRequestDate(request)),
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsv).join(","))
            .join("\r\n");
        const url = URL.createObjectURL(
            new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `mswdo-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const maxMonthlyCount = Math.max(1, ...monthlyCounts.map(({ count }) => count));
    const maxServiceCount = Math.max(1, ...serviceCounts.map(({ count }) => count));
    const completedCount = statusCounts.find(
        (status) => status.key === "completed"
    )?.count || 0;
    const completionRate = filteredRequests.length
        ? Math.round((completedCount / filteredRequests.length) * 100)
        : 0;

    if (loading) {
        return <div className="reports-page reports-message">Loading reports...</div>;
    }

    return (
        <div className="reports-page">
            <header className="reports-header">
                <div>
                    <span className="reports-eyebrow">ADMINISTRATION / ANALYTICS</span>
                    <h1>Reports &amp; Insights</h1>
                    <p>Generate service-request reports from your portal records.</p>
                </div>
                <div className="reports-actions">
                    <button className="report-button report-button-light" onClick={fetchRequests}>
                        Refresh data
                    </button>
                    <button
                        className="report-button report-button-light"
                        onClick={() => window.print()}
                        disabled={!filteredRequests.length}
                    >
                        Export PDF
                    </button>
                    <button
                        className="report-button report-button-primary"
                        onClick={exportCsv}
                        disabled={!filteredRequests.length}
                    >
                        Export Excel (.csv)
                    </button>
                </div>
            </header>

            {(dataError || settingsError || filterError) && (
                <div className="reports-alert" role="alert">
                    <span>{[dataError, settingsError, filterError].filter(Boolean).join(" ")}</span>
                    {loading && <span>Refreshing...</span>}
                    {!loading && dataError && (
                        <button onClick={fetchRequests}>Try again</button>
                    )}
                </div>
            )}

            <form className="report-filter-panel" onSubmit={applyRange}>
                <div className="report-filter-copy">
                    <strong>Report period</strong>
                    <span>Choose a date range, then generate your report.</span>
                </div>
                <div className="report-date-fields">
                    <label>
                        From
                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                        />
                    </label>
                    <label>
                        To
                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </label>
                    <button className="report-button report-button-primary" type="submit">
                        Generate report
                    </button>
                </div>
                <div className="report-presets" aria-label="Quick date ranges">
                    <button type="button" onClick={() => setPresetRange(30)}>Last 30 days</button>
                    <button type="button" onClick={() => setPresetRange(90)}>Last 90 days</button>
                    <button type="button" onClick={() => setPresetRange(365)}>Last 12 months</button>
                    <button
                        type="button"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setAppliedRange({ start: "", end: "" });
                        }}
                    >
                        All time
                    </button>
                </div>
            </form>

            <div className="report-summary-grid">
                <article className="report-summary-card">
                    <span className="report-summary-icon report-icon-teal">▤</span>
                    <div><span>Total applications</span><strong>{filteredRequests.length}</strong></div>
                    <small>Within selected period</small>
                </article>
                <article className="report-summary-card">
                    <span className="report-summary-icon report-icon-amber">◷</span>
                    <div><span>Awaiting action</span><strong>{statusCounts[0].count + statusCounts[1].count}</strong></div>
                    <small>Pending or under review</small>
                </article>
                <article className="report-summary-card">
                    <span className="report-summary-icon report-icon-blue">✓</span>
                    <div><span>Completed</span><strong>{completedCount}</strong></div>
                    <small>{completionRate}% completion rate</small>
                </article>
                <article className="report-summary-card">
                    <span className="report-summary-icon report-icon-purple">▦</span>
                    <div><span>Services requested</span><strong>{new Set(filteredRequests.map(getServiceName)).size}</strong></div>
                    <small>Unique service types</small>
                </article>
            </div>

            <div className="report-chart-grid">
                <section className="report-panel report-trend-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Application trend</h2>
                            <p>Requests received over the last six months</p>
                        </div>
                        <span className="report-chart-legend"><i /> Applications</span>
                    </div>
                    <div className="report-month-chart" role="img" aria-label="Monthly application counts">
                        {monthlyCounts.map(({ label, count }) => (
                            <div className="report-month-column" key={label}>
                                <span className="report-bar-value">{count}</span>
                                <div className="report-month-track">
                                    <div
                                        className="report-month-bar"
                                        style={{ height: `${Math.max(3, (count / maxMonthlyCount) * 100)}%` }}
                                    />
                                </div>
                                <span className="report-month-label">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="report-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Request status</h2>
                            <p>Current breakdown for this report</p>
                        </div>
                    </div>
                    <div className="report-status-list">
                        {statusCounts.map((status) => {
                            const percent = filteredRequests.length
                                ? Math.round((status.count / filteredRequests.length) * 100)
                                : 0;
                            return (
                                <div className="report-status-row" key={status.key}>
                                    <div className="report-status-label">
                                        <span><i style={{ background: status.color }} />{status.label}</span>
                                        <strong>{status.count}<small>{percent}%</small></strong>
                                    </div>
                                    <div className="report-status-track">
                                        <div
                                            style={{
                                                width: `${percent}%`,
                                                background: status.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="report-panel report-service-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Top requested services</h2>
                            <p>Most requested services in the selected period</p>
                        </div>
                    </div>
                    {serviceCounts.length ? (
                        <div className="report-service-list">
                            {serviceCounts.map(({ name, count }) => (
                                <div className="report-service-row" key={name}>
                                    <span title={name}>{name}</span>
                                    <div className="report-service-track">
                                        <div style={{ width: `${(count / maxServiceCount) * 100}%` }} />
                                    </div>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="report-empty">No service-request data in this period.</p>
                    )}
                </section>

                <section className="report-panel report-table-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Application records</h2>
                            <p>{filteredRequests.length} records included in this report</p>
                        </div>
                    </div>
                    <div className="report-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Applicant</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Date submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request, index) => (
                                    <tr
                                        key={request.id}
                                        className={index >= 10 ? "report-extra-row" : ""}
                                    >
                                        <td className="report-reference">{request.reference_number || `#${request.id}`}</td>
                                        <td>{request.applicant_name || "—"}</td>
                                        <td>{getServiceName(request)}</td>
                                        <td>
                                            <span className={`report-status-badge report-status-${request.status || "unknown"}`}>
                                                {(request.status || "unknown").replaceAll("_", " ")}
                                            </span>
                                        </td>
                                        <td>{formatDate(getRequestDate(request))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!filteredRequests.length && (
                            <p className="report-empty">No applications found for this period.</p>
                        )}
                        {filteredRequests.length > 10 && (
                            <p className="report-table-note">
                                Showing 10 of {filteredRequests.length} records. The export includes all records.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Reports;
