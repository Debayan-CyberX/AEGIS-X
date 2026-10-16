# Five-minute AEGIS-X interview demo

Prepare: start services, authenticate once, verify the backend health endpoint, and reset synthetic data in Settings. Use offline investigation mode for a predictable demo. This is a fictional agricultural enterprise, not a real organization's network.

**0:00–0:40 — Product and trust.** Open the landing page. “AEGIS-X connects detection evidence to analyst decisions. The visual preview is illustrative; the command center reads database records. Deterministic rules detect, AI explains, and analysts approve.”

**0:40–1:30 — Follow a real pipeline.** Launch the command center and authenticate. Explain the empty state. Select Run AgriShield demo. Six synthetic events enter ordinary backend ingestion. Show the five failures, subsequent success, and two incidents. Explain the five-minute sliding window, account/source/host correlation, T1110 and T1078, and why a signal is not proof of compromise.

**1:30–2:30 — Investigate evidence.** Open the critical incident. Show the six event IDs, source IP, affected warehouse server, and React Flow graph. Click a graph node. Ask AEGIS INTELLIGENCE to explain the detection. Point out the deterministic-fallback label when no key is configured, and event references. Explain that logs cannot trigger shell execution and the model never decides detection.

**2:30–3:20 — Respond safely.** Advance to Investigating, add a note, and select Simulate endpoint isolation. Read the confirmation, approve it, and show the persisted response. “This only records a simulated defensive action; no device is contacted.” Show the audit record in Settings. Explain analyst/admin permissions.

**3:20–4:10 — Demonstrate breadth.** Open Network Map and click warehouse-inventory. Show incident-derived risk. Import samples/vulnerabilities.json and clearly identify it as synthetic. Advance a finding through triage. Show analytics changing with underlying records, and explain why unmeasured metrics are not invented.

**4:10–5:00 — Report, reset, and discuss tradeoffs.** Download the incident PDF and show its evidence timeline, technique, response, and generation timestamp. Resolve the incident through sequential transitions. Reset the demo and rerun it. Close with tests, schema relationships, local Windows setup, and limitations: no live collectors, durable queue, multi-tenancy, or production identity management yet.

If the AI service is unavailable, the evidence-grounded local summary still works. If WebSockets are unavailable, the UI labels its polling fallback. Never describe synthetic telemetry as monitoring a real enterprise.
