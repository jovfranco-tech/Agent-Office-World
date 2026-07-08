/**
 * agentMovement.ts — v0.7 (rewritten to kill teleport).
 *
 * KEY INSIGHT (root cause of teleport in v0.6):
 *   The rAF loop mutated renderX/renderY IN PLACE on agent objects, but those
 *   objects were replaced every Live tick (React immutable snapshot). Worse,
 *   AgentSprite was memoized, so even when OfficeWorld re-rendered, the memo
 *   skipped AgentSprite because the `agent` prop reference was unchanged — the
 *   DOM position never updated mid-move, then snapped at the end = teleport.
 *
 * FIX:
 *   Movement/visual state lives in a PERSISTENT store owned by OfficeWorld
 *   (AgentMotionStore), keyed by agent id. It survives React snapshots. The
 *   store interpolates renderX/renderY each frame with easeInOutCubic, over a
 *   DURATION proportional to distance (not constant speed), so far moves take
 *   visibly longer and short moves are snappy. OfficeWorld re-renders every
 *   frame while anyone is moving, and passes a fresh `frame` value to
 *   AgentSprite so memo can't skip it.
 */
import type { Agent, AgentState, OfficeZoneId, ActivityKind } from "../types";
import {
  V2_ANCHORS,
  pickFreeV2Anchor,
  type V2Anchor,
} from "../data/officeSceneV2Anchors";

/** A single agent's visual motion state. */
export interface AgentMotion {
  agentId: string;
  /** Current interpolated render position (grid units). */
  renderX: number;
  renderY: number;
  /** Logical target grid position (from the snapshot). */
  targetX: number;
  targetY: number;
  /** Origin of the current move (set when target changes). */
  fromX: number;
  fromY: number;
  /** Move start timestamp (ms) and total duration (ms). */
  startMs: number;
  durationMs: number;
  /** True while still interpolating toward target. */
  isMoving: boolean;
  /** 0..1 progress through the current move. */
  progress: number;
  facing: "left" | "right";
  /** Waypoints (in grid space) to walk through before the final target. */
  path: { x: number; y: number }[];
  /** Index into `path` of the current leg's destination. */
  legIndex: number;
}

/** Persistent per-agent motion store, owned by OfficeWorld. */
export class AgentMotionStore {
  private map = new Map<string, AgentMotion>();

  /** Sync with the latest snapshot: adopt new targets, start moves. */
  sync(agents: Agent[], now: number) {
    for (const a of agents) {
      let m = this.map.get(a.id);
      if (!m) {
        // First time seeing this agent: place it exactly at its target (no move).
        m = {
          agentId: a.id,
          renderX: a.gridX,
          renderY: a.gridY,
          targetX: a.gridX,
          targetY: a.gridY,
          fromX: a.gridX,
          fromY: a.gridY,
          startMs: now,
          durationMs: 0,
          isMoving: false,
          progress: 1,
          facing: a.facing ?? "right",
          path: [],
          legIndex: 0,
        };
        this.map.set(a.id, m);
      }

      // Build the agent's intended path from the agent's current logical state.
      // The agent carries optional waypoints; if absent we go straight.
      const intendedPath = a.path && a.path.length > 0 ? a.path : [{ x: a.gridX, y: a.gridY }];

      // Detect a NEW target: if the agent's gridX/gridY differs from what we
      // last knew, (re)start the move from the current rendered position.
      const finalTarget = intendedPath[intendedPath.length - 1];
      const targetChanged =
        finalTarget.x !== m.targetX || finalTarget.y !== m.targetY;

      if (targetChanged && !m.isMoving) {
        m.path = intendedPath;
        m.legIndex = 0;
        m.fromX = m.renderX;
        m.fromY = m.renderY;
        m.targetX = finalTarget.x;
        m.targetY = finalTarget.y;
        m.startMs = now;
        // Duration scales with total path distance (cells), clamped.
        const totalDist = pathDistance(m.renderX, m.renderY, intendedPath);
        m.durationMs = Math.max(450, Math.min(4000, 280 * totalDist));
        m.isMoving = true;
        m.progress = 0;
      }
    }
  }

  /** Advance all motion by dt. Calls onArrive when a leg/whole move completes. */
  step(now: number, onArrive?: (id: string) => void) {
    for (const m of this.map.values()) {
      if (!m.isMoving) continue;
      const leg = m.path[Math.min(m.legIndex, m.path.length - 1)];
      const elapsed = now - m.startMs;
      const legDur = Math.max(
        120,
        (m.durationMs / m.path.length) * 1
      );
      const raw = Math.min(elapsed / legDur, 1);
      const eased = easeInOutCubic(raw);
      const fromLegX = m.legIndex === 0 ? m.fromX : m.path[m.legIndex - 1].x;
      const fromLegY = m.legIndex === 0 ? m.fromY : m.path[m.legIndex - 1].y;
      m.renderX = fromLegX + (leg.x - fromLegX) * eased;
      m.renderY = fromLegY + (leg.y - fromLegY) * eased;
      m.facing = leg.x < fromLegX ? "left" : "right";
      m.progress = raw;

      if (raw >= 1) {
        // Reached this leg's waypoint; advance to the next leg or finish.
        m.legIndex += 1;
        m.startMs = now;
        if (m.legIndex >= m.path.length) {
          m.renderX = m.targetX;
          m.renderY = m.targetY;
          m.isMoving = false;
          m.progress = 1;
          onArrive?.(m.agentId);
        }
      }
    }
  }

  get(agentId: string): AgentMotion | undefined {
    return this.map.get(agentId);
  }

  /** True if any agent is currently moving (used to gate re-renders). */
  anyMoving(): boolean {
    for (const m of this.map.values()) if (m.isMoving) return true;
    return false;
  }

  /** Hard-reset to a fresh agent list (used by Reset Day). */
  reset(agents: Agent[]) {
    this.map.clear();
    const now = Date.now();
    for (const a of agents) {
      this.map.set(a.id, {
        agentId: a.id,
        renderX: a.gridX,
        renderY: a.gridY,
        targetX: a.gridX,
        targetY: a.gridY,
        fromX: a.gridX,
        fromY: a.gridY,
        startMs: now,
        durationMs: 0,
        isMoving: false,
        progress: 1,
        facing: a.facing ?? "right",
        path: [],
        legIndex: 0,
      });
    }
  }
}

/** easeInOutCubic: slow at start/end, fast in the middle. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Total grid distance along a path from a start point. */
function pathDistance(
  fromX: number,
  fromY: number,
  path: { x: number; y: number }[]
): number {
  let d = 0;
  let px = fromX;
  let py = fromY;
  for (const p of path) {
    d += Math.hypot(p.x - px, p.y - py);
    px = p.x;
    py = p.y;
  }
  return d;
}

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
      return "desk-work";
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

/** The zone an agent's role "lives" in. */
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
      return "research-library"; // QA merged into Research/QA zone in V2
    case "Security":
    case "Risk":
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
      return "break-area"; // client-facing roles lounge in break area in V2
    case "Support":
    case "Design":
    case "Product":
      return "open-workspace";
    default:
      return "open-workspace";
  }
}

/**
 * A simple waypoint between two zones: route through a corridor point so agents
 * don't cut straight through furniture on long moves. We pick a midpoint in
 * open corridor space (no full pathfinding yet — believable, not perfect).
 */
function waypointBetween(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } | null {
  // Only add a waypoint for genuinely long moves across the office.
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  if (dist < 6) return null;
  // Corridor midpoint: bias toward the open central corridor (y ~ 9-11).
  const midX = (from.x + to.x) / 2;
  const midY = Math.max(9, Math.min(11, (from.y + to.y) / 2));
  return { x: Math.round(midX), y: Math.round(midY) };
}

/**
 * The activity scheduler. Assigns a subset (~ratio) of agents new anchor
 * destinations that make sense for their role. Returns movement events.
 */
export function scheduleActivities(
  agents: Agent[],
  ratio = 0.25
): {
  agentId: string;
  agentName: string;
  fromZone: OfficeZoneId;
  toZone: OfficeZoneId;
  activity: ActivityKind;
}[] {
  const events: {
    agentId: string;
    agentName: string;
    fromZone: OfficeZoneId;
    toZone: OfficeZoneId;
    activity: ActivityKind;
  }[] = [];
  const occupied = new Set<string>();
  for (const a of agents) {
    if (a.anchorId) {
      const an = V2_ANCHORS.find((x) => x.id === a.anchorId);
      if (an) occupied.add(`${an.x},${an.y}`);
    }
  }

  const order = [...agents.keys()].sort(() => Math.random() - 0.5);
  const movers = Math.max(1, Math.round(agents.length * ratio));
  let moved = 0;

  for (const i of order) {
    if (moved >= movers) break;
    const agent = agents[i];
    let targetZone: OfficeZoneId;
    if (agent.state === "Idle") {
      targetZone = Math.random() < 0.6 ? "break-area" : "reception";
    } else if (agent.state === "In Meeting" || agent.state === "Collaborating") {
      // Meeting states go to strategy-room or command-center (the two meeting zones in V2)
      const meetingZones: OfficeZoneId[] = ["strategy-room", "command-center"];
      targetZone = meetingZones[Math.floor(Math.random() * meetingZones.length)];
    } else {
      targetZone = Math.random() < 0.75 ? homeZoneForRole(agent.role) : agent.zone;
    }

    const anchor = pickFreeV2Anchor(targetZone, agent.role, occupied);
    if (!anchor) continue;

    if (agent.anchorId) {
      const prev = V2_ANCHORS.find((x) => x.id === agent.anchorId);
      if (prev) occupied.delete(`${prev.x},${prev.y}`);
    }
    occupied.add(`${anchor.x},${anchor.y}`);

    const fromZone = agent.zone;
    const fromPos = { x: agent.gridX, y: agent.gridY };
    const toPos = { x: anchor.x, y: anchor.y };
    const wp = waypointBetween(fromPos, toPos);
    agent.path = wp ? [wp, toPos] : [toPos];

    agent.zone = anchor.zoneId;
    agent.gridX = anchor.x;
    agent.gridY = anchor.y;
    agent.anchorId = anchor.id;
    agent.activity = anchor.activity as ActivityKind;
    agent.activityUntil = Date.now() + (4000 + Math.random() * 4000);
    moved++;

    if (fromZone !== anchor.zoneId) {
      events.push({
        agentId: agent.id,
        agentName: agent.name,
        fromZone,
        toZone: anchor.zoneId,
        activity: anchor.activity as ActivityKind,
      });
    }
  }
  return events;
}

export function anchorForId(id: string | undefined): V2Anchor | undefined {
  if (!id) return undefined;
  return V2_ANCHORS.find((a) => a.id === id);
}
