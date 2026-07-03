/**
 * ControlBar — top controls for the simulation + filters.
 *
 * Buttons: Simulate 1 Hour, Start/Pause Live Mode, Reset Day.
 * Filters: role, state. Toggles: labels.
 */
import type { AgentRole, AgentState } from "../types";
import { ROLE_FILTERS } from "../data/codexPetsManifest";

interface Props {
  liveMode: boolean;
  onSimulateHour: () => void;
  onToggleLive: () => void;
  onResetDay: () => void;
  roleFilter: AgentRole | null;
  stateFilter: AgentState | null;
  onRoleFilter: (r: AgentRole | null) => void;
  onStateFilter: (s: AgentState | null) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  hour: number;
}

const STATES: AgentState[] = [
  "Focused",
  "Thinking",
  "In Meeting",
  "Reviewing",
  "Blocked",
  "Shipping",
  "Idle",
  "Escalating",
  "Learning",
  "Collaborating",
];

const selectStyle: React.CSSProperties = {
  background: "var(--bg-panel-2)",
  border: "1px solid var(--border-soft)",
  color: "var(--text-primary)",
  borderRadius: 8,
  padding: "6px 8px",
  fontSize: 12,
  cursor: "pointer",
};

export default function ControlBar({
  liveMode,
  onSimulateHour,
  onToggleLive,
  onResetDay,
  roleFilter,
  stateFilter,
  onRoleFilter,
  onStateFilter,
  showLabels,
  onToggleLabels,
  hour,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        padding: "8px 12px",
        background: "rgba(14,19,34,0.85)",
        borderBottom: "1px solid var(--border-soft)",
        backdropFilter: "blur(8px)",
      }}
      className="no-tap"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
          }}
        >
          🏢
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>Agent Office World</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Day hour {hour}:00</div>
        </div>
      </div>

      <button className="btn" onClick={onSimulateHour} title="Advance the simulation by one hour">
        ⏩ Simulate 1 Hour
      </button>
      <button
        className={liveMode ? "btn" : "btn btn-primary"}
        onClick={onToggleLive}
        title={liveMode ? "Pause live simulation" : "Start live simulation"}
      >
        {liveMode ? (
          <>⏸ Pause</>
        ) : (
          <>
            <span className="live-dot" /> Start Live Mode
          </>
        )}
      </button>
      <button className="btn" onClick={onResetDay} title="Reset to start of day">
        ↺ Reset Day
      </button>

      <div style={{ width: 1, height: 22, background: "var(--border-soft)", margin: "0 4px" }} />

      <select
        style={selectStyle}
        value={roleFilter ?? ""}
        onChange={(e) => onRoleFilter((e.target.value || null) as AgentRole | null)}
        title="Filter by role"
      >
        <option value="">All roles</option>
        {ROLE_FILTERS.map((r) => (
          <option key={r.role} value={r.role}>
            {r.emoji} {r.role}
          </option>
        ))}
      </select>

      <select
        style={selectStyle}
        value={stateFilter ?? ""}
        onChange={(e) => onStateFilter((e.target.value || null) as AgentState | null)}
        title="Filter by state"
      >
        <option value="">All states</option>
        {STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        className="btn"
        onClick={onToggleLabels}
        style={showLabels ? { borderColor: "#3b82f6", color: "#93c5fd" } : undefined}
        title="Toggle floating labels"
      >
        {showLabels ? "🏷 Labels on" : "🏷 Labels off"}
      </button>
    </div>
  );
}
