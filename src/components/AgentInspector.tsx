/**
 * AgentInspector — detail card shown when an agent is selected.
 * Displays name, role, pet, state, task, zone, energy, animation, sprite
 * source and next action — per the spec's inspector contract.
 */
import type { Agent } from "../types";
import CodexPetSprite from "./CodexPetSprite";
import { getAgentPet } from "../data/codexPetsManifest";
import { getZone } from "../data/officeZones";
import { animationForState } from "../lib/agentStateAnimation";
import { spritesheetUrlFor, isPetAvailable } from "../lib/codexPetSprites";

interface Props {
  agent: Agent | null;
  onClose: () => void;
}

const STATE_COLORS: Record<string, string> = {
  Focused: "#3b82f6",
  Thinking: "#a855f7",
  "In Meeting": "#ec4899",
  Reviewing: "#22d3ee",
  Blocked: "#ef4444",
  Shipping: "#22c55e",
  Idle: "#94a3b8",
  Escalating: "#f97316",
  Learning: "#14b8a6",
  Collaborating: "#eab308",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{children}</span>
    </div>
  );
}

export default function AgentInspector({ agent, onClose }: Props) {
  if (!agent) return null;
  const mapping = getAgentPet(agent.id);
  const accent = mapping?.accent ?? "#3b82f6";
  const emoji = mapping?.emoji ?? "•";
  const zone = getZone(agent.zone);
  const anim = animationForState(agent.state);
  const stateColor = STATE_COLORS[agent.state] ?? "#94a3b8";
  const available = isPetAvailable(agent.petSlug);

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        width: 280,
        background: "rgba(14,19,34,0.92)",
        border: "1px solid var(--border-soft)",
        borderRadius: 12,
        padding: 14,
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{agent.name}</div>
          <div style={{ fontSize: 11.5, color: accent, fontWeight: 600 }}>
            {emoji} {agent.role}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: "2px 8px" }} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Sprite preview */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          height: 110,
          margin: "10px 0",
          background:
            "radial-gradient(ellipse at center bottom, rgba(59,130,246,0.12), transparent 70%)",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <CodexPetSprite
          petSlug={agent.petSlug}
          state={anim}
          size={64}
          isSelected
          accent={accent}
          variant={
            mapping?.variant
              ? {
                  hue: mapping.variant.hue,
                  brightness: mapping.variant.brightness,
                  saturate: mapping.variant.saturate,
                }
              : undefined
          }
          accessory={mapping?.variant?.accessory}
          statusRing={accent}
          scale={mapping?.scale ?? 1}
        />
      </div>

      <Row label="State">
        <span
          className="chip"
          style={{ background: `${stateColor}22`, borderColor: `${stateColor}88`, color: stateColor }}
        >
          {agent.state}
        </span>
      </Row>
      <Row label="Zone">{zone?.name ?? agent.zone}</Row>
      <Row label="Task">
        <span style={{ maxWidth: 160, display: "inline-block" }}>{agent.task}</span>
      </Row>
      <Row label="Energy">
        <EnergyBar value={agent.energy} />
      </Row>
      <Row label="Animation">
        <code style={{ fontSize: 11 }}>{anim}</code>
      </Row>
      <Row label="Pet">
        <span style={{ fontSize: 11.5 }}>
          {agent.petSlug}{" "}
          <span style={{ color: available ? "#22c55e" : "#ef4444", fontSize: 10 }}>
            {available ? "✓ local" : "✗ missing"}
          </span>
        </span>
      </Row>
      <Row label="Sprite source">
        <code style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {available ? spritesheetUrlFor(agent.petSlug) : "—"}
        </code>
      </Row>
      <Row label="Next action">{agent.nextAction}</Row>
    </div>
  );
}

function EnergyBar({ value }: { value: number }) {
  const color = value > 60 ? "#22c55e" : value > 30 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 70,
          height: 6,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${value}%`, height: "100%", background: color }} />
      </div>
      <span style={{ fontSize: 11 }}>{value}%</span>
    </div>
  );
}
