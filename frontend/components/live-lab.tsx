"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { api, post, Incident } from "./api";
import IncidentReplay from "./incident-replay";
const tabs = [
  ["DETECT", "A signal becomes a case."],
  ["INVESTIGATE", "Follow the evidence."],
  ["UNDERSTAND", "Clarity, with references."],
  ["RESPOND", "The last word is yours."],
  ["CONTROL", "From insight to oversight."],
];
export default function LiveLab() {
  const [user, setUser] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [approve, setApprove] = useState(false);
  const [result, setResult] = useState("");
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      setChecked(true);
      return;
    }
    let active = true;
    api("/auth/me")
      .then(async (u) => {
        if (!active) return;
        setUser(u);
        const records = await api<Incident[]>("/incidents");
        const stored = records.find(
          (i) => i.synthetic && i.rule_id === "AX-002",
        );
        if (stored) {
          const detail = await api<Incident>(`/incidents/${stored.id}`);
          if (active) setIncident(detail);
        }
      })
      .catch((e) => {
        if (active && e.message !== "Authentication required")
          setError(e.message);
      })
      .finally(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="live-lab" id="simulation">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">
            02 / IN THE FIELD · SAFE SYNTHETIC SCENARIO
          </span>
          <h2>
            WATCH THE
            <br />
            SYSTEM THINK<span className="acid">.</span>
          </h2>
        </div>
        <div>
          <p>
            Six events. One suspicious sequence.
            <br />A real pipeline, from signal to decision.
          </p>
          {!checked ? (
            <span className="mono">CHECKING SESSION…</span>
          ) : !user ? (
            <Link href="/console?return=lab" className="button">
              SIGN IN TO SIMULATE{" "}
              <span>
                <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <button
              className="button"
              disabled={busy || user.role !== "administrator"}
              onClick={() =>
                act(async () => {
                  const data = await post("/demo/run");
                  setIncident(
                    await api(`/incidents/${data.incident_ids.at(-1)}`),
                  );
                  setAnalysis(null);
                  setApprove(false);
                  setResult("");
                  setTab(0);
                })
              }
            >
              {busy ? "PROCESSING…" : "INITIATE SIMULATION"}{" "}
              <span>
                <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
              </span>
            </button>
          )}
          {user?.role === "analyst" && (
            <small>Scenario generation requires an administrator.</small>
          )}
        </div>
      </div>
      <div className="lab-console">
        <div className="lab-console-top">
          <span>
            <i className={incident ? "live-dot" : ""} />
            {incident
              ? "STORED SCENARIO / AGRISHIELD"
              : "AGRISHIELD / FICTIONAL ENTERPRISE"}
          </span>
          <span>NO REAL INFRASTRUCTURE IS MODIFIED</span>
        </div>
        <div
          className="lab-tabs"
          role="tablist"
          aria-label="Product demonstration stages"
        >
          {tabs.map(([label], i) => (
            <button
              role="tab"
              id={`lab-tab-${i}`}
              aria-selected={tab === i}
              aria-controls="lab-panel"
              tabIndex={tab === i ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : 4)) % 5;
                  setTab(next);
                  document.getElementById(`lab-tab-${next}`)?.focus();
                }
              }}
              key={label}
              onClick={() => {
                setTab(i);
                setApprove(false);
              }}
            >
              <span>0{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
        <div
          className="lab-panel"
          role="tabpanel"
          id="lab-panel"
          aria-labelledby={`lab-tab-${tab}`}
          tabIndex={0}
        >
          <div className="lab-panel-copy">
            <span className="oversized-index">0{tab + 1}</span>
            <h3>{tabs[tab][1]}</h3>
            <p>
              {
                [
                  "The same normalized ingestion and five-minute correlation rules used by the platform. Generated telemetry is always labeled synthetic.",
                  "Every connection has a source. Scrub through the stored event sequence and inspect the exact evidence behind the incident.",
                  "A structured explanation, anchored to event IDs. Deterministic local summaries remain available without an AI provider.",
                  "Review the recommendation. Confirm the action. Built-in containment records a simulation, never a real firewall change.",
                  "Continue in the command center to explore the live feed, asset relationships, analytics, and downloadable reports.",
                ][tab]
              }
            </p>
            {tab === 4 && (
              <Link className="button outline" href="/console">
                ENTER COMMAND CENTER{" "}
                <ArrowUpRight className="diagonal-arrow" aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className="lab-panel-visual">
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {!incident ? (
              <div className="lab-empty">
                <div className="empty-cross">＋</div>
                <span className="mono">AWAITING AUTHORIZED TELEMETRY</span>
                <p>
                  Sign in and initiate a safe simulation.
                  <br />
                  This panel will display actual stored events.
                </p>
                <div className="empty-lines">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : (
              <>
                {tab === 0 && (
                  <>
                    <div className="lab-data-heading">
                      <span className="live-dot" />
                      CORRELATION COMPLETE <span>{incident.rule_id}</span>
                    </div>
                    <div className="telemetry-rows">
                      {incident.events?.map((e: any) => (
                        <div key={e.id}>
                          <span className="mono">EVT-{e.id}</span>
                          <span>{e.event_type}</span>
                          <span className={`event-outcome ${e.outcome}`}>
                            {e.outcome}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="detected-case">
                      <span className="severity-mark" />
                      <div>
                        <small>
                          AX-{incident.id} / {incident.severity.toUpperCase()}
                        </small>
                        <strong>{incident.title}</strong>
                      </div>
                      <button
                        aria-label="Inspect detected incident"
                        onClick={() => setTab(1)}
                      >
                        <ArrowUpRight
                          className="diagonal-arrow"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </>
                )}
                {tab === 1 && <IncidentReplay incident={incident} />}
                {tab === 2 && (
                  <div className="lab-analysis">
                    <span className="eyebrow">
                      AEGIS INTELLIGENCE / EVIDENCE FIRST
                    </span>
                    {analysis ? (
                      <>
                        <h4>Assessment</h4>
                        <p>{analysis.summary}</p>
                        <span className="analysis-mode">{analysis.mode}</span>
                        <div className="reference-chips">
                          {analysis.evidence.map((e: string) => (
                            <span key={e}>{e}</span>
                          ))}
                        </div>
                        <ol>
                          {analysis.recommendations.map(
                            (s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ),
                          )}
                        </ol>
                        {analysis.notice && <p>{analysis.notice}</p>}
                      </>
                    ) : (
                      <>
                        <h4>
                          No black box.
                          <br />
                          Just a clearer picture.
                        </h4>
                        <button
                          className="button outline"
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              setAnalysis(
                                await post(
                                  `/incidents/${incident.id}/investigate`,
                                  {
                                    question:
                                      "Explain the observed authentication sequence and recommend investigation steps.",
                                  },
                                ),
                              );
                            })
                          }
                        >
                          {busy ? (
                            "RETRIEVING EVIDENCE…"
                          ) : (
                            <>
                              ANALYZE STORED EVIDENCE{" "}
                              <ArrowUpRight
                                className="diagonal-arrow"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {tab === 3 && (
                  <div className="lab-response">
                    <span className="eyebrow">
                      HUMAN-APPROVED / SIMULATION ONLY
                    </span>
                    <h4>
                      Isolate the endpoint.
                      <br />
                      Keep the human in control.
                    </h4>
                    <p>
                      {incident.hostname} · AX-{incident.id}
                    </p>
                    {result ? (
                      <div className="response-result" role="status">
                        {result}
                      </div>
                    ) : approve ? (
                      <div className="approval-box">
                        <p>
                          Approve simulated isolation for this incident? This
                          only creates an audited response record. No endpoint
                          is contacted.
                        </p>
                        <div>
                          <button
                            className="button"
                            disabled={busy}
                            onClick={() =>
                              act(async () => {
                                const record = await post(
                                  `/incidents/${incident.id}/respond`,
                                  {
                                    playbook_id: "isolate",
                                    mode: "approval_required",
                                    confirmed: true,
                                  },
                                );
                                setResult(record.result);
                                setApprove(false);
                              })
                            }
                          >
                            APPROVE SIMULATION
                          </button>
                          <button
                            className="text-link"
                            onClick={() => setApprove(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="button outline"
                        onClick={() => setApprove(true)}
                      >
                        REVIEW CONTAINMENT{" "}
                        <ArrowUpRight
                          className="diagonal-arrow"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                )}
                {tab === 4 && (
                  <div className="control-preview">
                    <span className="eyebrow">
                      CASE RECORD / AX-{incident.id}
                    </span>
                    <h4>{incident.hostname}</h4>
                    <dl>
                      <div>
                        <dt>Detection</dt>
                        <dd>{incident.rule_id}</dd>
                      </div>
                      <div>
                        <dt>Linked events</dt>
                        <dd>{incident.events?.length}</dd>
                      </div>
                      <div>
                        <dt>Investigation status</dt>
                        <dd>{incident.status}</dd>
                      </div>
                      <div>
                        <dt>MITRE ATT&CK</dt>
                        <dd>{incident.rule?.technique}</dd>
                      </div>
                    </dl>
                    <a
                      className="text-link"
                      href={`/api/incidents/${incident.id}/report`}
                      download
                    >
                      DOWNLOAD INCIDENT PDF{" "}
                      <ArrowUpRight
                        className="diagonal-arrow"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="lab-footnote">
        <span>01—05 / DETERMINISTIC BY DESIGN</span>
        <span>REAL RECORDS. SIMULATED THREATS.</span>
      </div>
    </section>
  );
}
