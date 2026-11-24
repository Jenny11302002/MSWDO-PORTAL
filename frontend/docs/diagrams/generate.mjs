import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
mkdirSync(outDir, { recursive: true });

const C = {
  ink: "#17343B",
  muted: "#587178",
  teal: "#087E78",
  green: "#4F9B73",
  gold: "#C58B2B",
  red: "#B95050",
  blue: "#477B9E",
  bg: "#F4F8F7",
  border: "#D5E2DF",
  paleTeal: "#E6F4F1",
  paleBlue: "#EAF2F8",
  paleGold: "#FFF4DD",
  paleRed: "#FCECEC",
  white: "#FFFFFF",
};

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const t = (x, y, value, size = 16, fill = C.ink, weight = 400, anchor = "start") => {
  const rows = Array.isArray(value) ? value : [value];
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${rows.map((r, i) => `<tspan x="${x}" dy="${i ? size * 1.35 : 0}">${esc(r)}</tspan>`).join("")}</text>`;
};
const rect = (x, y, w, h, fill = C.white, stroke = C.border, rx = 16, sw = 2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const line = (x1, y1, x2, y2, color = C.muted, width = 2, dash = false, arrow = true) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="7 7"' : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`;
const path = (d, color = C.muted, width = 2, dash = false, arrow = true) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="7 7"' : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`;
const label = (x, y, value, fill = C.muted, size = 12) => t(x, y, value, size, fill, 600, "middle");
const pill = (x, y, value, fill = C.paleTeal, fg = C.teal) => {
  const w = Math.max(74, String(value).length * 7.3 + 24);
  return `${rect(x, y, w, 28, fill, fill, 14, 0)}${t(x + w / 2, y + 19, value, 12, fg, 700, "middle")}`;
};
const card = (x, y, w, h, title, rows = [], color = C.teal, fill = C.white, opts = {}) => {
  const headerH = opts.headerH ?? 42;
  return `${rect(x, y, w, h, fill, opts.stroke ?? C.border, opts.rx ?? 14)}
    <path d="M${x + 1} ${y + headerH} H${x + w - 1}" stroke="${C.border}" stroke-width="1.5"/>
    ${rect(x, y, w, headerH, color, color, opts.rx ?? 14, 0)}
    <path d="M${x} ${y + headerH - 12} H${x + w} V${y + headerH} H${x} Z" fill="${color}"/>
    ${t(x + 16, y + 27, title, opts.titleSize ?? 16, C.white, 700)}
    ${t(x + 16, y + headerH + 25, rows, opts.rowSize ?? 13, C.ink, 450)}`;
};
const ellipse = (cx, cy, rx, ry, title, fill = C.paleTeal, stroke = C.teal) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${t(cx, cy + 5, title, 13, C.ink, 650, "middle")}`;
const actor = (x, y, title, color = C.ink) =>
  `<circle cx="${x}" cy="${y}" r="11" fill="${C.white}" stroke="${color}" stroke-width="2.5"/>
  <path d="M${x} ${y + 11} V${y + 45} M${x - 19} ${y + 25} H${x + 19} M${x} ${y + 45} L${x - 15} ${y + 65} M${x} ${y + 45} L${x + 15} ${y + 65}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  ${t(x, y + 88, title, 13, color, 650, "middle")}`;
const classCard = (x, y, w, h, name, fields, color = C.teal) =>
  `${rect(x, y, w, h, C.white, C.border, 10)}
  <path d="M${x} ${y + 37} H${x + w}" stroke="${color}" stroke-width="4"/>
  ${t(x + w / 2, y + 25, name, 15, C.ink, 700, "middle")}
  ${t(x + 12, y + 58, fields, 12, C.muted, 450)}`;
const note = (x, y, w, h, rows) =>
  `${rect(x, y, w, h, C.paleGold, "#E8CD91", 10, 1.5)}${t(x + 14, y + 24, rows, 12, C.ink, 500)}`;

function frame(title, category, subtitle, body, number) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)} — MSWDO Online Service Portal</title><desc id="desc">${esc(subtitle)}</desc>
<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${C.muted}"/></marker></defs>
<rect width="1440" height="900" fill="${C.bg}"/>
<rect x="0" y="0" width="1440" height="9" fill="${C.teal}"/>
${t(64, 43, `MSWDO ONLINE SERVICE PORTAL  /  ${category.toUpperCase()}`, 12, C.teal, 750)}
${t(64, 91, title, 31, C.ink, 750)}
${t(64, 121, subtitle, 15, C.muted, 450)}
<rect x="1288" y="45" width="88" height="34" rx="17" fill="${C.paleTeal}"/>
${t(1332, 67, `${String(number).padStart(2, "0")} / 17`, 13, C.teal, 700, "middle")}
${body}
<path d="M64 852 H1376" stroke="${C.border}" stroke-width="1.5"/>
${t(64, 879, "MSWDO Online Service Portal  •  Vector diagram  •  Based on the current application and Docker configuration", 12, C.muted, 450)}
</svg>`;
}

const diagrams = [];
const add = (file, title, category, subtitle, body) => diagrams.push({
  file,
  title,
  category,
  subtitle,
  svg: frame(title, category, subtitle, body, diagrams.length + 1),
});

add("01-system-architecture.svg", "System Architecture", "Structural blueprint", "Browser clients reach the React portal, which calls the Laravel API; the API uses MySQL and private document storage.", `
${rect(78, 162, 1284, 614, "#EDF5F3", "#BED4CF", 20, 2)}
${pill(98, 176, "DOCKER COMPOSE ENVIRONMENT", C.white, C.teal)}
${card(112, 256, 220, 136, "Public applicant", ["Browse services", "Apply • upload • track"], C.blue, C.white)}
${card(112, 494, 220, 136, "Client / staff browser", ["Client portal", "Staff & admin workspace"], C.blue, C.white)}
${card(420, 348, 260, 182, "React + Vite frontend", ["Public pages and portal UI", "Staff dashboard modules", "Axios → /api", "Container port 5173"], C.teal)}
${card(784, 348, 250, 182, "Laravel API", ["REST endpoints", "Validation & business rules", "Sanctum + role middleware", "Container port 8000"], C.green)}
${card(1130, 250, 190, 150, "MySQL 8", ["Users, services,", "requests, documents,", "appointments, settings"], C.blue)}
${card(1130, 474, 190, 132, "Private file storage", ["Request document files", "Backend local disk"], C.gold)}
${line(332, 322, 420, 396, C.blue)}
${line(332, 560, 420, 462, C.blue)}
${line(680, 439, 784, 439, C.teal)}
${label(732, 420, "HTTP / JSON", C.teal)}
${line(1034, 388, 1130, 330, C.blue)}
${label(1082, 340, "SQL", C.blue)}
${line(1034, 478, 1130, 530, C.gold)}
${label(1081, 517, "documents", C.gold)}
${note(786, 584, 248, 92, ["Auth tokens are sent in the", "Authorization header.", "No external cloud service shown."])}
${card(105, 680, 1215, 58, "Operational note", ["Compose maps MySQL to a persistent named volume; Vite is configured as a development server in the checked-in setup."], C.ink, C.white, { headerH: 32, rowSize: 12, titleSize: 13 })}
`);

add("02-class-diagram.svg", "Class Diagram", "Structural blueprint", "Core Laravel entities and their implemented associations; the database is the source of truth for persisted records.", `
${classCard(84, 204, 256, 180, "User", ["id, name, email, password", "role, permissions, is_active", "contact_number, address", "+ serviceRequests()"], C.blue)}
${classCard(438, 175, 250, 150, "Service", ["id, service_name", "description, requirements", "is_active"], C.teal)}
${classCard(814, 204, 310, 226, "ServiceRequest", ["id, reference_number", "service_id, user_id?", "applicant_name, contact_number", "status, remarks, submitted_at", "+ service(), user()", "+ documents(), appointments()"], C.green)}
${classCard(1190, 190, 210, 170, "RequestDocument", ["id, service_request_id", "document_name, original_name", "file_path, mime_type", "file_size"], C.gold)}
${classCard(850, 562, 266, 176, "Appointment", ["id, service_request_id", "appointment_date, time", "location, purpose", "status, remarks"], C.blue)}
${classCard(412, 554, 280, 172, "Announcement", ["id, user_id?", "title, content", "is_published, published_at"], C.teal)}
${classCard(86, 548, 242, 146, "SystemSetting", ["id, settings (JSON)"], C.ink)}
${line(340, 278, 438, 250, C.muted)}
${label(387, 246, "1  serves  *")}
${line(688, 250, 814, 286, C.muted)}
${label(750, 250, "1          *")}
${path("M340 306 H394 V640 H412", C.muted, 1.7, true)}
${label(394, 624, "author")}
${line(1124, 287, 1190, 270, C.muted)}
${label(1157, 250, "1   *")}
${line(958, 430, 978, 562, C.muted)}
${label(1014, 505, "1 request has many appointments")}
${path("M212 384 V458 H900 V430", C.muted, 1.7, true)}
${label(564, 451, "0..1 user account per request (guest submissions allowed)")}
${path("M340 350 V478 H820 V332", C.muted, 1.7, true)}
${note(90, 758, 570, 58, ["Status enum: pending • under_review • approved • rejected • completed."])}
${note(684, 758, 660, 58, ["Document rows reference files stored on the backend local disk; SystemSetting has no domain relation."])}
`);

add("03-component-diagram.svg", "Component Diagram", "Structural blueprint", "Logical modules and dependencies in the current React + Laravel application; lines indicate calls or data dependencies.", `
${rect(90, 174, 600, 580, "#F9FCFB", C.border, 18)}
${pill(112, 188, "REACT FRONTEND")}
${card(126, 248, 238, 128, "Public experience", ["Home • service application", "Tracking • document upload"], C.blue)}
${card(410, 248, 238, 128, "Client portal", ["Auth • profile", "My service requests"], C.teal)}
${card(126, 434, 238, 160, "Staff workspace", ["Dashboard • requests", "Services • documents", "Tracking • appointments"], C.green)}
${card(410, 434, 238, 160, "Admin workspace", ["Clients • staff users", "Announcements • reports", "System settings"], C.gold)}
${card(278, 644, 238, 78, "Axios API client", ["Bearer token interceptor"], C.ink, C.white, { headerH: 34, rowSize: 12 })}
${rect(750, 174, 600, 580, "#F9FCFB", C.border, 18)}
${pill(772, 188, "LARAVEL BACKEND")}
${card(786, 248, 238, 128, "API routes", ["Public • client • staff", "Admin route groups"], C.blue)}
${card(1070, 248, 238, 128, "Auth & permissions", ["Sanctum tokens", "Client / staff / admin"], C.teal)}
${card(786, 434, 238, 160, "Controllers", ["Services • requests", "Documents • tracking", "Appointments • admin"], C.green)}
${card(1070, 434, 238, 160, "Eloquent models", ["User • Service • Request", "Document • Appointment", "Announcement • Settings"], C.gold)}
${card(928, 644, 238, 78, "Persistence adapters", ["MySQL + local file disk"], C.ink, C.white, { headerH: 34, rowSize: 12 })}
${path("M364 310 H410", C.muted)}
${path("M364 512 H410", C.muted)}
${path("M530 376 V434", C.muted)}
${path("M530 594 V644", C.muted)}
${path("M690 682 H748", C.teal)}
${path("M1024 310 H1070", C.muted)}
${path("M1024 512 H1070", C.muted)}
${path("M1190 376 V434", C.muted)}
${path("M1190 594 V644", C.muted)}
${path("M1047 376 V404 H905 V434", C.muted)}
${label(718, 663, "REST / JSON", C.teal)}
`);

add("04-deployment-diagram.svg", "Deployment Diagram", "Structural blueprint", "Container and port assignments taken from docker-compose.yml; no production hosting target is declared in the repository.", `
${card(94, 290, 230, 160, "Applicant device", ["Web browser", "Public pages / client portal"], C.blue)}
${card(94, 536, 230, 142, "Staff device", ["Web browser", "Admin and staff modules"], C.blue)}
${rect(390, 188, 914, 550, "#EDF5F3", "#BED4CF", 20)}
${pill(414, 204, "DOCKER BRIDGE NETWORK  •  mswdo-network", C.white, C.teal)}
${card(450, 286, 244, 154, "frontend container", ["React + Vite dev server", "Host :5173 → container :5173", "API proxy → backend:8000"], C.teal)}
${card(786, 286, 244, 154, "backend container", ["Laravel / PHP API", "Host :8000 → container :8000", "Storage bind mount"], C.green)}
${card(1090, 286, 182, 154, "mysql container", ["MySQL 8.0", "Container port :3306", "Persistent named volume"], C.blue)}
${card(786, 512, 244, 120, "Private uploads", ["./backend/storage", "Mounted at /var/www/storage"], C.gold)}
${card(1090, 512, 182, 120, "phpMyAdmin", ["Support tool", "Host :8085 → :80"], C.ink)}
${line(324, 348, 450, 348, C.blue)}
${line(324, 594, 450, 404, C.blue)}
${line(694, 363, 786, 363, C.teal)}
${label(740, 344, "proxy / HTTP", C.teal)}
${line(1030, 363, 1090, 363, C.blue)}
${label(1060, 345, "SQL", C.blue)}
${path("M908 440 V512", C.gold)}
${path("M1180 440 V512", C.muted)}
${note(458, 674, 790, 42, ["Deployment view reflects local Docker configuration, not an asserted production topology."])}
`);

add("05-object-diagram.svg", "Object Diagram", "Structural blueprint", "Illustrative runtime snapshot: one sample request connected to its service, applicant, document, appointment, and staff author.", `
${pill(96, 176, "EXAMPLE SNAPSHOT  •  SAMPLE DATA ONLY", C.paleGold, C.gold)}
${card(106, 282, 250, 148, "applicant:User", ["name = Sample Applicant", "role = client", "is_active = true"], C.blue)}
${card(430, 220, 260, 132, "service:Service", ["service_name = Social Assistance", "is_active = true"], C.teal)}
${card(796, 282, 300, 180, "request:ServiceRequest", ["reference_number = MSWDO-A1B2C3D4E5", "status = under_review", "applicant_name = Sample Applicant", "submitted_at = 2026-11-10"], C.green)}
${card(1170, 250, 202, 156, "document:RequestDocument", ["document_name = Valid ID", "mime_type = image/jpeg", "file_size = 240000"], C.gold)}
${card(820, 568, 260, 142, "appointment:Appointment", ["status = scheduled", "location = MSWDO Office", "appointment_date = 2026-11-18"], C.blue)}
${card(430, 574, 260, 126, "reviewer:User", ["name = Sample Staff", "role = staff"], C.ink)}
${line(356, 350, 796, 360)}
${label(570, 336, "user_id")}
${line(690, 286, 796, 320)}
${label(744, 284, "service_id")}
${line(1096, 354, 1170, 330)}
${label(1133, 322, "request_id")}
${line(948, 462, 948, 568)}
${label(1016, 526, "service_request_id")}
${path("M690 620 H750 V422 H796", C.muted, 1.8, true)}
${label(728, 602, "staff updates status")}
${note(112, 690, 264, 70, ["Illustrative instance values only;", "not data read from a live database."])}
`);

add("06-package-diagram.svg", "Package Diagram", "Structural blueprint", "Code organization inferred from the checked-in frontend, Laravel routes, controllers, models, and database layers.", `
${card(100, 222, 360, 170, "«package» frontend.pages.public", ["PublicHome", "ServiceApplication", "PublicTracking", "PublicDocumentUpload", "ClientAuth"], C.blue)}
${card(100, 468, 360, 170, "«package» frontend.pages.portal", ["ClientPortal", "StaffDashboard", "ServiceRequests", "Appointments", "AdminSettings"], C.teal)}
${card(552, 346, 330, 144, "«package» frontend.api", ["axios.js", "Base URL: /api", "Bearer token interceptor"], C.ink)}
${card(976, 210, 360, 170, "«package» backend.routes", ["routes/api.php", "Public routes", "Client / staff / admin groups"], C.blue)}
${card(976, 438, 360, 170, "«package» backend.controllers", ["ServiceRequestController", "TrackingController", "RequestDocumentController", "Admin controllers"], C.green)}
${card(552, 588, 330, 144, "«package» backend.models + data", ["Eloquent models", "Migrations → MySQL", "storage/app private files"], C.gold)}
${path("M460 307 H552 V390", C.muted)}
${path("M460 550 H552 V462", C.muted)}
${path("M882 418 H976", C.teal)}
${path("M1156 380 V438", C.muted)}
${path("M976 522 H882 V650", C.muted)}
${path("M716 490 V588", C.muted)}
${label(511, 296, "uses")}
${label(922, 402, "HTTP API")}
${label(1158, 411, "dispatches")}
${label(917, 513, "queries / updates")}
`);

add("07-composite-structure.svg", "Composite Structure Diagram", "Structural blueprint", "Internal parts and ports for the service-request processing capability, from the API boundary to persisted request data.", `
${rect(130, 196, 1180, 552, "#F9FCFB", C.teal, 24, 3)}
${t(160, 232, "«subsystem» Service Request Processing", 21, C.teal, 750)}
${pill(176, 274, "provided port: POST /api/service-requests")}
${pill(966, 274, "provided port: staff status update", C.paleBlue, C.blue)}
${card(176, 370, 220, 142, "Request endpoint", ["Public / client route", "JSON or multipart input"], C.blue)}
${card(456, 370, 220, 142, "Validation", ["Required service", "Applicant/contact fields", "File rules on upload"], C.teal)}
${card(736, 370, 240, 142, "Request controller", ["Create reference number", "Set pending + timestamp", "Associate signed-in user"], C.green)}
${card(1036, 350, 220, 142, "ServiceRequest model", ["Persist request fields", "Relate service / user", "Load child records"], C.gold)}
${card(1036, 562, 220, 112, "MySQL", ["services • users", "service_requests"], C.blue)}
${card(736, 562, 240, 112, "Document adapter", ["Laravel local disk", "request-documents/{id}"], C.ink)}
${path("M396 440 H456", C.muted)}
${path("M676 440 H736", C.muted)}
${path("M976 440 H1036", C.muted)}
${path("M1146 492 V562", C.muted)}
${path("M856 512 V562", C.gold)}
${path("M1036 617 H976", C.muted)}
${path("M286 274 V350", C.teal)}
${path("M1074 274 V332 H1146 V350", C.blue)}
${label(426, 424, "request data")}
${label(706, 424, "validated payload")}
${label(1007, 424, "create / update")}
${note(184, 580, 450, 92, ["Multipart document input is optional and handled", "through the public upload or staff document route."])}
`);

add("08-profile-diagram.svg", "Profile Diagram", "Structural blueprint", "A proposed MSWDO UML profile showing domain-specific stereotypes and tagged values applied to real portal concepts.", `
${card(98, 224, 372, 206, "«profile» MSWDO Portal", ["Extends UML Class, Component,", "Actor, and Artifact metaclasses", "Stereotypes: «portalActor»,", "«apiBoundary», «domainRecord»,", "«secureFile», «persistentStore»"], C.ink)}
${card(532, 196, 370, 148, "«portalActor» Applicant", ["tag: access = public / client", "tag: canTrack = reference number"], C.blue)}
${card(532, 382, 370, 148, "«apiBoundary» Service API", ["tag: framework = Laravel", "tag: auth = Sanctum where protected"], C.teal)}
${card(532, 568, 370, 148, "«domainRecord» ServiceRequest", ["tag: key = reference_number", "tag: status = five persisted values"], C.green)}
${card(982, 276, 350, 148, "«secureFile» RequestDocument", ["tag: allowed = PDF / JPG / PNG", "tag: maxUpload = 5 MB per file"], C.gold)}
${card(982, 494, 350, 148, "«persistentStore» MySQL", ["tag: engine = MySQL 8", "tag: persistence = Docker volume"], C.blue)}
${path("M470 320 H532", C.muted, 1.8, true)}
${path("M470 342 H500 V456 H532", C.muted, 1.8, true)}
${path("M470 366 H510 V642 H532", C.muted, 1.8, true)}
${path("M902 456 H942 V350 H982", C.muted, 1.8, true)}
${path("M902 642 H942 V568 H982", C.muted, 1.8, true)}
${label(505, 310, "«extends»", C.muted)}
${note(100, 536, 372, 100, ["Profile is a documentation convention", "for this exercise; it is not installed", "as a UML tool extension."])}
`);

add("09-data-flow-diagram.svg", "Data Flow Diagram (Level 1)", "Behavioral blueprint", "Data flow for submitting, reviewing, tracking, and uploading documents for an MSWDO service request.", `
${actor(100, 280, "Applicant", C.blue)}
${actor(100, 580, "Staff", C.blue)}
${card(228, 224, 228, 126, "1. Browse / submit", ["Service choice + applicant", "details"], C.blue)}
${card(526, 224, 228, 126, "2. Validate & create", ["Check fields and service", "Assign reference + pending"], C.teal)}
${card(852, 224, 228, 126, "3. Review request", ["Staff reads record", "Updates status / remarks"], C.green)}
${card(852, 530, 228, 126, "4. Track request", ["Lookup reference number", "Return status + documents"], C.gold)}
${card(526, 530, 228, 126, "5. Upload documents", ["Validate file type / size", "Write file + metadata"], C.ink)}
${card(1162, 244, 192, 154, "D1 • MySQL", ["users, services", "service_requests", "appointments", "document metadata"], C.blue)}
${card(1162, 532, 192, 126, "D2 • Local disk", ["request-documents/{id}", "PDF / JPG / PNG"], C.gold)}
${path("M150 304 H228", C.blue)}
${path("M456 285 H526", C.teal)}
${path("M754 285 H852", C.green)}
${path("M1080 286 H1162", C.blue)}
${path("M456 330 H490 V570 H526", C.gold)}
${path("M754 592 H852 V370 H852", C.muted)}
${path("M1080 592 H1162", C.gold)}
${path("M1162 340 H1108 V584 H1080", C.muted, 1.8, true)}
${path("M852 602 H810 V342 H754", C.muted, 1.8, true)}
${path("M228 285 H190 V580 H150", C.blue, 1.8, true)}
${label(490, 269, "form fields")}
${label(805, 268, "reference + request")}
${label(1120, 270, "persist")}
${label(1119, 580, "file bytes")}
${label(805, 575, "uploaded file")}
${note(230, 704, 840, 64, ["Guest submissions are allowed; client accounts are optional. Tracking uses the request reference number."])}
`);

add("10-use-case-diagram.svg", "Use Case Diagram", "Behavioral blueprint", "Actors and goals supported by the portal. This is the primary scope diagram for applicants, clients, staff, and administrators.", `
${actor(114, 300, "Applicant", C.blue)}
${actor(114, 584, "Client", C.blue)}
${rect(310, 174, 920, 600, C.white, C.teal, 24, 2.5)}
${t(342, 210, "MSWDO ONLINE SERVICE PORTAL", 16, C.teal, 750)}
${ellipse(520, 286, 132, 38, "Browse services")}
${ellipse(520, 386, 132, 38, "Submit service request")}
${ellipse(520, 486, 132, 38, "Upload documents")}
${ellipse(520, 586, 132, 38, "Track by reference")}
${ellipse(850, 286, 130, 38, "Manage requests")}
${ellipse(850, 386, 130, 38, "Manage services")}
${ellipse(850, 486, 130, 38, "Manage appointments")}
${ellipse(850, 586, 130, 38, "View documents")}
${ellipse(1080, 286, 122, 38, "Manage users")}
${ellipse(1080, 386, 122, 38, "Publish announcements")}
${ellipse(1080, 486, 122, 38, "Configure settings")}
${ellipse(1080, 586, 122, 38, "View reports")}
${actor(1330, 348, "Staff", C.blue)}
${actor(1330, 620, "Administrator", C.gold)}
${path("M134 326 H330 V286 H388", C.blue, 1.7)}
${path("M134 326 H350 V386 H388", C.blue, 1.7)}
${path("M134 326 H368 V486 H388", C.blue, 1.7)}
${path("M134 326 H352 V586 H388", C.blue, 1.7)}
${path("M134 610 H332 V386 H388", C.teal, 1.7)}
${path("M134 610 H352 V486 H388", C.teal, 1.7)}
${path("M134 610 H368 V586 H388", C.teal, 1.7)}
${path("M1298 374 H1118 V286 H980", C.blue, 1.7)}
${path("M1298 374 H1120 V386 H980", C.blue, 1.7)}
${path("M1298 374 H1100 V486 H980", C.blue, 1.7)}
${path("M1298 374 H1100 V586 H980", C.blue, 1.7)}
${path("M1298 646 H1210 V286 H1202", C.gold, 1.7)}
${path("M1298 646 H1222 V386 H1202", C.gold, 1.7)}
${path("M1298 646 H1202 V486", C.gold, 1.7)}
${path("M1298 646 H1194 V586 H1202", C.gold, 1.7)}
`);

add("11-activity-diagram.svg", "Activity Diagram", "Behavioral blueprint", "Applicant service-request scenario: validate the form, create the pending record, return a reference, then optionally upload supporting files.", `
${pill(102, 178, "APPLICANT LANE")}
${pill(504, 178, "PORTAL / API LANE", C.paleBlue, C.blue)}
${pill(1020, 178, "OPTIONAL DOCUMENT LANE", C.paleGold, C.gold)}
${path("M408 196 V768", C.border, 1.5, false, false)}
${path("M938 196 V768", C.border, 1.5, false, false)}
<circle cx="250" cy="250" r="15" fill="${C.ink}"/>
${card(140, 294, 220, 80, "Choose service", ["Enter applicant details"], C.blue, C.white, { headerH: 32, rowSize: 12, titleSize: 13 })}
${card(140, 420, 220, 80, "Submit application", ["POST /service-requests"], C.blue, C.white, { headerH: 32, rowSize: 12, titleSize: 13 })}
${line(250, 265, 250, 294)}
${line(250, 374, 250, 420)}
<path d="M250 540 L284 574 L250 608 L216 574 Z" fill="${C.paleGold}" stroke="${C.gold}" stroke-width="2"/>
${t(250, 571, "Valid?", 13, C.ink, 700, "middle")}
${line(250, 500, 250, 540)}
${card(510, 294, 310, 90, "Validate required fields", ["service exists • name • contact", "optional email, address, description"], C.teal, C.white, { headerH: 34, rowSize: 12, titleSize: 14 })}
${card(510, 448, 310, 104, "Create service request", ["Generate MSWDO reference", "Set status = pending", "Set submitted_at + optional user_id"], C.green)}
${card(510, 628, 310, 76, "Return confirmation", ["201 response + reference number"], C.ink, C.white, { headerH: 32, rowSize: 12, titleSize: 13 })}
${path("M360 458 H510", C.blue)}
${path("M665 384 V448", C.teal)}
${path("M665 552 V628", C.green)}
${path("M510 500 H438 V574 H284", C.muted)}
${label(450, 489, "API validation fails", C.red)}
${card(1002, 298, 294, 90, "Choose supporting files", ["PDF / JPG / JPEG / PNG", "up to 5 MB per file"], C.gold, C.white, { headerH: 34, rowSize: 12, titleSize: 14 })}
${card(1002, 454, 294, 90, "Upload by reference", ["1–10 files • POST public upload"], C.gold, C.white, { headerH: 34, rowSize: 12, titleSize: 14 })}
${card(1002, 612, 294, 90, "Save file + metadata", ["local disk + request_documents"], C.ink, C.white, { headerH: 34, rowSize: 12, titleSize: 14 })}
${path("M820 666 H908 V343 H1002", C.muted)}
${path("M1149 388 V454", C.gold)}
${path("M1149 544 V612", C.gold)}
${label(935, 326, "optional", C.gold)}
${line(250, 608, 250, 656, C.green)}
${t(278, 628, "Yes", 12, C.green, 700)}
${card(140, 656, 220, 78, "Receive reference", [], C.green, C.white, { headerH: 34, titleSize: 13 })}
${line(250, 734, 250, 772, C.muted, 1.5, false, false)}
${t(307, 589, "No → confirmation", 12, C.muted, 600)}
`);

add("12-sequence-diagram.svg", "Sequence Diagram", "Behavioral blueprint", "Chronological API interaction for submitting a service request; file upload is a separate optional operation after a reference is issued.", `
${t(175, 192, "Applicant", 14, C.ink, 700, "middle")}
${t(445, 192, "React SPA", 14, C.ink, 700, "middle")}
${t(730, 192, "Laravel API", 14, C.ink, 700, "middle")}
${t(1010, 192, "ServiceRequestController", 14, C.ink, 700, "middle")}
${t(1280, 192, "MySQL", 14, C.ink, 700, "middle")}
${[175,445,730,1010,1280].map(x => `<rect x="${x-74}" y="208" width="148" height="54" rx="12" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>${line(x,262,x,778,C.border,1.7,true,false)}`).join("")}
${line(175, 310, 445, 310, C.blue)}
${label(310, 296, "1. Enter and submit form", C.blue)}
${line(445, 368, 730, 368, C.teal)}
${label(588, 354, "2. POST /api/service-requests", C.teal)}
${line(730, 426, 1010, 426, C.teal)}
${label(870, 412, "3. Validate request fields", C.teal)}
${line(1010, 484, 1280, 484, C.green)}
${label(1145, 470, "4. INSERT request (pending + reference)", C.green)}
${line(1280, 542, 1010, 542, C.green)}
${label(1145, 528, "5. Return saved record", C.green)}
${line(1010, 600, 730, 600, C.green)}
${label(870, 586, "6. Return 201 + request data", C.green)}
${line(730, 658, 445, 658, C.blue)}
${label(588, 644, "7. JSON confirmation", C.blue)}
${line(445, 716, 175, 716, C.blue)}
${label(310, 702, "8. Display reference number", C.blue)}
${note(690, 756, 620, 58, ["After confirmation, optional upload uses POST /api/public-upload-document with the reference and multipart files."])}
`);

add("13-state-machine.svg", "State Machine Diagram", "Behavioral blueprint", "Service-request lifecycle states match the database enum. Staff can update a request status through the protected status endpoint.", `
<circle cx="110" cy="440" r="16" fill="${C.ink}"/>
${path("M126 440 H244", C.muted)}
${ellipse(330, 440, 88, 44, "pending", C.paleGold, C.gold)}
${ellipse(590, 440, 104, 44, "under_review", C.paleBlue, C.blue)}
${ellipse(880, 290, 84, 44, "approved", C.paleTeal, C.green)}
${ellipse(880, 590, 84, 44, "rejected", C.paleRed, C.red)}
${ellipse(1160, 440, 88, 44, "completed", C.paleTeal, C.teal)}
${path("M418 425 C470 365 500 365 512 409", C.muted)}
${label(468, 365, "staff sets status")}
${path("M681 408 C730 350 770 320 796 303", C.green)}
${label(742, 325, "staff decision: approve")}
${path("M681 474 C730 530 770 562 796 578", C.red)}
${label(740, 556, "staff decision: reject")}
${path("M964 290 H1072 C1110 290 1125 334 1135 390", C.green)}
${label(1050, 275, "work completed")}
${path("M964 590 H1070 C1110 590 1125 546 1135 490", C.red)}
${label(1050, 610, "resolve / close")}
${path("M1160 396 C1090 228 450 222 330 396", C.muted, 1.8, true)}
${label(744, 224, "staff may set another allowed status")}
${note(248, 678, 890, 76, ["These are persisted status values, not enforced transition guards. The API validates the selected value but does not restrict a transition path."])}
`);

add("14-communication-diagram.svg", "Communication Diagram", "Behavioral blueprint", "Object links and numbered messages for an applicant submitting a request and then looking it up by reference.", `
${card(104, 328, 210, 126, "applicant", ["external actor"], C.blue)}
${card(424, 248, 226, 126, "publicSPA", ["React application"], C.teal)}
${card(804, 248, 250, 126, "requestAPI", ["Laravel API routes"], C.green)}
${card(804, 542, 250, 126, "trackingAPI", ["TrackingController"], C.gold)}
${card(1160, 328, 220, 126, "portalDB", ["MySQL records"], C.blue)}
${path("M314 356 L424 318", C.muted, 2, false, false)}
${path("M650 310 H804", C.muted, 2, false, false)}
${path("M1054 310 L1160 356", C.muted, 2, false, false)}
${path("M314 414 L424 584", C.muted, 2, false, false)}
${path("M650 584 H804", C.muted, 2, false, false)}
${path("M1054 584 L1160 426", C.muted, 2, false, false)}
${pill(250, 260, "1  choose + submit", C.paleBlue, C.blue)}
${pill(655, 218, "2  POST /service-requests", C.paleTeal, C.teal)}
${pill(1010, 260, "2.1  create pending row", C.paleTeal, C.green)}
${pill(250, 476, "3  enter reference", C.paleGold, C.gold)}
${pill(655, 606, "4  POST /track-request", C.paleGold, C.gold)}
${pill(1010, 492, "4.1  query by reference", C.paleBlue, C.blue)}
${note(440, 716, 626, 60, ["Response messages return confirmation details or the matched status, service name, remarks, and uploaded document metadata."])}
`);

add("15-interaction-overview.svg", "Interaction Overview Diagram", "Behavioral blueprint", "Top-level control flow across application submission, optional uploads, staff processing, and public tracking interactions.", `
<circle cx="130" cy="248" r="15" fill="${C.ink}"/>
${card(220, 204, 270, 100, "1 • Submit application", ["«interaction» SubmitRequest", "validate → create → reference"], C.teal)}
<path d="M548 248 L580 280 L548 312 L516 280 Z" fill="${C.paleGold}" stroke="${C.gold}" stroke-width="2"/>
${t(548, 276, "Docs?", 12, C.ink, 700, "middle")}
${card(620, 186, 300, 100, "2 • Upload documents", ["«interaction» PublicUpload", "store bytes + metadata"], C.gold)}
${card(620, 394, 300, 100, "3 • Staff review", ["«activity» ReviewRequest", "inspect → update status"], C.green)}
${card(1010, 394, 300, 100, "4 • Track progress", ["«interaction» TrackRequest", "lookup reference → show status"], C.blue)}
${card(1010, 604, 300, 100, "5 • Close request", ["«interaction» UpdateStatus", "completed / rejected"], C.ink)}
${path("M145 248 H220", C.muted)}
${path("M490 254 H516", C.muted)}
${path("M580 280 H600 V236 H620", C.gold)}
${path("M548 312 V444 H620", C.muted)}
${path("M920 444 H1010", C.green)}
${path("M1160 494 V604", C.blue)}
${path("M1010 654 H940 V444 H920", C.muted, 1.8, true)}
${path("M770 394 V286", C.muted, 1.8, true)}
${label(598, 217, "Yes", C.gold)}
${label(564, 382, "No / continue", C.muted)}
${note(218, 572, 700, 70, ["Optional uploads and tracking are separate portal actions. Staff status changes are reflected in subsequent tracking responses."])}
`);

add("16-timing-diagram.svg", "Timing Diagram", "Behavioral blueprint", "Qualitative lifecycle timing (not a fixed SLA): the record begins pending on submission and advances when staff update its status.", `
${t(100, 226, "Applicant", 14, C.ink, 700)}
${t(100, 368, "Portal / API", 14, C.ink, 700)}
${t(100, 510, "Request status", 14, C.ink, 700)}
${t(100, 652, "Documents", 14, C.ink, 700)}
${path("M250 246 H1340", C.border, 1.5, false, false)}
${path("M250 388 H1340", C.border, 1.5, false, false)}
${path("M250 530 H1340", C.border, 1.5, false, false)}
${path("M250 672 H1340", C.border, 1.5, false, false)}
${[360,590,810,1030,1240].map((x,i)=>`${line(x,198,x,726,C.border,1.3,true,false)}${label(x,755,["Submit","Reference","Staff review","Decision","Closure"][i],C.muted,12)}`).join("")}
${path("M360 224 H500 V266 H590", C.blue, 4, false, false)}
${path("M360 366 H500 V410 H590", C.teal, 4, false, false)}
${path("M590 508 H810 V552 H1030 V508 H1240 V552", C.green, 4, false, false)}
${path("M590 650 H690 V694 H810 V650", C.gold, 4, false, false)}
${t(620, 492, "pending", 13, C.gold, 700)}
${t(840, 575, "under_review", 13, C.blue, 700)}
${t(1060, 492, "approved / rejected", 13, C.green, 700)}
${t(1262, 575, "completed", 13, C.teal, 700)}
${t(600, 642, "no file", 12, C.muted, 600)}
${t(714, 714, "file(s) stored", 12, C.gold, 600)}
${note(338, 786, 900, 48, ["Timestamps are event-driven; the application does not define a duration threshold or automated SLA timer."])}
`);

add("17-requirement-diagram.svg", "Requirement Diagram", "Behavioral blueprint", "Traceable requirements for the current portal, mapped to implementation areas; capabilities not evident in code are not asserted.", `
${card(86, 210, 336, 160, "«requirement» REQ-01", ["Public applicant can submit", "a service request and receive", "a unique reference number."], C.blue)}
${card(86, 440, 336, 160, "«requirement» REQ-02", ["Applicant can retrieve request", "status by reference number."], C.teal)}
${card(538, 210, 336, 160, "«requirement» REQ-03", ["Request fields are validated;", "valid data is persisted with", "initial status pending."], C.green)}
${card(538, 440, 336, 160, "«requirement» REQ-04", ["Supporting files are restricted", "to PDF/JPG/PNG, max 5 MB", "per file; metadata is recorded."], C.gold)}
${card(990, 210, 360, 160, "«requirement» REQ-05", ["Staff access is authenticated", "and protected by role and", "module-permission middleware."], C.ink)}
${card(990, 440, 360, 160, "«requirement» REQ-06", ["Staff can update request status", "using the supported status set."], C.blue)}
${card(538, 668, 336, 112, "«design» API + controllers", ["routes/api.php • controllers"], C.teal)}
${card(990, 668, 360, 112, "«design» React portal + Sanctum", ["public UI • staff UI • middleware"], C.green)}
${path("M422 290 H500 V240 H538", C.muted, 1.7, true)}
${path("M422 520 H500 V322 H538", C.muted, 1.7, true)}
${path("M706 370 V668", C.teal)}
${path("M706 600 V668", C.teal)}
${path("M1170 370 V668", C.green)}
${path("M1170 600 V668", C.green)}
${label(480, 274, "«deriveReqt»")}
${label(480, 503, "«deriveReqt»")}
${label(738, 636, "«satisfy»", C.teal)}
${label(1201, 636, "«satisfy»", C.green)}
${note(86, 668, 336, 112, ["Additional scope: client portal,", "appointments, announcements,", "admin settings and reports."])}
`);

for (const d of diagrams) {
  writeFileSync(join(outDir, d.file), d.svg, "utf8");
}

const list = diagrams.map((d) => `<article class="diagram"><a href="./${d.file}"><img src="./${d.file}" alt="${esc(d.title)}"></a><div><span>${esc(d.category)}</span><h2><a href="./${d.file}">${esc(d.title)}</a></h2><p>${esc(d.subtitle)}</p><a class="download" href="./${d.file}" download>Open / download SVG</a></div></article>`).join("\n");
const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MSWDO Portal — System Diagrams</title>
<style>
:root{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#17343b;background:#f4f8f7}*{box-sizing:border-box}body{margin:0}header{padding:42px max(24px,calc((100vw - 1280px)/2));background:#0f3338;color:white;border-bottom:8px solid #087e78}header p{max-width:920px;color:#d4e5e2;line-height:1.55}header h1{font-size:clamp(28px,4vw,46px);margin:8px 0}.eyebrow{color:#8ed1c0;text-transform:uppercase;letter-spacing:.11em;font-size:12px;font-weight:700}.summary{max-width:1280px;margin:26px auto 10px;padding:0 24px}.summarygrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.summarygrid section{background:white;border:1px solid #d5e2df;border-radius:14px;padding:18px}.summarygrid h2{font-size:16px;margin:0 0 8px;color:#087e78}.summarygrid p{font-size:14px;line-height:1.55;margin:0}.gallery{max-width:1280px;margin:28px auto 64px;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr);gap:22px}.diagram{background:white;border:1px solid #d5e2df;border-radius:16px;overflow:hidden;box-shadow:0 7px 22px #17343b0b}.diagram img{display:block;width:100%;height:auto;border-bottom:1px solid #d5e2df}.diagram div{padding:16px 18px 20px}.diagram span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#087e78;font-weight:750}.diagram h2{font-size:18px;margin:7px 0}.diagram a{color:#17343b;text-decoration:none}.diagram p{font-size:13px;line-height:1.5;color:#587178;margin:0 0 12px}.diagram .download{font-size:13px;font-weight:700;color:#087e78;text-decoration:underline}footer{max-width:1280px;margin:0 auto 30px;padding:0 24px;color:#587178;font-size:12px}
</style></head><body>
<header><div class="eyebrow">System modeling • 17 vector diagrams</div><h1>MSWDO Online Service Portal</h1><p>A public-facing social welfare service portal with client accounts, staff case processing, document uploads, request tracking, appointments, and administration. The diagrams are grounded in the current React/Vite frontend, Laravel API, MySQL models, and Docker Compose configuration.</p></header>
<div class="summary"><div class="summarygrid">
<section><h2>Essential structural blueprint</h2><p><strong>System Architecture</strong> is the key infrastructure view: it shows the browser, React client, Laravel API, database, and private upload storage and how they connect.</p></section>
<section><h2>Critical behavior views</h2><p><strong>Use Case</strong> defines the Applicant, Client, Staff, and Administrator capabilities. <strong>Activity</strong> details the submission flow, including validation, reference generation, and optional uploads.</p></section>
<section><h2>Data flow</h2><p>User-entered service and applicant details go from the React form to the Laravel API for validation. A valid request is saved in MySQL with a generated reference and pending status; supporting files are stored on the backend local disk and their metadata in MySQL.</p></section>
</div></div>
<main class="gallery">${list}</main><footer>SVGs are scalable and can be opened individually, embedded in documents, or converted to PNG for print. The deployment diagram describes the checked-in local Docker setup and does not imply a production host.</footer>
</body></html>`;
writeFileSync(join(outDir, "index.html"), index, "utf8");
