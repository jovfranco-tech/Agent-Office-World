/**
 * MonitorGlow — v0.8
 *
 * When an agent is working at a desk (activity desk-work / screen-review /
 * command-monitoring) and is NOT moving, the monitor in front of it lights up
 * with a soft blue glow. This is the key effect that makes the office feel
 * like people are actually working, not just standing around.
 *
 * The monitor sits one cell "behind" the agent (gridY-1), matching the
 * workstation layout (desk+monitor at y, chair/sit at y+1). We render a glow
 * disc at the monitor's screen position. The glow is re-derived every frame
 * from the agents list + motion store.
 */
import { memo } from "react";
import type { Agent } from "../types";
import type { AgentMotion } from "../lib/agentMovement";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";

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
]);

function MonitorGlowImpl({
  agents,
  motions,
  tile = DEFAULT_TILE,
  originX,
  originY,
}: Props) {
  const glows: { left: number; top: number; color: string; key: string }[] = [];
  for (const a of agents) {
    const m = motions.get(a.id);
    if (m?.isMoving) continue; // only glow when settled and working
    if (!GLOW_ACTIVITIES.has(a.activity ?? "desk-work")) continue;
    // Monitor is one cell behind the agent.
    const mx = a.gridX;
    const my = a.gridY - 1;
    const pos = gridCenterToScreen(mx, my, tile);
    const accent =
      a.activity === "command-monitoring"
        ? "#22d3ee"
        : a.activity === "qa-test"
        ? "#f97316"
        : "#60a5fa";
    glows.push({
      left: pos.x - originX,
      top: pos.y - originY,
      color: accent,
      key: a.id,
    });
  }

  return (
    <>
      {glows.map((g) => (
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
            zIndex: 150,
            animation: "monitorPulse 2.4s ease-in-out infinite",
          }}
        />
      ))}
    </>
  );
}

export const MonitorGlow = memo(MonitorGlowImpl, (p, n) => p.frame === n.frame);
export default MonitorGlow;
