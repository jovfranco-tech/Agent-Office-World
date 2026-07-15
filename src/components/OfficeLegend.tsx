/**
 * OfficeLegend — discreet legend / mini-stats shown in the side panel.
 * Lists zones with their tint + agent count, and a role color key.
 */
import type { Agent } from "../types";
import { OFFICE_ZONES } from "../data/officeZones";
import { ROLE_FILTERS } from "../data/codexPetsManifest";

interface Props {
  agents: Agent[];
  onSelectZone: (zoneId: string) => void;
}

export default function OfficeLegend({ agents, onSelectZone }: Props) {
  const active = agents.filter((a) => a.state !== "Idle").length;
  const blocked = agents.filter((a) => a.state === "Blocked").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Mini stats */}
      <div style={{ display: "flex", gap: 8 }}>
        <Stat label="Agents" value={agents.length} color="#3b82f6" />
        <Stat label="Active" value={active} color="#22c55e" />
        <Stat label="Blocked" value={blocked} color="#ef4444" />
      </div>

      {/* Zone list */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>
          Zones
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {OFFICE_ZONES.map((z) => {
            const count = agents.filter((a) => a.zone === z.id).length;
            return (
              <button
                key={z.id}
                onClick={() => onSelectZone(z.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "4px 7px",
                  borderRadius: 5,
                  border: "1px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 11.5,
                  textAlign: "left",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                title={`Show agents in ${z.name}`}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: z.color, border: "1px solid rgba(255,255,255,0.15)" }} />
                  {z.name}
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role color key */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>
          Roles
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {ROLE_FILTERS.map((r) => (
            <span
              key={r.role}
              className="chip"
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderColor: `${r.accent}77`,
                background: `${r.accent}14`,
                color: r.accent,
                fontWeight: 600,
              }}
              title={`${r.role} → pet: ${r.petSlug}`}
            >
              {r.emoji} {r.role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--border-soft)",
        borderRadius: 8,
        padding: "6px 8px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
    </div>
  );
}
