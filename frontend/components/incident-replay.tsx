"use client";
import { useEffect, useState } from "react";
import type { Incident } from "./api";
export default function IncidentReplay({ incident }: { incident: Incident }) {
  const events = incident.events || [];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [incident.id]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setStep((value) => {
          if (value >= events.length - 1) {
            setPlaying(false);
            return value;
          }
          return value + 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [playing, events.length]);
  if (!events.length)
    return <p className="subtle">No linked events to replay.</p>;
  const current = events[Math.min(step, events.length - 1)];
  return (
    <section className="incident-replay">
      <div className="replay-heading">
        <div>
          <span className="eyebrow">
            EVIDENCE REPLAY /{" "}
            {incident.synthetic ? "SYNTHETIC RECORDS" : "IMPORTED RECORDS"}
          </span>
          <h3>Reconstruct the signal.</h3>
        </div>
        <span className="mono">
          {String(step + 1).padStart(2, "0")} /{" "}
          {String(events.length).padStart(2, "0")}
        </span>
      </div>
      <div className="replay-event">
        <span className={`replay-event-mark ${current.outcome}`} />
        <div>
          <small className="mono">
            EVT-{current.id} · {new Date(current.timestamp).toLocaleString()}
          </small>
          <strong>
            {current.outcome === "failure"
              ? "Authentication rejected"
              : current.outcome === "success"
                ? "Successful authentication"
                : current.event_type.replaceAll("_", " ")}
          </strong>
          <p>
            {current.username} → {current.hostname} · {current.source_ip}
          </p>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={events.length - 1}
        value={step}
        aria-label="Incident replay position"
        onChange={(e) => {
          setStep(Number(e.target.value));
          setPlaying(false);
        }}
      />
      <div className="replay-controls">
        <button
          className="button small outline"
          onClick={() => {
            if (step === events.length - 1) setStep(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "Pause replay" : "Play evidence"}
        </button>
        <p>
          {step === events.length - 1
            ? `${incident.rule_id} · ${incident.title}. Review evidence before response.`
            : "Building the evidence trail. An isolated failure does not establish a threat."}
        </p>
      </div>
    </section>
  );
}
