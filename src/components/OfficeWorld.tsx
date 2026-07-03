/**
 * OfficeWorld — the main isometric office view. (v0.6: smooth agent movement)
 *
 * Composes: floor + zones + furniture + agents, with:
 *   - responsive auto-scaling to fit the viewport
 *   - depth sorting (z-index = renderX + renderY)
 *   - agent selection + zone selection
 *   - role/state filters (dim non-matching agents)
 *   - a requestAnimationFrame loop that interpolates each agent's render
 *     position toward its grid target, so movement is visibly smooth.
 *
 * The rAF loop mutates the agent objects' renderX/renderY in place (the agents
 * array is owned by App and passed down; we treat the per-agent visual fields
 * as mutable render state). A frame counter forces re-renders at ~33fps so the
 * DOM positions update every frame.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Agent, OfficeZone, AgentRole, AgentState } from "../types";
import OfficeFloor, { computeSceneBounds } from "./OfficeFloor";
import FurnitureLayer from "./FurnitureLayer";
import AgentSprite from "./AgentSprite";
import { DEFAULT_TILE, type TileSize } from "../lib/isometric";
import { stepMovement } from "../lib/agentMovement";

interface Props {
  agents: Agent[];
  selectedAgentId: string | null;
  selectedZoneId: string | null;
  roleFilter: AgentRole | null;
  stateFilter: AgentState | null;
  showLabels: boolean;
  onSelectAgent: (a: Agent) => void;
  onSelectZone: (z: OfficeZone | null) => void;
}

export default function OfficeWorld({
  agents,
  selectedAgentId,
  selectedZoneId,
  roleFilter,
  stateFilter,
  showLabels,
  onSelectAgent,
  onSelectZone,
}: Props) {
  const tile: TileSize = DEFAULT_TILE;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const bounds = useMemo(() => computeSceneBounds(tile), [tile]);
  const { originX, originY, width, height } = bounds;

  // Responsive scaling: fit the scene inside the viewport with padding.
  useLayoutEffect(() => {
    function fit() {
      const el = stageRef.current;
      if (!el) return;
      const padding = 32;
      const availW = el.clientWidth - padding * 2;
      const availH = el.clientHeight - padding * 2;
      const s = Math.min(availW / width, availH / height);
      setScale(Math.max(0.35, Math.min(2.2, s)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height]);

  // ---- Movement loop: interpolate render positions every frame ------------
  // We keep a stable ref to the latest agents so the rAF closure always reads
  // current data without re-subscribing each render.
  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  const [, setFrame] = useState(0);
  const lastTs = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function loop(ts: number) {
      if (lastTs.current === null) lastTs.current = ts;
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000); // clamp dt
      lastTs.current = ts;
      // Step the visual movement. Only re-render if something actually moved
      // (avoids burning a frame when the office is fully still).
      const before = agentsRef.current.some((a) => a.isMoving);
      stepMovement(agentsRef.current, dt);
      const after = agentsRef.current.some((a) => a.isMoving);
      if (before || after) {
        setFrame((f) => (f + 1) % 1000000);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTs.current = null;
    };
  }, []);

  // Agents sorted back-to-front by RENDER position for painter's algorithm.
  const sortedAgents = useMemo(
    () =>
      [...agents].sort(
        (a, b) => a.renderX + a.renderY - (b.renderX + b.renderY)
      ),
    // Re-sort whenever agents identity changes OR a frame advanced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents]
  );

  // Clicking empty floor deselects everything.
  function handleStageClick() {
    onSelectZone(null);
  }

  const spriteSize = 64;
  const labelsReadable = scale > 0.7;
  const effectiveShowLabels = showLabels && labelsReadable;

  return (
    <div ref={stageRef} className="iso-stage" onClick={handleStageClick}>
      <div
        className="iso-scene"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <OfficeFloor
          tile={tile}
          originX={originX}
          originY={originY}
          selectedZoneId={selectedZoneId}
          onSelectZone={(z) => onSelectZone(z)}
          highlightedZoneIds={
            roleFilter || stateFilter
              ? new Set(
                  agents
                    .filter(
                      (a) =>
                        (!roleFilter || a.role === roleFilter) &&
                        (!stateFilter || a.state === stateFilter)
                    )
                    .map((a) => a.zone)
                )
              : undefined
          }
        />
        <FurnitureLayer tile={tile} originX={originX} originY={originY} />
        {sortedAgents.map((agent) => {
          const matchesFilter =
            (!roleFilter || agent.role === roleFilter) &&
            (!stateFilter || agent.state === stateFilter);
          const isDimmed =
            (roleFilter !== null || stateFilter !== null) && !matchesFilter;
          return (
            <AgentSprite
              key={agent.id}
              agent={agent}
              tile={tile}
              originX={originX}
              originY={originY}
              size={spriteSize}
              isSelected={selectedAgentId === agent.id}
              isDimmed={isDimmed}
              showLabels={effectiveShowLabels}
              onSelect={onSelectAgent}
            />
          );
        })}
      </div>
    </div>
  );
}
