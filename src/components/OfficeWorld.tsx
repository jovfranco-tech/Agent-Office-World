/**
 * OfficeWorld — the main isometric office view. (v0.7: smooth, no-teleport motion)
 *
 * Movement/visual state lives in a PERSISTENT AgentMotionStore owned here via a
 * ref. It survives React snapshots (which only carry target grid positions).
 * Every frame the rAF loop steps the store with easeInOutCubic interpolation;
 * while anyone is moving, OfficeWorld re-renders and passes a fresh `frame`
 * value + the agent's interpolated render position to AgentSprite.
 *
 * This is the fix for the v0.6 teleport: motion no longer mutates snapshot
 * objects (which were replaced every tick), and AgentSprite re-renders every
 * frame via the `frame` prop so memo can't skip it.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Agent, OfficeZone, AgentRole, AgentState } from "../types";
import OfficeFloor, { computeSceneBounds } from "./OfficeFloor";
import FurnitureLayer from "./FurnitureLayer";
import AgentSprite from "./AgentSprite";
import MonitorGlow from "./MonitorGlow";
import { DEFAULT_TILE, type TileSize } from "../lib/isometric";
import { AgentMotionStore } from "../lib/agentMovement";

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

  // Persistent motion store — survives across renders/snapshots.
  const storeRef = useRef<AgentMotionStore | null>(null);
  if (storeRef.current === null) storeRef.current = new AgentMotionStore();
  const store = storeRef.current;

  // Keep a ref to the latest agents so the rAF closure reads current data.
  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  // Sync the store with the latest snapshot (adopts new targets) every render.
  store.sync(agents, Date.now());

  // Frame counter for re-renders (also passed to AgentSprite to bust memo).
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function loop() {
      const now = Date.now();
      store.step(now);
      if (store.anyMoving()) {
        setFrame((f) => (f + 1) % 1000000);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [store]);

  // Responsive scaling.
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

  // Agents sorted back-to-front by their RENDERED position (painter's algorithm).
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const ma = store.get(a.id);
      const mb = store.get(b.id);
      const ay = ma ? ma.renderX + ma.renderY : a.gridX + a.gridY;
      const by = mb ? mb.renderX + mb.renderY : b.gridX + b.gridY;
      return ay - by;
    });
    // Re-sort every frame while moving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, frame]);

  function handleStageClick() {
    onSelectZone(null);
  }

  // Build a motions map for MonitorGlow (cheap; rebuilt each frame).
  const motionMap = new Map<string, ReturnType<AgentMotionStore["get"]>>();
  for (const a of agents) motionMap.set(a.id, store.get(a.id));

  const spriteSize = 40;
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
        {/* Monitor glow: lights up the screen in front of each working agent */}
        <MonitorGlow
          agents={agents}
          motions={motionMap}
          tile={tile}
          originX={originX}
          originY={originY}
          frame={frame}
        />
        {sortedAgents.map((agent) => {
          const matchesFilter =
            (!roleFilter || agent.role === roleFilter) &&
            (!stateFilter || agent.state === stateFilter);
          const isDimmed =
            (roleFilter !== null || stateFilter !== null) && !matchesFilter;
          const motion = store.get(agent.id);
          return (
            <AgentSprite
              key={agent.id}
              agent={agent}
              motion={motion}
              frame={frame}
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
