/**
 * OfficeSceneV2Lighting — premium lighting system, split into two layers.
 *
 * The scene renders lighting TWICE:
 *   - layer="underlay" (before furniture/agents): zone ceiling spotlights +
 *     command center floor reflection. These sit ON the floor, below objects.
 *   - layer="overlay" (after furniture/agents): per-agent monitor glow that
 *     pulses above everything, like a real screen lighting up a workstation.
 *
 * Three light types:
 *   1. Ceiling spotlights per zone — warm pools that make each zone feel lit.
 *   2. Command center floor reflection — blue glow cast ON the floor.
 *   3. Per-agent monitor glow — pulsing light when an agent works at a desk.
 */
import { memo } from "react";
import type { Agent } from "../types";
import type { AgentMotion } from "../lib/agentMovement";
import { V2_ZONES } from "../data/officeSceneV2Layout";
import { gridCenterToScreen, gridRectBounds, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  agents: Agent[];
  motions: Map<string, AgentMotion | undefined>;
  tile?: TileSize;
  originX: number;
  originY: number;
  frame: number;
  /** "underlay" renders below furniture; "overlay" renders above (agent glows). */
  layer: "underlay" | "overlay";
}

const GLOW_ACTIVITIES = new Set([
  "desk-work",
  "screen-review",
  "command-monitoring",
  "qa-test",
  "engineering",
  "command-center",
  "research",
  "finance-legal",
]);

/** Zone spotlight colors — each zone type gets a distinct warm/cool light. */
const ZONE_LIGHT: Record<string, { color: string; intensity: number }> = {
  "command-center": { color: "34,211,238", intensity: 0.14 },
  "engineering-pods": { color: "96,165,250", intensity: 0.08 },
  "open-workspace": { color: "255,210,140", intensity: 0.08 },
  "strategy-room": { color: "168,85,247", intensity: 0.09 },
  "research-library": { color: "34,211,238", intensity: 0.07 },
  "break-area": { color: "251,191,36", intensity: 0.10 },
  "finance-desk": { color: "132,204,22", intensity: 0.07 },
  "reception": { color: "245,158,11", intensity: 0.09 },
};

function OfficeSceneV2LightingImpl({
  agents,
  motions,
  tile = DEFAULT_TILE,
  originX,
  originY,
  layer,
}: Props) {
  if (layer === "overlay") {
    // Per-agent monitor glow — pulsing above furniture
    const agentGlows: { left: number; top: number; color: string; key: string }[] = [];
    for (const a of agents) {
      const m = motions.get(a.id);
      if (m?.isMoving) continue;
      if (!GLOW_ACTIVITIES.has(a.activity ?? "desk-work")) continue;
      const mx = a.gridX;
      const my = a.gridY - 1;
      const pos = gridCenterToScreen(mx, my, tile);
      const accent =
        a.activity === "command-center" || a.activity === "command-monitoring"
          ? "#22d3ee"
          : a.activity === "qa" || a.activity === "qa-test"
          ? "#f97316"
          : "#60a5fa";
      agentGlows.push({ left: pos.x - originX, top: pos.y - originY, color: accent, key: a.id });
    }
    return (
      <>
        {agentGlows.map((g) => (
          <div
            key={g.key}
            style={{
              position: "absolute",
              left: g.left,
              top: g.top,
              width: 28,
              height: 28,
              transform: "translate(-50%, -85%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${g.color}cc 0%, ${g.color}33 45%, transparent 75%)`,
              filter: "blur(1px)",
              pointerEvents: "none",
              zIndex: 999,
              animation: "monitorPulse 2.4s ease-in-out infinite",
            }}
          />
        ))}
      </>
    );
  }

  // === UNDERLAY: zone spotlights + command reflection (below furniture) ===

  // Layer 1: Ceiling spotlights — warm pools of light per zone
  const spotlights = V2_ZONES.map((z) => {
    const bounds = gridRectBounds(z.rect, tile);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const light = ZONE_LIGHT[z.id] ?? { color: "255,200,120", intensity: 0.08 };
    return {
      left: cx - originX,
      top: cy - originY,
      w: bounds.width * 1.1,
      h: bounds.height * 1.3,
      color: light.color,
      intensity: light.intensity,
      key: z.id,
    };
  });

  // Layer 2: Command center floor reflection — blue light spilling onto floor
  const cmdZone = V2_ZONES.find((z) => z.id === "command-center");
  const cmdReflection = cmdZone
    ? (() => {
        const bounds = gridRectBounds(cmdZone.rect, tile);
        return {
          left: (bounds.minX + bounds.maxX) / 2 - originX,
          top: bounds.minY + bounds.height * 0.35 - originY,
          w: bounds.width * 0.8,
          h: bounds.height * 0.5,
        };
      })()
    : null;

  return (
    <>
      {/* Layer 1: Ceiling spotlights */}
      {spotlights.map((s) => (
        <div
          key={s.key}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.w,
            height: s.h,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse at center, rgba(${s.color},${s.intensity}) 0%, rgba(${s.color},${s.intensity * 0.3}) 40%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 5,
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* Layer 2: Command center floor reflection */}
      {cmdReflection && (
        <div
          style={{
            position: "absolute",
            left: cmdReflection.left,
            top: cmdReflection.top,
            width: cmdReflection.w,
            height: cmdReflection.h,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center top, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.06) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 6,
            mixBlendMode: "screen",
            filter: "blur(3px)",
          }}
        />
      )}
    </>
  );
}

export const OfficeSceneV2Lighting = memo(OfficeSceneV2LightingImpl, (p, n) =>
  p.frame === n.frame && p.layer === n.layer
);
export default OfficeSceneV2Lighting;
