/**
 * OfficeWorld — the main isometric office view.
 *
 * Composes: floor + zones + furniture + agents, with:
 *   - responsive auto-scaling to fit the viewport
 *   - depth sorting (z-index = gridX + gridY)
 *   - agent selection + zone selection
 *   - role/state filters (dim non-matching agents)
 *
 * The whole scene is wrapped in a scaled, centered container.
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Agent, OfficeZone, AgentRole, AgentState } from "../types";
import OfficeFloor, { computeSceneBounds } from "./OfficeFloor";
import FurnitureLayer from "./FurnitureLayer";
import AgentSprite from "./AgentSprite";
import { DEFAULT_TILE, type TileSize } from "../lib/isometric";

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
      const padding = 40;
      const availW = el.clientWidth - padding * 2;
      const availH = el.clientHeight - padding * 2;
      const s = Math.min(availW / width, availH / height);
      setScale(Math.max(0.3, Math.min(1.4, s)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height]);

  // Agents sorted back-to-front for consistent DOM order (painter's algorithm).
  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => a.gridX + a.gridY - (b.gridX + b.gridY)),
    [agents]
  );

  // Clicking empty floor deselects everything.
  function handleStageClick() {
    onSelectZone(null);
  }

  const spriteSize = 56;

  return (
    <div
      ref={stageRef}
      className="iso-stage"
      onClick={handleStageClick}
    >
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
          const isDimmed = (roleFilter !== null || stateFilter !== null) && !matchesFilter;
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
              showLabels={showLabels}
              onSelect={onSelectAgent}
            />
          );
        })}
      </div>
    </div>
  );
}
