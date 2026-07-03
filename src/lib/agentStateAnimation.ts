/**
 * Maps an agent's runtime state to a Codex Pet animation alias.
 *
 * Per spec mapping:
 *   Focused      -> idle / working
 *   Thinking     -> thinking / idle
 *   In Meeting   -> wave / review
 *   Reviewing    -> review
 *   Blocked      -> failed
 *   Shipping     -> jump
 *   Idle         -> idle
 *   Escalating   -> failed / wave
 *   Learning     -> review / idle
 *   Collaborating-> wave
 */
import type { CodexPetAnimationAlias } from "../types/codexPet";
import type { AgentState } from "../types";

const STATE_TO_ANIM: Record<AgentState, CodexPetAnimationAlias> = {
  Focused: "working",
  Thinking: "thinking",
  "In Meeting": "wave",
  Reviewing: "review",
  Blocked: "failed",
  Shipping: "jump",
  Idle: "idle",
  Escalating: "failed",
  Learning: "review",
  Collaborating: "wave",
};

export function animationForState(state: AgentState): CodexPetAnimationAlias {
  return STATE_TO_ANIM[state] ?? "idle";
}

/** Whether an agent state should be drawn "walking" (bobs the sprite). */
export function isWalkingState(state: AgentState): boolean {
  return state === "Shipping" || state === "Collaborating";
}
