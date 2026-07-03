/**
 * AgentSprite — v0.6.
 *
 * Positions an agent using its INTERPOLATED render position (renderX/renderY)
 * so movement is smooth. Passes movement + activity signals to CodexPetSprite
 * so the walk animation, facing, and activity effects all reflect real motion.
 *
 * NOTE: no CSS transition on left/top — the rAF loop in OfficeWorld updates
 * renderX/renderY every frame, so the DOM position is already smooth. Adding a
 * transition here would lag/double-smooth the motion.
 */
import { memo } from "react";
import type { Agent } from "../types";
import CodexPetSprite from "./CodexPetSprite";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";
import { animationForState } from "../lib/agentStateAnimation";
import { getAgentPet } from "../data/codexPetsManifest";
import { activityForState } from "../lib/agentMovement";

interface Props {
  agent: Agent;
  tile?: TileSize;
  originX: number;
  originY: number;
  size: number;
  isSelected: boolean;
  isDimmed: boolean;
  showLabels: boolean;
  onSelect: (agent: Agent) => void;
}

function AgentSpriteImpl({
  agent,
  tile = DEFAULT_TILE,
  originX,
  originY,
  size,
  isSelected,
  isDimmed,
  showLabels,
  onSelect,
}: Props) {
  // Render at the interpolated position (smoothed each frame by the rAF loop).
  const pos = gridCenterToScreen(agent.renderX, agent.renderY, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const depth = Math.round(agent.renderX + agent.renderY);
  const mapping = getAgentPet(agent.id);
  const accent = mapping?.accent ?? "#3b82f6";
  const animation = agent.animationOverride ?? animationForState(agent.state);
  const agentScale = mapping?.scale ?? 1;
  const activity = agent.activity ?? activityForState(agent.state);
  const isMoving = agent.isMoving === true;

  return (
    <div
      className="no-tap"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent);
      }}
      style={{
        position: "absolute",
        left,
        top,
        transform: "translate(-50%, -100%)",
        zIndex: 1000 + depth,
        cursor: "pointer",
        opacity: isDimmed ? 0.32 : 1,
        transition: "opacity 180ms ease",
      }}
      title={`${agent.name} — ${agent.role} (${agent.state}${isMoving ? ", moving" : ""})`}
    >
      <CodexPetSprite
        petSlug={agent.petSlug}
        state={animation}
        size={size}
        direction={agent.facing ?? "right"}
        isSelected={isSelected}
        walking={isMoving}
        accent={accent}
        variant={
          mapping?.variant
            ? {
                hue: mapping.variant.hue,
                brightness: mapping.variant.brightness,
                saturate: mapping.variant.saturate,
              }
            : undefined
        }
        accessory={mapping?.variant?.accessory}
        statusRing={accent}
        scale={agentScale}
        activity={activity}
        stateLabel={isMoving ? "walking" : agent.state}
        label={showLabels ? agent.name : undefined}
        role={showLabels ? agent.role : undefined}
      />
    </div>
  );
}

export const AgentSprite = memo(AgentSpriteImpl);
export default AgentSprite;
