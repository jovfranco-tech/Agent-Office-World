/**
 * 21 mock agents — v0.2.
 *
 * Each agent has a STABLE id that matches codexPetsManifest.ts (so each one
 * gets its own unique pet). Each agent is placed at a sensible spot:
 *   - Desk workers sit in front of their assigned desk (DESK_SPOTS).
 *   - Meeting/lounge roles stand near a meeting table or screen (STAND_SPOTS).
 * Positions therefore always make sense for the role — engineers are in the
 * Engineering Pods at their desks, the CEO is in the Strategy Room, etc.
 */
import type { Agent, AgentState } from "../types";
import { getAgentPet } from "./codexPetsManifest";
import { DESK_SPOTS, STAND_SPOTS } from "../lib/officeLayout";

interface Seed {
  id: string;
  name: string;
  role: Agent["role"];
  zone: Agent["zone"];
  state: AgentState;
  task: string;
  /** A desk-spot id (preferred) OR a stand-spot id. */
  spotId: string;
  spotKind: "desk" | "stand";
  energy: number;
  nextAction: string;
}

const SEEDS: Seed[] = [
  // --- Engineering Pods ---
  { id: "agent-coding-1", name: "Nova", role: "Coding", zone: "engineering-pods", state: "Shipping", task: "Preparing prototype release", spotId: "desk-eng-1", spotKind: "desk", energy: 82, nextAction: "Open a pull request" },
  { id: "agent-coding-2", name: "Kai", role: "Coding", zone: "engineering-pods", state: "Focused", task: "Refactoring the auth module", spotId: "desk-eng-2", spotKind: "desk", energy: 76, nextAction: "Write unit tests" },
  { id: "agent-infra", name: "Kano", role: "Infra", zone: "engineering-pods", state: "Thinking", task: "Scaling the cluster", spotId: "desk-eng-3", spotKind: "desk", energy: 70, nextAction: "Provision a new node" },
  { id: "agent-automation", name: "Jin", role: "Automation", zone: "engineering-pods", state: "Focused", task: "Wiring the e2e pipeline", spotId: "desk-eng-4", spotKind: "desk", energy: 74, nextAction: "Trigger the nightly run" },

  // --- Open Workspace ---
  { id: "agent-ops", name: "Atlas", role: "Ops", zone: "open-workspace", state: "Collaborating", task: "Optimizing the deploy flow", spotId: "desk-ow-1", spotKind: "desk", energy: 68, nextAction: "Update the runbook" },
  { id: "agent-support", name: "Iris", role: "Support", zone: "open-workspace", state: "Focused", task: "Resolving client ticket #482", spotId: "desk-ow-2", spotKind: "desk", energy: 80, nextAction: "Reply to the client" },
  { id: "agent-design", name: "Vega", role: "Design", zone: "open-workspace", state: "Thinking", task: "Concepting the onboarding flow", spotId: "desk-ow-3", spotKind: "desk", energy: 72, nextAction: "Share mockups" },
  { id: "agent-product", name: "Orion", role: "Product", zone: "open-workspace", state: "Reviewing", task: "Prioritizing the roadmap", spotId: "desk-ow-4", spotKind: "desk", energy: 77, nextAction: "Sync with PMO" },

  // --- QA Lab ---
  { id: "agent-qa", name: "Mira", role: "QA", zone: "qa-lab", state: "Blocked", task: "Reproducing a flaky test", spotId: "desk-qa-1", spotKind: "desk", energy: 55, nextAction: "Escalate to Coding" },
  // QA second desk currently unused by an agent (kept free for realism).

  // --- Research Library ---
  { id: "agent-research", name: "Elara", role: "Research", zone: "research-library", state: "Reviewing", task: "Surveying agent frameworks", spotId: "desk-lib-1", spotKind: "desk", energy: 85, nextAction: "Summarize findings" },
  { id: "agent-data", name: "Theo", role: "Data", zone: "research-library", state: "Learning", task: "Modeling retention metrics", spotId: "desk-lib-2", spotKind: "desk", energy: 79, nextAction: "Build a dashboard" },

  // --- Finance Desk ---
  { id: "agent-finance", name: "Nadia", role: "Finance", zone: "finance-desk", state: "Focused", task: "Closing the monthly books", spotId: "desk-fin-1", spotKind: "desk", energy: 73, nextAction: "Review budget variance" },
  { id: "agent-legal", name: "Cyrus", role: "Legal/Compliance", zone: "finance-desk", state: "Reviewing", task: "Updating the DPAs", spotId: "desk-fin-2", spotKind: "desk", energy: 71, nextAction: "File the compliance memo" },

  // --- Security Desk ---
  { id: "agent-security", name: "Sage", role: "Security", zone: "security-desk", state: "Reviewing", task: "Auditing access logs", spotId: "desk-sec-1", spotKind: "desk", energy: 69, nextAction: "Open a compliance review" },

  // --- Reception ---
  { id: "agent-docs", name: "Wren", role: "Documentation", zone: "reception", state: "Idle", task: "Outlining the API docs", spotId: "desk-rec-1", spotKind: "desk", energy: 66, nextAction: "Publish the guide" },

  // --- Strategy Room (meeting) ---
  { id: "agent-ceo", name: "Sol", role: "CEO", zone: "strategy-room", state: "In Meeting", task: "Reviewing strategic options", spotId: "stand-strat-1", spotKind: "stand", energy: 88, nextAction: "Request a strategic review" },
  { id: "agent-strategy", name: "Dario", role: "Strategy", zone: "strategy-room", state: "Thinking", task: "Modeling market expansion", spotId: "stand-strat-2", spotKind: "stand", energy: 84, nextAction: "Brief the CEO" },
  { id: "agent-pmo", name: "Hana", role: "PMO", zone: "strategy-room", state: "In Meeting", task: "Aligning Q3 delivery", spotId: "stand-strat-2", spotKind: "stand", energy: 81, nextAction: "Update delivery status" },

  // --- War Room ---
  { id: "agent-risk", name: "Rhea", role: "Risk", zone: "war-room", state: "Escalating", task: "Assessing vendor risk", spotId: "stand-war-1", spotKind: "stand", energy: 60, nextAction: "Draft a mitigation plan" },

  // --- Client Success ---
  { id: "agent-cs", name: "Lior", role: "Customer Success", zone: "client-success", state: "In Meeting", task: "Onboarding Acme Corp", spotId: "stand-cs-1", spotKind: "stand", energy: 78, nextAction: "Send the welcome kit" },
  { id: "agent-sales", name: "Pax", role: "Sales", zone: "client-success", state: "Collaborating", task: "Drafting an enterprise proposal", spotId: "stand-cs-2", spotKind: "stand", energy: 83, nextAction: "Schedule a demo" },
];

/** Resolve a seed's grid position from its spot. */
function resolvePosition(seed: Seed): { x: number; y: number } {
  if (seed.spotKind === "desk") {
    const spot = DESK_SPOTS.find((d) => d.id === seed.spotId);
    if (spot) return spot.sit;
  } else {
    const spot = STAND_SPOTS.find((s) => s.id === seed.spotId);
    if (spot) return spot.pos;
  }
  return { x: 2, y: 2 };
}

/** Build the full agent list, attaching each agent's unique pet slug. */
export function buildAgents(): Agent[] {
  return SEEDS.map((s) => {
    const pos = resolvePosition(s);
    const mapping = getAgentPet(s.id);
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      state: s.state,
      petSlug: mapping?.petSlug ?? "boba",
      zone: s.zone,
      task: s.task,
      energy: s.energy,
      gridX: pos.x,
      gridY: pos.y,
      renderX: pos.x, // start rendered exactly at home position
      renderY: pos.y,
      facing: "right",
      activity: "desk-work" as const,
      nextAction: s.nextAction,
    };
  });
}

/** Initial agents (start-of-day). Simulation clones + mutates this. */
export const INITIAL_AGENTS: Agent[] = buildAgents();
