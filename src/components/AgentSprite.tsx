/**
 * AgentSprite — v0.2.
 *
 * Positions an agent on the isometric floor and renders its Codex Pet sprite
 * with the animation matching the agent's state, PLUS the per-agent variant
 * (tint), accessory glyph, and scale from the manifest — so every agent has a
 * strong, unique visual identity (not just a label).
 */
import { memo } from "react";
import type { Agent } from "../types";
import CodexPetSprite from "./CodexPetSprite";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";
import { animationForState } from "../lib/agentStateAnimation";
import { getAgentPet } from "../data/codexPetsManifest";

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
  const mapping = getAgentPet(agent.id);
  const accent = mapping?.accent ?? "#3b82f6";
  const animation = agent.animationOverride ?? animationForState(agent.state);
  const agentScale = mapping?.scale ?? 1;

  return (
    <div
      className="agent-mover no-tap"
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
        label={showLabels ? agent.name : undefined}
        role={showLabels ? agent.role : undefined}
      />
    </div>
  );
}

export const AgentSprite = memo(AgentSpriteImpl);
export default AgentSprite;
