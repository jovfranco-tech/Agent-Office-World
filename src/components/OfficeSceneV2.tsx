/**
 * OfficeSceneV2 — the new main scene (parallel to OfficeWorld).
 *
 * Same movement architecture (owns AgentMotionStore, rAF loop, frame-busted
 * memo) but renders an entirely different, denser, more premium office via the
 * V2 layout + Iso* furniture components.
 *
 * KEY FIX for 9+: UNIFIED DEPTH SORT. Furniture and agents are merged into
 * a single back-to-front painter's pass. Previously agents used zIndex
 * 1000+depth which made them ALWAYS render above furniture — even furniture in
 * the foreground that should occlude them. Now an agent behind a desk renders
 * behind that desk, and an agent in front renders in front. This is the
 * single biggest realism improvement.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Agent, OfficeZone, AgentRole, AgentState } from "../types";
import OfficeSceneV2Floor, { computeV2SceneBounds } from "./OfficeSceneV2Floor";
import { FurnitureItem } from "./OfficeSceneV2Furniture";
import OfficeSceneV2Lighting from "./OfficeSceneV2Lighting";
import AgentSprite from "./AgentSprite";
import { DEFAULT_TILE, type TileSize } from "../lib/isometric";
import { AgentMotionStore } from "../lib/agentMovement";
import { V2_FURNITURE, type V2Furniture } from "../data/officeSceneV2Layout";

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

/** A renderable item in the unified depth sort — either furniture or an agent. */
type SceneItem =
  | { kind: "furniture"; f: V2Furniture; depth: number }
  | { kind: "agent"; agent: Agent; depth: number };

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
      setScale(Math.max(0.5, Math.min(3.0, s)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height, showcase]);

  // Build motion map for lighting.
  const motionMap = new Map<string, ReturnType<AgentMotionStore["get"]>>();
  for (const a of agents) motionMap.set(a.id, store.get(a.id));

  // === UNIFIED DEPTH SORT: merge furniture + agents into one back-to-front list.
  // Furniture depth = x+y (grid). Agent depth = renderX+renderY (interpolated,
  // so an agent walking toward the camera correctly moves "forward" in z-order).
  // Both share the same zIndex scale, so foreground furniture occludes agents
  // that are behind it — the critical realism fix.
  const items: SceneItem[] = useMemo(() => {
    const furnitureItems: SceneItem[] = V2_FURNITURE.map((f) => ({
      kind: "furniture" as const,
      f,
      depth: f.x + f.y,
    }));
    const agentItems: SceneItem[] = agents.map((a) => {
      const m = store.get(a.id);
      const d = m ? m.renderX + m.renderY : a.gridX + a.gridY;
      return { kind: "agent" as const, agent: a, depth: d };
    });
    // Sort back-to-front. Ties: agents render in front of furniture at the same
    // depth (agent "stands" on the cell). Use 0.5 nudge so a 1-tall sprite
    // occupying cell (x,y) sorts behind an agent standing at (x,y).
    return [...furnitureItems, ...agentItems].sort((a, b) => {
      const da = a.kind === "agent" ? a.depth + 0.4 : a.depth;
      const db = b.kind === "agent" ? b.depth + 0.4 : b.depth;
      return da - db;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, frame, V2_FURNITURE]);

  function handleStageClick() {
    onSelectZone(null);
  }

  const spriteSize = 56;
  const labelsReadable = scale > 0.65;
  const effectiveShowLabels = showLabels && labelsReadable;

  return (
    <div ref={stageRef} className="iso-stage" onClick={handleStageClick}>
      <div
        className="iso-scene iso-scene-hero"
        style={{
          width,
          height,
          // @ts-expect-error CSS custom property
          "--target-scale": scale,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <OfficeSceneV2Floor tile={tile} originX={originX} originY={originY} />

        {/* Lighting underlay: zone spotlights + command reflection (below furniture) */}
        <OfficeSceneV2Lighting
          agents={agents}
          motions={motionMap}
          tile={tile}
          originX={originX}
          originY={originY}
          frame={frame}
          layer="underlay"
        />

        {/* === UNIFIED DEPTH-SORTED PASS: furniture + agents interleaved === */}
        {items.map((item, i) => {
          // zIndex = index in the sorted list. Smaller index = behind.
          const zIndex = i + 10;
          if (item.kind === "furniture") {
            return (
              <FurnitureItem
                key={`f-${item.f.id}`}
                f={item.f}
                tile={tile}
                originX={originX}
                originY={originY}
                zIndex={zIndex}
              />
            );
          }
          const agent = item.agent;
          const matchesFilter =
            (!roleFilter || agent.role === roleFilter) &&
            (!stateFilter || agent.state === stateFilter);
          const isDimmed =
            (roleFilter !== null || stateFilter !== null) && !matchesFilter;
          const motion = store.get(agent.id);
          return (
            <AgentSprite
              key={`a-${agent.id}`}
              agent={agent}
              motion={motion}
              frame={frame}
              tile={tile}
              originX={originX}
              originY={originY}
              size={spriteSize}
              zIndex={zIndex}
              isSelected={selectedAgentId === agent.id}
              isDimmed={isDimmed}
              showLabels={effectiveShowLabels}
              onSelect={onSelectAgent}
            />
          );
        })}

        {/* Lighting overlay: per-agent monitor glow (above everything) */}
        <OfficeSceneV2Lighting
          agents={agents}
          motions={motionMap}
          tile={tile}
          originX={originX}
          originY={originY}
          frame={frame}
          layer="overlay"
        />
      </div>
      {/* Atmospheric vignette — frames the office, adds cinematic depth */}
      <div
        className="scene-vignette"
        style={{
          borderRadius: 0,
        }}
      />
    </div>
  );
}
