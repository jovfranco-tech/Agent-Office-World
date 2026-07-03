/**
 * ZoneInspector — card shown when a zone is clicked.
 * Lists the agents currently working in that zone.
 */
import type { Agent, OfficeZone } from "../types";
import { accentFor } from "../data/codexPetsManifest";

interface Props {
  zone: OfficeZone | null;
  agents: Agent[];
  onSelectAgent: (a: Agent) => void;
  onClose: () => void;
}

export default function ZoneInspector({ zone, agents, onSelectAgent, onClose }: Props) {
  if (!zone) return null;
  const here = agents.filter((a) => a.zone === zone.id);

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        width: 260,
        background: "rgba(14,19,34,0.92)",
        border: "1px solid var(--border-soft)",
        borderRadius: 12,
        padding: 14,
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        zIndex: 50,
        maxHeight: "70vh",
        overflowY: "auto",
      }}
      className="scroll-thin"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: zone.color, display: "inline-block" }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{zone.name}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
            {here.length} agent{here.length === 1 ? "" : "s"} here · {zone.kind}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: "2px 8px" }} aria-label="Close">
          ✕
        </button>
      </div>

      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "8px 0 10px" }}>
        {zone.description}
      </p>

      {here.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
          No agents in this zone right now.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {here.map((a) => {
            const accent = accentFor(a.role);
            return (
              <button
                key={a.id}
                onClick={() => onSelectAgent(a)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                  <span style={{ color: accent }}>●</span> {a.name}
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                  {a.role} · {a.state}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
