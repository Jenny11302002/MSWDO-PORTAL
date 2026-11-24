# MSWDO Online Service Portal — System Modeling

## Project identification

**Proposal title:** MSWDO Online Service Portal

The portal lets community members browse social welfare services, submit service requests, upload supporting documents, and check request progress using a reference number. Clients can also use an account portal, while MSWDO staff review requests, manage appointments and service information, and administrators manage users, announcements, and settings.

## Blueprinting choices

### Essential structural diagram: System Architecture

The [System Architecture](./01-system-architecture.svg) is essential because the portal is split across a browser-based React/Vite frontend, a Laravel API, MySQL, and backend file storage. Showing their boundaries and connections clarifies where UI requests, authentication, structured records, and uploaded files are handled. The companion [Deployment Diagram](./04-deployment-diagram.svg) documents the checked-in local Docker Compose setup; it does not claim a production hosting design.

### Critical behavioral diagrams

- **Use Case:** The [Use Case Diagram](./10-use-case-diagram.svg) maps the goals of the Applicant, Client, Staff, and Administrator actors, including application submission, tracking, request processing, appointments, and administration.
- **Activity:** The [Activity Diagram](./11-activity-diagram.svg) follows one applicant scenario from selecting a service through server-side validation, request creation, receipt of a reference number, and optional supporting-document upload.

### Data blueprint

The applicant enters a service and contact details in the React interface. The frontend sends them to the Laravel API, which validates the input, generates an `MSWDO-` reference number, sets the initial status to `pending`, and saves the request in MySQL. Supporting files are uploaded separately using that reference number: the backend validates each file, saves its bytes to local storage, and saves document metadata in MySQL. The tracking endpoint looks up the request by reference and returns its current status and related information.

## Diagram set

All diagrams are individual scalable SVG images. Open the [diagram gallery](./index.html) to preview them, or select an image below.

### Structural diagrams — static blueprint

1. [System Architecture](./01-system-architecture.svg)
2. [Class Diagram](./02-class-diagram.svg)
3. [Component Diagram](./03-component-diagram.svg)
4. [Deployment Diagram](./04-deployment-diagram.svg)
5. [Object Diagram](./05-object-diagram.svg)
6. [Package Diagram](./06-package-diagram.svg)
7. [Composite Structure Diagram](./07-composite-structure.svg)
8. [Profile Diagram](./08-profile-diagram.svg)

### Behavioral diagrams — system in motion

9. [Data Flow Diagram (Level 1)](./09-data-flow-diagram.svg)
10. [Use Case Diagram](./10-use-case-diagram.svg)
11. [Activity Diagram](./11-activity-diagram.svg)
12. [Sequence Diagram](./12-sequence-diagram.svg)
13. [State Machine Diagram](./13-state-machine.svg)
14. [Communication Diagram](./14-communication-diagram.svg)
15. [Interaction Overview Diagram](./15-interaction-overview.svg)
16. [Timing Diagram](./16-timing-diagram.svg)
17. [Requirement Diagram](./17-requirement-diagram.svg)

## Modeling notes

- The diagrams describe the application currently present in this project. Proposed or illustrative values are labeled as such.
- The profile diagram presents a documentation-only MSWDO stereotype set, not an installed UML extension.
- The state diagram uses the request status values accepted by the API. The application does not currently enforce a particular transition order.
- The object diagram uses invented sample values and does not depict a real applicant.
