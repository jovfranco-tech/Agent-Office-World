/**
 * Mock simulation engine.
 *
 * Pure functions that mutate a copy of the agent list + produce events.
 * No backend, no LLM, no randomness source other than Math.random — this is
 * deliberately a local mock so the office feels alive.
 *
 * Two entry points:
 *   - tick()         : a single small step (called on the Live Mode interval)
 *   - simulateHour() : a burst of several steps at once ("Simulate 1 Hour")
 *   - resetDay()     : restore start-of-day state
 */
import type { Agent, AgentState, OfficeEvent } from "../types";
import { INITIAL_AGENTS } from "../data/agents";
import { EVENT_TEMPLATES } from "../data/events";
import { zoneInteriorCells, getZone } from "../data/officeZones";

let eventCounter = 0;
function nextEventId(): string {
  eventCounter += 1;
  return `evt-${Date.now()}-${eventCounter}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** State transition graph: from a state, possible next states (weighted by repetition). */
const TRANSITIONS: Record<AgentState, AgentState[]> = {
  Focused: ["Focused", "Thinking", "Reviewing", "Shipping", "Idle"],
  Thinking: ["Focused", "Reviewing", "Thinking", "Blocked"],
  "In Meeting": ["Focused", "Collaborating", "Reviewing", "In Meeting"],
  Reviewing: ["Focused", "Shipping", "Blocked", "Reviewing"],
  Blocked: ["Escalating", "Thinking", "Blocked", "Focused"],
  Shipping: ["Idle", "Focused", "Collaborating", "Shipping"],
  Idle: ["Focused", "Learning", "Collaborating", "In Meeting", "Idle"],
  Escalating: ["Focused", "Blocked", "Reviewing", "Escalating"],
  Learning: ["Focused", "Reviewing", "Learning", "Idle"],
  Collaborating: ["Focused", "In Meeting", "Reviewing", "Collaborating"],
};

const TASKS_BY_ROLE: Record<string, string[]> = {
  Coding: ["Refactoring module", "Fixing a bug", "Opening a PR", "Writing tests", "Code review"],
  Research: ["Reading papers", "Surveying tools", "Interviewing users", "Synthesizing insights"],
  QA: ["Writing test cases", "Reproducing a bug", "Running suites", "Triaging failures"],
  Security: ["Auditing logs", "Patching a CVE", "Reviewing access", "Hardening config"],
  Ops: ["Tuning deploy pipeline", "Rotating secrets", "Updating runbooks", "Resolving an incident"],
  Design: ["Sketching flows", "Iterating mockups", "Reviewing UX", "Building a prototype"],
  Product: ["Prioritizing roadmap", "Writing a spec", "Reviewing metrics", "Grooming backlog"],
  PMO: ["Aligning delivery", "Updating status", "Unblocking a team", "Planning a sprint"],
  Strategy: ["Modeling scenarios", "Reviewing positioning", "Drafting OKRs", "Briefing leads"],
  CEO: ["Reviewing strategy", "Meeting investors", "Setting priorities", "Reviewing performance"],
  Finance: ["Closing books", "Forecasting runway", "Reviewing variance", "Approving spend"],
  "Legal/Compliance": ["Updating DPAs", "Reviewing contracts", "Filing compliance", "Auditing policy"],
  Data: ["Building a dashboard", "Tuning a model", "Cleaning data", "Querying metrics"],
  Infra: ["Scaling the cluster", "Provisioning nodes", "Upgrading k8s", "Hardening network"],
  Sales: ["Drafting a proposal", "Following up leads", "Running a demo", "Forecasting pipeline"],
  Support: ["Resolving a ticket", "Writing a help article", "Triaging inbox", "Onboarding a user"],
  "Customer Success": ["Onboarding a client", "Running a QBR", "Reducing churn", "Sending a playbook"],
  Automation: ["Automating a task", "Wiring a webhook", "Removing toil", "Building a bot"],
  Risk: ["Assessing vendor risk", "Modeling failure modes", "Drafting mitigation", "Reviewing controls"],
  Documentation: ["Outlining docs", "Publishing a guide", "Editing API refs", "Reviewing content"],
};

const NEXT_ACTIONS = [
  "Continue current work",
  "Pick up the next task",
  "Sync with a teammate",
  "Take a short break",
  "Open a review",
  "Share an update",
];

export interface SimulationSnapshot {
  agents: Agent[];
  events: OfficeEvent[];
}

/**
 * One simulation step. Mutates copies; returns new arrays (immutable-ish).
 * @param prev previous agents/events
 * @param intensity how many agents to perturb this tick (1..n)
 */
export function tick(
  prev: SimulationSnapshot,
  intensity = 3
): SimulationSnapshot {
  const agents = prev.agents.map((a) => ({ ...a }));
  const events = [...prev.events];

  // Choose a few distinct agents to perturb this tick.
  const indices = new Set<number>();
  let guard = 0;
  while (indices.size < Math.min(intensity, agents.length) && guard < 50) {
    indices.add(Math.floor(Math.random() * agents.length));
    guard++;
  }

  for (const i of indices) {
    const agent = agents[i];

    // 1) Maybe change state.
    if (Math.random() < 0.6) {
      const next = pick(TRANSITIONS[agent.state] ?? ["Focused"]);
      agent.state = next;
    }

    // 2) Maybe change task.
    if (Math.random() < 0.4) {
      const tasks = TASKS_BY_ROLE[agent.role];
      if (tasks) agent.task = pick(tasks);
    }

    // 3) Maybe move to a new cell within the zone (walking).
    if (Math.random() < 0.35) {
      const cells = zoneInteriorCells(agent.zone);
      const free = cells.filter(
        (c) =>
          !agents.some(
            (other, oi) =>
              oi !== i && other.gridX === c.x && other.gridY === c.y
          )
      );
      if (free.length) {
        const c = pick(free);
        agent.gridX = c.x;
        agent.gridY = c.y;
      }
    }

    // 4) Energy drifts down a bit; recovers when idle/learning.
    if (agent.state === "Idle" || agent.state === "Learning") {
      agent.energy = Math.min(100, agent.energy + 3);
    } else {
      agent.energy = Math.max(15, agent.energy - 2);
    }

    // 5) Maybe move to a meeting zone.
    if (agent.state === "In Meeting" || agent.state === "Collaborating") {
      const meetingZones = ["war-room", "strategy-room", "client-success"] as const;
      const target = pick([...meetingZones]);
      const cells = zoneInteriorCells(target);
      const free = cells.filter(
        (c) =>
          !agents.some(
            (other, oi) =>
              oi !== i && other.gridX === c.x && other.gridY === c.y
          )
      );
      if (free.length) {
        const c = pick(free);
        agent.zone = target;
        agent.gridX = c.x;
        agent.gridY = c.y;
      }
    } else {
      // Sometimes return to the role's home zone if currently in a meeting zone.
      const homeZone = INITIAL_AGENTS[i].zone;
      if (
        (agent.zone === "war-room" ||
          agent.zone === "strategy-room" ||
          agent.zone === "client-success") &&
        Math.random() < 0.3
      ) {
        const cells = zoneInteriorCells(homeZone);
        const free = cells.filter(
          (c) =>
            !agents.some(
              (other, oi) =>
                oi !== i && other.gridX === c.x && other.gridY === c.y
            )
        );
        if (free.length) {
          const c = pick(free);
          agent.zone = homeZone;
          agent.gridX = c.x;
          agent.gridY = c.y;
        }
      }
    }

    agent.nextAction = pick(NEXT_ACTIONS);

    // 6) Occasionally emit an event for this role.
    if (Math.random() < 0.5) {
      const tpl = pick(EVENT_TEMPLATES.filter((t) => t.role === agent.role)) ??
        pick(EVENT_TEMPLATES);
      events.unshift({
        id: nextEventId(),
        time: nowTime(),
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        message: tpl.message,
        kind: tpl.kind,
      });
    }
  }

  // Cap the timeline.
  return { agents, events: events.slice(0, 40) };
}

/** A burst of activity — "Simulate 1 Hour". */
export function simulateHour(prev: SimulationSnapshot): SimulationSnapshot {
  let snap = prev;
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    snap = tick(snap, 4);
  }
  return snap;
}

/** Restore start-of-day state. Keeps a fresh seed event set. */
export function resetDay(): SimulationSnapshot {
  return {
    agents: INITIAL_AGENTS.map((a) => ({ ...a })),
    events: [],
  };
}

/** Initial snapshot (start of day + seed events). */
export function initialSnapshot(): SimulationSnapshot {
  return {
    agents: INITIAL_AGENTS.map((a) => ({ ...a })),
    events: [],
  };
}

/** How many agents are currently in a given zone. */
export function agentsInZone(agents: Agent[], zoneId: string): Agent[] {
  return agents.filter((a) => a.zone === zoneId);
}

/** Human label for the zone of an agent. */
export function zoneNameOf(zoneId: string): string {
  return getZone(zoneId)?.name ?? zoneId;
}
