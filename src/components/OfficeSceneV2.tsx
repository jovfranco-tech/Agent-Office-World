/**
 * OfficeSceneV2 — the new main scene (parallel to OfficeWorld).
 *
 * Same movement architecture (owns AgentMotionStore, rAF loop, frame-busted
 * memo) but renders an entirely different, denser, more premium office via the
 * V2 layout + Iso* furniture components.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Agent, OfficeZone, AgentRole, AgentState } from "../types";
import OfficeSceneV2Floor, { computeV2SceneBounds } from "./OfficeSceneV2Floor";
import OfficeSceneV2Furniture from "./OfficeSceneV2Furniture";
import OfficeSceneV2Lighting from "./OfficeSceneV2Lighting";
import AgentSprite from "./AgentSprite";
import { DEFAULT_TILE, type TileSize } from "../lib/isometric";
import { AgentMotionStore } from "../lib/agentMovement";

interface Props {
  agents: Agent[];
  selectedAgentId: string | null;
  selectedZoneId: string | null;
  roleFilter: AgentRole | null;
  stateFilter: AgentState | null;
  showLabels: boolean;
  showcase?: boolean;
  onSelectAgent: (a: Agent) => void;
  onSelectZone: (z: OfficeZone | null) => void;
}

export default function OfficeSceneV2({
  agents,
  selectedAgentId,
  selectedZoneId: _selectedZoneId,
  roleFilter,
  stateFilter,
  showLabels,
  showcase = false,
  onSelectAgent,
  onSelectZone,
}: Props) {
  const tile: TileSize = DEFAULT_TILE;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const bounds = useMemo(() => computeV2SceneBounds(tile), [tile]);
  const { originX, originY, width, height } = bounds;

  // Persistent motion store (same pattern as OfficeWorld v0.7).
  const storeRef = useRef<AgentMotionStore | null>(null);
  if (storeRef.current === null) storeRef.current = new AgentMotionStore();
  const store = storeRef.current;

  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  store.sync(agents, Date.now());

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

  // Responsive scaling. Showcase mode uses less padding for a bigger view.
  useLayoutEffect(() => {
    function fit() {
      const el = stageRef.current;
      if (!el) return;
      const padding = showcase ? 16 : 32;
      const availW = el.clientWidth - padding * 2;
      const availH = el.clientHeight - padding * 2;
      const s = Math.min(availW / width, availH / height);
      setScale(Math.max(0.4, Math.min(2.5, s)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height, showcase]);

  // Build motion map for lighting.
  const motionMap = new Map<string, ReturnType<AgentMotionStore["get"]>>();
  for (const a of agents) motionMap.set(a.id, store.get(a.id));

  // Sort agents back-to-front by rendered position.
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const ma = store.get(a.id);
      const mb = store.get(b.id);
      const ay = ma ? ma.renderX + ma.renderY : a.gridX + a.gridY;
      const by = mb ? mb.renderX + mb.renderY : b.gridX + b.gridY;
      return ay - by;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, frame]);

  function handleStageClick() {
    onSelectZone(null);
  }

  const spriteSize = 42;
  const labelsReadable = scale > 0.65;
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
        <OfficeSceneV2Floor tile={tile} originX={originX} originY={originY} />
        <OfficeSceneV2Furniture tile={tile} originX={originX} originY={originY} />
        <OfficeSceneV2Lighting
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
