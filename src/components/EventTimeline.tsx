/**
 * EventTimeline — compact, recent-events feed shown in the side panel.
 */
import type { OfficeEvent } from "../types";
import { accentFor } from "../data/codexPetsManifest";

interface Props {
  events: OfficeEvent[];
}

const KIND_COLORS: Record<OfficeEvent["kind"], string> = {
  info: "#60a5fa",
  success: "#22c55e",
  warning: "#f59e0b",
  risk: "#ef4444",
};

const KIND_GLYPH: Record<OfficeEvent["kind"], string> = {
  info: "•",
  success: "✓",
  warning: "!",
  risk: "⚠",
};

export default function EventTimeline({ events }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {events.length === 0 && (
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", padding: "4px 0" }}>
          No events yet. Start Live Mode or Simulate 1 Hour.
        </div>
      )}
      {events.slice(0, 12).map((e) => {
        const color = KIND_COLORS[e.kind];
        const accent = accentFor(e.role);
        return (
          <div
            key={e.id}
            className="event-row"
            style={{
              display: "flex",
              gap: 8,
              padding: "5px 7px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
              fontSize: 11.5,
            }}
          >
            <span
              style={{
                color,
                fontWeight: 800,
                width: 12,
                flexShrink: 0,
                textAlign: "center",
              }}
              title={e.kind}
            >
              {KIND_GLYPH[e.kind]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>
                <span style={{ color: accent }}>{e.agentName}</span>{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                  {e.message}
                </span>
              </div>
              <div style={{ fontSize: 9.5, color: "var(--text-muted)" }}>
                {e.role} · {e.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
