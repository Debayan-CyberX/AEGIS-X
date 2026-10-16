"use client";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
export default function InvestigationGraph({
  incident,
  onSelect,
}: {
  incident: any;
  onSelect: (text: string) => void;
}) {
  const records = [
    {
      id: "ip",
      label: incident.source_ip,
      detail: "Source IP observed in incident evidence",
    },
    {
      id: "host",
      label: incident.hostname,
      detail: "Affected destination asset",
    },
    {
      id: "incident",
      label: `AX-${incident.id} · ${incident.rule_id}`,
      detail: incident.title,
    },
    ...(incident.events || []).map((e: any) => ({
      id: `e${e.id}`,
      label: `EVT-${e.id} · ${e.outcome}`,
      detail: `${e.timestamp} — ${e.event_type} by ${e.username}`,
    })),
  ];
  const nodes = records.map((r, i) => ({
    id: r.id,
    position: {
      x: i < 3 ? i * 230 : ((i - 3) % 3) * 230,
      y: i < 3 ? 0 : 130 + Math.floor((i - 3) / 3) * 100,
    },
    data: { label: r.label },
    style: {
      background: "#101114",
      color: "#f5f5f3",
      border: "1px solid #474b50",
      borderRadius: 2,
      width: 205,
      fontSize: 11,
    },
  }));
  const edges = [
    { id: "source", source: "ip", target: "host" },
    { id: "finding", source: "host", target: "incident" },
    ...(incident.events || []).map((e: any) => ({
      id: `link${e.id}`,
      source: `e${e.id}`,
      target: "incident",
    })),
  ];
  return (
    <div style={{ height: 330 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={(_, n) =>
          onSelect(records.find((r) => r.id === n.id)?.detail || "")
        }
      >
        <Background color="#282b30" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
