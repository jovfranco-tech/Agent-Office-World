/**
 * agentMovement.ts — v0.6
 *
 * Two responsibilities:
 *   1. stepMovement(agents, dt) — interpolate each agent's render position
 *      toward its grid target so movement is SMOOTH (not teleport). Called
 *      every animation frame from OfficeWorld.
 *   2. scheduleActivities(agents, ratio) — the activity scheduler: pick a
 *      subset of agents (≈20-35%) and assign them new role-logical anchor
 *      destinations. Called on the Live Mode interval.
 */
import type { Agent, AgentState, OfficeZoneId, ActivityKind } from "../types";
import {
  ACTIVITY_ANCHORS,
  pickFreeAnchor,
  anchorOccupiedKey,
  type ActivityAnchor,
} from "../data/activityAnchors";

/** Map an agent's business state to an activity kind (drives visual effect). */
export function activityForState(state: AgentState): ActivityKind {
  switch (state) {
    case "In Meeting":
    case "Collaborating":
      return "meeting";
    case "Reviewing":
      return "screen-review";
    case "Blocked":
    case "Escalating":
      return "desk-work"; // stays at desk while blocked
    case "Shipping":
      return "desk-work";
    case "Idle":
      return "break";
    case "Learning":
      return "research";
    case "Thinking":
      return "desk-work";
    case "Focused":
    default:
      return "desk-work";
  }
}

/** The zone an agent's role "lives" in (where it returns between activities). */
export function homeZoneForRole(role: Agent["role"]): OfficeZoneId {
  switch (role) {
    case "CEO":
    case "PMO":
    case "Strategy":
      return "strategy-room";
    case "Coding":
    case "Infra":
    case "Automation":
      return "engineering-pods";
    case "QA":
      return "qa-lab";
    case "Security":
    case "Risk":
      return "command-center";
    case "Ops":
      return "command-center";
    case "Research":
    case "Data":
    case "Documentation":
      return "research-library";
    case "Finance":
    case "Legal/Compliance":
      return "finance-desk";
    case "Sales":
    case "Customer Success":
      return "client-success";
    case "Support":
      return "open-workspace";
    case "Design":
    case "Product":
      return "open-workspace";
    default:
      return "open-workspace";
  }
}

/**
 * Interpolate render positions toward grid targets.
 * @param dt delta time in seconds.
 * @param speed grid cells per second.
 */
export function stepMovement(agents: Agent[], dt: number, speed = 1.6): void {
  for (const a of agents) {
    const dx = a.gridX - a.renderX;
    const dy = a.gridY - a.renderY;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.02) {
      a.renderX = a.gridX;
      a.renderY = a.gridY;
      a.isMoving = false;
    } else {
      const step = Math.min(dist, speed * dt);
      a.renderX += (dx / dist) * step;
      a.renderY += (dy / dist) * step;
      a.isMoving = true;
      a.facing = dx < 0 ? "left" : "right";
    }
  }
}

/**
 * The activity scheduler. Assigns a subset (~ratio) of agents new anchor
 * destinations that make sense for their role. Returns an array of movement
 * event descriptions for the timeline.
 */
export function scheduleActivities(
  agents: Agent[],
  ratio = 0.28
): { agentId: string; agentName: string; fromZone: OfficeZoneId; toZone: OfficeZoneId; activity: ActivityKind }[] {
  const events: { agentId: string; agentName: string; fromZone: OfficeZoneId; toZone: OfficeZoneId; activity: ActivityKind }[] = [];
  // Build occupancy from current anchor assignments.
  const occupied = new Set<string>();
  for (const a of agents) {
    if (a.anchorId) {
      const an = ACTIVITY_ANCHORS.find((x) => x.id === a.anchorId);
      if (an) occupied.add(anchorOccupiedKey(an));
    }
  }

  // Shuffle agent order so different agents move each tick.
  const order = [...agents.keys()].sort(() => Math.random() - 0.5);
  const movers = Math.max(1, Math.round(agents.length * ratio));

  let moved = 0;
  for (const i of order) {
    if (moved >= movers) break;
    const agent = agents[i];

    // 70% go to their role's home zone; 30% go to a meeting/collaboration zone
    // if their state suggests it; idle agents drift to break/reception.
    let targetZone: OfficeZoneId;
    if (agent.state === "Idle") {
      targetZone = Math.random() < 0.6 ? "break-area" : "reception";
    } else if (agent.state === "In Meeting" || agent.state === "Collaborating") {
      const meetingZones: OfficeZoneId[] = ["strategy-room", "war-room", "client-success"];
      targetZone = meetingZones[Math.floor(Math.random() * meetingZones.length)];
    } else {
      targetZone = Math.random() < 0.75 ? homeZoneForRole(agent.role) : agent.zone;
    }

    const anchor = pickFreeAnchor(targetZone, agent.role, occupied);
    if (!anchor) continue;

    // Free the agent's previous anchor.
    if (agent.anchorId) {
      const prev = ACTIVITY_ANCHORS.find((x) => x.id === agent.anchorId);
      if (prev) occupied.delete(anchorOccupiedKey(prev));
    }
    occupied.add(anchorOccupiedKey(anchor));

    const fromZone = agent.zone;
    agent.zone = anchor.zone;
    agent.gridX = anchor.x;
    agent.gridY = anchor.y;
    agent.anchorId = anchor.id;
    agent.activity = anchor.activity;
    agent.activityUntil = Date.now() + (4000 + Math.random() * 4000);
    moved++;

    if (fromZone !== anchor.zone) {
      events.push({
        agentId: agent.id,
        agentName: agent.name,
        fromZone,
        toZone: anchor.zone,
        activity: anchor.activity,
      });
    }
  }
  return events;
}

/** Find the anchor an agent is sitting at (for inspector/debug). */
export function anchorForId(id: string | undefined): ActivityAnchor | undefined {
  if (!id) return undefined;
  return ACTIVITY_ANCHORS.find((a) => a.id === id);
}
