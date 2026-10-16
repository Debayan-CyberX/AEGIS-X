# Architecture and design decisions

The existing checkout is the application root. `frontend/` contains Next.js App Router pages, shared design tokens, server HTTP proxy rewrites, and client query state. `backend/` contains FastAPI, SQLAlchemy models, detection, seed data, Alembic migrations, and tests.

## Data flow

A validated event is stored before deterministic rules run in its database transaction. Rules retrieve the preceding five-minute source/host window and constrain authentication failures to the same account. Rule matches create or append evidence to an active incident and create alert records. Evidence is represented by an explicit IncidentEvent association. Records survive restarts. AgriShield uses the exact ingestion and detection functions used by the external ingestion API; it does not animate fake results.

After commit, an authenticated WebSocket broadcasts a small invalidation message. TanStack Query refreshes the actual API records. Event history in the browser is bounded to 100 rows; polling every ten seconds is the visible fallback. REST event listing is paginated. Inventory and incident lists are bounded for this small demonstration; production scale requires full cursor pagination and aggregate queries.

Investigation retrieval loads an incident, its linked events, the matching rule, notes, and responses. The fallback summarizes those records. Optional OpenAI gets a constrained projection of event fields and no raw payload or execution tools. Evidence references are attached by the backend. Generated prose cannot change incident state or invoke playbooks.

## Relational schema

Users → Sessions; Assets → SecurityEvents, Incidents, Vulnerabilities; DetectionRules → Incidents, Alerts; Incidents ↔ SecurityEvents through IncidentEvents; Incidents → InvestigationNotes and ResponseExecutions; ResponsePlaybooks → ResponseExecutions. AuditLogs retain actor/action/details independently so reset retains its history. Foreign keys are enforced on SQLite and PostgreSQL. Event timestamp, source IP, hostname, and event type are indexed. Alembic revision 0001 creates the initial metadata; future schema changes should use explicit independent migrations.

## Intentional tradeoffs

SQLite makes a local interview demo inexpensive; Compose uses PostgreSQL. A CSS/SVG security core avoids heavy 3D rendering. Graphs load on demand. Queries and deterministic detection execute synchronously in one API process; there is no durable background worker or queue yet. The design avoids introducing untested distributed infrastructure. Production deployment requires a queue, retry/idempotency design, shared WebSocket fanout, and shared rate limiting.

Response modes are enforced server-side: observe stores a recommendation, approval_required requires explicit confirmation, and demo_auto is limited to administrators on synthetic incidents. All built-in containment records a simulated result. Notes/tasks and in-app audit notifications are local records. The report playbook records the report recommendation/action; the separate Download PDF endpoint generates the actual artifact.

Landing-page chart/terminal visuals are explicitly illustrative. Command-center metrics query database records, with unknown timing metrics shown as unmeasured. Asset risk is the maximum active incident score; scores are transparent rule-based prioritization values, not calibrated attack probabilities.
