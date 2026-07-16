/**
 * HumanAgentSprite — renders the Blender-generated 3D human sprites.
 *
 * Reads animated PNG strips from /sprites/agents3d/<id>_<anim>_<frame>.png
 * and advances frames via requestAnimationFrame for walk/idle cycles.
 *
 * The agent mapping (agentId → sprite id) is derived from the role/agent id
 * so each of the 21 agents gets its distinct color scheme.
 */
import { useEffect, useRef, useState } from "react";
import type { Agent } from "../types";
import type { AgentMotion } from "../lib/agentMovement";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";
import { memo } from "react";

interface Props {
  agent: Agent;
  motion?: AgentMotion;
  frame: number;
  tile?: TileSize;
  originX: number;
  originY: number;
  size: number;
  zIndex: number;
  isSelected: boolean;
  isDimmed: boolean;
  showLabels: boolean;
  onSelect: (agent: Agent) => void;
}

/** Map agent.id → sprite prefix used in /sprites/agents3d/ */
const AGENT_SPRITE_MAP: Record<string, string> = {
  "agent-ceo": "ceo",
  "agent-strategy": "strategy",
  "agent-pmo": "pmo",
  "agent-coding-1": "coding-1",
  "agent-coding-2": "coding-2",
  "agent-infra": "infra",
  "agent-automation": "automation",
  "agent-ops": "ops",
  "agent-support": "support",
  "agent-design": "design",
  "agent-product": "product",
  "agent-research": "research",
  "agent-data": "data",
  "agent-qa": "qa",
  "agent-finance": "finance",
  "agent-legal": "legal",
  "agent-security": "security",
  "agent-risk": "risk",
  "agent-docs": "docs",
  "agent-cs": "cs",
  "agent-sales": "sales",
};

const FRAME_COUNTS = { idle: 6, walk: 8 };
const FRAME_INTERVAL = 110; // ms per frame (~9fps, snappy walk)

function HumanAgentSpriteImpl({
  agent,
  motion,
  frame: _frame,
  tile = DEFAULT_TILE,
  originX,
  originY,
  size,
  zIndex,
  isSelected,
  isDimmed,
  showLabels,
  onSelect,
}: Props) {
  const rx = motion?.renderX ?? agent.gridX;
  const ry = motion?.renderY ?? agent.gridY;
  const pos = gridCenterToScreen(rx, ry, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const isMoving = motion?.isMoving === true;
  const facing = motion?.facing ?? agent.facing ?? "right";
  const anim = isMoving ? "walk" : "idle";

  const spriteId = AGENT_SPRITE_MAP[agent.id] ?? "ceo";

  // Frame animation state
  const [animFrame, setAnimFrame] = useState(1);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let raf: number;
    function loop(t: number) {
      if (t - lastTimeRef.current >= FRAME_INTERVAL) {
        lastTimeRef.current = t;
        setAnimFrame((f) => (f % FRAME_COUNTS[anim]) + 1);
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anim]);

  const frameStr = String(animFrame).padStart(2, "0");
  const src = `/sprites/agents3d/${spriteId}_${anim}_${frameStr}.png`;
  const flipX = facing === "left";

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
        zIndex,
        cursor: "pointer",
        opacity: isDimmed ? 0.32 : 1,
        transition: "opacity 180ms ease",
      }}
      title={`${agent.name} — ${agent.role} (${agent.state}${isMoving ? ", walking" : ""})`}
    >
      <img
        src={src}
        alt={agent.name}
        style={{
          width: size,
          height: size,
          imageRendering: "auto",
          display: "block",
          transform: flipX ? "scaleX(-1)" : undefined,
          // Color-grade to match the furniture's warm world (same filter family
          // as OfficeSceneV2Furniture: brightness/contrast/sepia/saturate).
          filter: isSelected
            ? `drop-shadow(0 0 6px ${agent.id.includes("security") ? "#22d3ee" : "#f59e0b"}cc) brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)`
            : "brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)",
        }}
        draggable={false}
      />
      {/* Selection ring on the floor */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            width: size * 0.5,
            height: size * 0.16,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            border: "2px solid #f59e0b",
            boxShadow: "0 0 10px rgba(245,158,11,0.6)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Name label */}
      {showLabels && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -6,
            transform: `translate(-50%, -100%)${flipX ? " scaleX(-1)" : ""}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 999,
              background: "rgba(10,14,26,0.82)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
            }}
          >
            {agent.name}
          </span>
        </div>
      )}
    </div>
  );
}

export const HumanAgentSprite = memo(HumanAgentSpriteImpl, (prev, next) => {
  return (
    prev.frame === next.frame &&
    prev.isSelected === next.isSelected &&
    prev.isDimmed === next.isDimmed &&
    prev.showLabels === next.showLabels &&
    prev.size === next.size &&
    prev.zIndex === next.zIndex &&
    prev.motion === next.motion &&
    prev.agent === next.agent
  );
});

export default HumanAgentSprite;
