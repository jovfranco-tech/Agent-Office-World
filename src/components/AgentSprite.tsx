/**
 * AgentSprite — v0.7 (no-teleport).
 *
 * Reads its interpolated position from a persistent AgentMotion object
 * (owned by OfficeWorld's store), NOT from the React snapshot. The `frame`
 * prop changes every animation frame while the office is moving, which busts
 * React.memo so this component re-renders and its DOM position updates each
 * frame — this is what makes motion visible instead of teleporting.
 */
import { memo } from "react";
import type { Agent } from "../types";
import type { AgentMotion } from "../lib/agentMovement";
import CodexPetSprite from "./CodexPetSprite";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";
import { animationForState } from "../lib/agentStateAnimation";
import { getAgentPet } from "../data/codexPetsManifest";
import { activityForState } from "../lib/agentMovement";

interface Props {
  agent: Agent;
  motion?: AgentMotion;
  /** Monotonic frame counter; changes every frame while moving (busts memo). */
  frame: number;
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
  motion,
  frame: _frame,
  tile = DEFAULT_TILE,
  originX,
  originY,
  size,
  isSelected,
  isDimmed,
  showLabels,
  onSelect,
}: Props) {
  // Render position comes from the motion store (interpolated), falling back
  // to the agent's logical grid position if motion isn't tracked yet.
  const rx = motion?.renderX ?? agent.gridX;
  const ry = motion?.renderY ?? agent.gridY;
  const pos = gridCenterToScreen(rx, ry, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const depth = Math.round(rx + ry);
  const mapping = getAgentPet(agent.id);
  const accent = mapping?.accent ?? "#3b82f6";
  const animation = agent.animationOverride ?? animationForState(agent.state);
  const agentScale = mapping?.scale ?? 1;
  const activity = agent.activity ?? activityForState(agent.state);
  const isMoving = motion?.isMoving === true;
  const facing = motion?.facing ?? agent.facing ?? "right";

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
        // No transition on left/top: position is set fresh every frame by the
        // rAF loop, so a CSS transition would fight the interpolation.
      }}
      title={`${agent.name} — ${agent.role} (${agent.state}${isMoving ? ", walking" : ""})`}
    >
      <CodexPetSprite
        petSlug={agent.petSlug}
        state={animation}
        size={size}
        direction={facing}
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

// memo with a custom comparator: re-render whenever frame, isSelected, motion
// identity, or key business fields change. The `frame` prop is the critical
// one — it bumps every animation frame so the DOM position updates smoothly.
export const AgentSprite = memo(AgentSpriteImpl, (prev, next) => {
  return (
    prev.frame === next.frame &&
    prev.isSelected === next.isSelected &&
    prev.isDimmed === next.isDimmed &&
    prev.showLabels === next.showLabels &&
    prev.size === next.size &&
    prev.motion === next.motion &&
    prev.agent === next.agent
  );
});
export default AgentSprite;
