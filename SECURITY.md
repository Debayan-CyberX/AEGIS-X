# Security model

AEGIS-X is a single-workspace portfolio application. Do not treat it as a production security boundary without further engineering and review.

## Trust boundaries

Browser input, imported telemetry, log payloads, user notes, vulnerability findings, and questions are untrusted. Pydantic validates normalized input; SQLAlchemy parameterizes SQL; React renders text rather than HTML. The PDF writer handles text, not embedded markup. Raw logs are not passed to the LLM. The LLM has no tools or command execution path and cannot invoke response actions. Optional generated prose is advisory and must be checked against attached evidence.

## Identity and authorization

Passwords are hashed with Argon2. Session tokens contain 256 bits of random entropy; only SHA-256 hashes are stored, with an eight-hour expiry. Cookies are HTTP-only and SameSite Strict. Enable Secure cookies for HTTPS. Sessions are revoked on logout. Seed credentials come from environment configuration and are never shipped in frontend source. No anonymous application records are readable. Analysts may investigate, add notes, generate reports, advance incident/remediation statuses, and approve simulated actions. Administrators additionally ingest telemetry, import findings, run/reset the demo, and request safe demo-auto response mode.

Mutating requests carrying an Origin header must match the configured exact-origin list. CORS is restricted. Nonbrowser clients authenticate with the same session cookie. A production system should add explicit CSRF tokens, MFA, session management, password recovery, and a secure user-administration flow. WebSocket handshakes check origin and session; heartbeat rechecks session expiry every twenty seconds for the shipped UI. Add server-timed disconnects for idle/uncooperative clients before production.

## Simulation boundaries

All generated authentication events use documentation-only source IP space and fictional assets. Built-in block/isolate actions only persist simulated response records. The application never launches processes from logs, connects to an endpoint, changes a firewall, runs Nmap, or disables accounts. Requiring confirmation is a workflow control; it is not an integration authorization mechanism. Real controls require independently designed integrations, authenticated service identities, scoped permissions, explicit authorization, and human approval.

## Data and operations

Do not commit `.env`, database files, real telemetry, credentials, or reports with sensitive contents. Avoid public deployment of local demo credentials. API audit records track successful state changes but are mutable by a database administrator; there is no immutable audit sink. Reports can contain names and investigation notes. Use trusted storage, retention policies, encryption, and least privilege.

Rate limiting is local process memory for login, event ingestion, demo generation, and AI requests. It is not production distributed abuse protection. Aggregate query/report cost and per-user quotas need hardening. No tenant isolation exists. Run a single API worker because sockets and rate limits are process-local. TLS terminates at a trusted reverse proxy. Never disable TLS or dependency verification.

The optional OpenAI integration sends normalized evidence and user questions to OpenAI; review data handling policies first. It excludes raw payloads but questions may contain sensitive text. Do not provide secrets in questions. Schema checks and lack of action tools limit impact, but generated text is not guaranteed to be factual or immune to prompt injection.

## Reporting an issue

Report vulnerabilities privately to the repository owner through an available private GitHub security advisory/contact channel. Do not include live credentials or sensitive logs in public issues. Dependencies should be audited and updated before any deployment.
