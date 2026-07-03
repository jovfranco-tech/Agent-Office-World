/**
 * AgentSprite — positions an agent on the isometric floor and renders its
 * Codex Pet sprite with the animation matching the agent's state.
 *
 * The sprite is anchored so its feet sit on the grid cell; the ground shadow
 * (inside CodexPetSprite) grounds it. Depth-sorted via z-index.
 */
import { memo } from "react";
import type { Agent } from "../types";
import CodexPetSprite from "./CodexPetSprite";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";
import { animationForState } from "../lib/agentStateAnimation";
import { accentFor } from "../data/codexPetsManifest";

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
  const pos = gridCenterToScreen(agent.gridX, agent.gridY, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const depth = agent.gridX + agent.gridY;
  const accent = accentFor(agent.role);
  const animation = agent.animationOverride ?? animationForState(agent.state);

  return (
    <div
      className="agent-mover no-tap"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent);
      }}
      style={{
        position: "absolute",
        // Anchor: the agent's feet are at the cell center. The sprite renders
        // above this point, so translate up by ~size (sprite height ≈ size).
        left,
        top,
        transform: "translate(-50%, -100%)",
        zIndex: 1000 + depth, // agents always above floor/furniture
        cursor: "pointer",
        opacity: isDimmed ? 0.32 : 1,
        transition: "opacity 180ms ease",
      }}
      title={`${agent.name} — ${agent.role} (${agent.state})`}
    >
      <CodexPetSprite
        petSlug={agent.petSlug}
        state={animation}
        size={size}
        direction="right"
        isSelected={isSelected}
        walking={false}
        accent={accent}
        label={showLabels ? agent.name : undefined}
        role={showLabels ? agent.role : undefined}
      />
    </div>
  );
}

export const AgentSprite = memo(AgentSpriteImpl);
export default AgentSprite;
