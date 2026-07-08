/**
 * 21 mock agents — V2 (OfficeSceneV2 positions).
 *
 * Each agent now carries DIRECT grid positions matching the V2 layout
 * (officeSceneV2Layout.ts + officeSceneV2Anchors.ts). No more spot-id
 * indirection — positions are curated to sit next to real V2 furniture.
 */
import type { Agent, AgentState } from "../types";
import { getAgentPet } from "./codexPetsManifest";

interface Seed {
  id: string;
  name: string;
  role: Agent["role"];
  zone: Agent["zone"];
  state: AgentState;
  task: string;
  /** Direct V2 grid position (matches a V2 anchor). */
  gridX: number;
  gridY: number;
  activity: Agent["activity"];
  energy: number;
  nextAction: string;
}

const SEEDS: Seed[] = [
  // --- Engineering Pods (dual-monitor desks, sit in front) ---
  { id: "agent-coding-1", name: "Nova", role: "Coding", zone: "engineering-pods", state: "Shipping", task: "Preparing prototype release", gridX: 12, gridY: 2, activity: "engineering", energy: 82, nextAction: "Open a pull request" },
  { id: "agent-coding-2", name: "Kai", role: "Coding", zone: "engineering-pods", state: "Focused", task: "Refactoring the auth module", gridX: 14, gridY: 2, activity: "engineering", energy: 76, nextAction: "Write unit tests" },
  { id: "agent-infra", name: "Kano", role: "Infra", zone: "engineering-pods", state: "Thinking", task: "Scaling the cluster", gridX: 16, gridY: 2, activity: "engineering", energy: 70, nextAction: "Provision a new node" },
  { id: "agent-automation", name: "Jin", role: "Automation", zone: "engineering-pods", state: "Focused", task: "Wiring the e2e pipeline", gridX: 18, gridY: 2, activity: "engineering", energy: 74, nextAction: "Trigger the nightly run" },

  // --- Open Workspace ---
  { id: "agent-ops", name: "Atlas", role: "Ops", zone: "open-workspace", state: "Collaborating", task: "Optimizing the deploy flow", gridX: 7, gridY: 7, activity: "desk-work", energy: 68, nextAction: "Update the runbook" },
  { id: "agent-support", name: "Iris", role: "Support", zone: "open-workspace", state: "Focused", task: "Resolving client ticket #482", gridX: 9, gridY: 7, activity: "desk-work", energy: 80, nextAction: "Reply to the client" },
  { id: "agent-design", name: "Vega", role: "Design", zone: "open-workspace", state: "Thinking", task: "Concepting the onboarding flow", gridX: 7, gridY: 10, activity: "desk-work", energy: 72, nextAction: "Share mockups" },
  { id: "agent-product", name: "Orion", role: "Product", zone: "open-workspace", state: "Reviewing", task: "Prioritizing the roadmap", gridX: 9, gridY: 10, activity: "desk-work", energy: 77, nextAction: "Sync with PMO" },

  // --- Research / QA ---
  { id: "agent-qa", name: "Mira", role: "QA", zone: "research-library", state: "Blocked", task: "Reproducing a flaky test", gridX: 4, gridY: 11, activity: "qa", energy: 55, nextAction: "Escalate to Coding" },
  { id: "agent-research", name: "Elara", role: "Research", zone: "research-library", state: "Reviewing", task: "Surveying agent frameworks", gridX: 2, gridY: 8, activity: "research", energy: 85, nextAction: "Summarize findings" },
  { id: "agent-data", name: "Theo", role: "Data", zone: "research-library", state: "Learning", task: "Modeling retention metrics", gridX: 2, gridY: 11, activity: "research", energy: 79, nextAction: "Build a dashboard" },

  // --- Finance / Legal ---
  { id: "agent-finance", name: "Nadia", role: "Finance", zone: "finance-desk", state: "Focused", task: "Closing the monthly books", gridX: 1, gridY: 14, activity: "finance-legal", energy: 73, nextAction: "Review budget variance" },
  { id: "agent-legal", name: "Cyrus", role: "Legal/Compliance", zone: "finance-desk", state: "Reviewing", task: "Updating the DPAs", gridX: 3, gridY: 14, activity: "finance-legal", energy: 71, nextAction: "File the compliance memo" },

  // --- Command Center (Security/Risk/Ops) ---
  { id: "agent-security", name: "Sage", role: "Security", zone: "command-center", state: "Reviewing", task: "Auditing access logs", gridX: 13, gridY: 13, activity: "command-center", energy: 69, nextAction: "Open a compliance review" },
  { id: "agent-risk", name: "Rhea", role: "Risk", zone: "command-center", state: "Escalating", task: "Assessing vendor risk", gridX: 15, gridY: 13, activity: "command-center", energy: 60, nextAction: "Draft a mitigation plan" },

  // --- Reception ---
  { id: "agent-docs", name: "Wren", role: "Documentation", zone: "reception", state: "Idle", task: "Outlining the API docs", gridX: 8, gridY: 2, activity: "reception", energy: 66, nextAction: "Publish the guide" },

  // --- Strategy Room (meeting) ---
  { id: "agent-ceo", name: "Sol", role: "CEO", zone: "strategy-room", state: "In Meeting", task: "Reviewing strategic options", gridX: 1, gridY: 1, activity: "meeting", energy: 88, nextAction: "Request a strategic review" },
  { id: "agent-strategy", name: "Dario", role: "Strategy", zone: "strategy-room", state: "Thinking", task: "Modeling market expansion", gridX: 3, gridY: 1, activity: "meeting", energy: 84, nextAction: "Brief the CEO" },
  { id: "agent-pmo", name: "Hana", role: "PMO", zone: "strategy-room", state: "In Meeting", task: "Aligning Q3 delivery", gridX: 4, gridY: 1, activity: "meeting", energy: 81, nextAction: "Update delivery status" },

  // --- Break Area ---
  { id: "agent-cs", name: "Lior", role: "Customer Success", zone: "break-area", state: "In Meeting", task: "Onboarding Acme Corp", gridX: 7, gridY: 13, activity: "break", energy: 78, nextAction: "Send the welcome kit" },
  { id: "agent-sales", name: "Pax", role: "Sales", zone: "break-area", state: "Collaborating", task: "Drafting an enterprise proposal", gridX: 7, gridY: 12, activity: "break", energy: 83, nextAction: "Schedule a demo" },
];

/** Build the full agent list with V2 positions. */
export function buildAgents(): Agent[] {
  return SEEDS.map((s) => {
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
      gridX: s.gridX,
      gridY: s.gridY,
      renderX: s.gridX,
      renderY: s.gridY,
      facing: "right",
      activity: s.activity,
      nextAction: s.nextAction,
    };
  });
}

/** Initial agents (start-of-day). Simulation clones + mutates this. */
export const INITIAL_AGENTS: Agent[] = buildAgents();
