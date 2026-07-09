/**
 * OfficeSceneV2Lighting — focal glow for the V2 scene.
 *
 * Draws soft radial glows under key zones (command center blue, open workspace
 * blue, break area warm) and per-agent monitor glow when an agent is working
 * at a desk. Integrates the old MonitorGlow concept but in the V2 coordinate
 * space.
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

function OfficeSceneV2LightingImpl({
  agents,
  motions,
  tile = DEFAULT_TILE,
  originX,
  originY,
}: Props) {
  // Zone-level focal glows
  const zoneGlows = V2_ZONES.filter(
    (z) =>
      z.id === "command-center" ||
      z.id === "open-workspace" ||
      z.id === "break-area"
  ).map((z) => {
    const bounds = gridRectBounds(z.rect, tile);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const color =
      z.id === "command-center"
        ? "rgba(34,211,238,0.15)"
        : z.id === "break-area"
        ? "rgba(250,220,150,0.10)"
        : "rgba(96,165,250,0.08)";
    return { left: cx - originX, top: cy - originY, w: bounds.width, h: bounds.height, color, key: z.id };
  });

  // Per-agent monitor glow (when settled and working)
  const agentGlows: { left: number; top: number; color: string; key: string }[] = [];
  for (const a of agents) {
    const m = motions.get(a.id);
    if (m?.isMoving) continue;
    if (!GLOW_ACTIVITIES.has(a.activity ?? "desk-work")) continue;
    const mx = a.gridX;
    const my = a.gridY - 1; // monitor is behind the agent
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
      {/* Zone focal glows */}
      {zoneGlows.map((g) => (
        <div
          key={g.key}
          style={{
            position: "absolute",
            left: g.left,
            top: g.top,
            width: g.w,
            height: g.h,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse at center, ${g.color} 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      ))}
      {/* Per-agent monitor glow */}
      {agentGlows.map((g) => (
        <div
          key={g.key}
          style={{
            position: "absolute",
            left: g.left,
            top: g.top,
            width: 24,
            height: 24,
            transform: "translate(-50%, -85%)",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${g.color}bb 0%, ${g.color}33 45%, transparent 75%)`,
            filter: "blur(1px)",
            pointerEvents: "none",
            zIndex: 150,
            animation: "monitorPulse 2.4s ease-in-out infinite",
          }}
        />
      ))}
    </>
  );
}

export const OfficeSceneV2Lighting = memo(OfficeSceneV2LightingImpl, (p, n) => p.frame === n.frame);
export default OfficeSceneV2Lighting;
