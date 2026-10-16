"use client";
import { ReactFlow, Background, Controls, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
export default function Topology({
  assets,
  onSelect,
}: {
  assets: any[];
  onSelect: (a: any) => void;
}) {
  const nodes = assets.map((a, i) => ({
    id: String(a.id),
    position: { x: (i % 3) * 235, y: Math.floor(i / 3) * 175 },
    data: {
      label: (
        <div className="graph-node">
          <small>{a.kind}</small>
          <strong>{a.hostname}</strong>
          <span>
            {a.ip} · risk {a.risk}
          </span>
        </div>
      ),
    },
    style: {
      background: a.risk > 0 ? "#29151e" : "#101114",
      color: "#f5f5f3",
      border: `1px solid ${a.risk > 0 ? "#ef4444" : "#474b50"}`,
      borderRadius: 2,
      width: 210,
    },
  }));
  const edges = assets
    .slice(1)
    .map((a, i) => ({
      id: `e${i}`,
      source: String(assets[0].id),
      target: String(a.id),
      animated: a.risk > 0,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: a.risk > 0 ? "#ef4444" : "#656970" },
    }));
  return (
    <div style={{ height: 440 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={(_, n) =>
          onSelect(assets.find((a) => String(a.id) === n.id))
        }
      >
        <Background color="#282b30" gap={25} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
