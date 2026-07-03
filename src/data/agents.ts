/**
 * 20 mock agents. Each is placed at a grid position inside its assigned zone.
 * Positions are chosen by spreading agents across zone interiors so they
 * don't overlap and the office feels populated.
 */
import type { Agent, AgentState } from "../types";
import { petSlugFor } from "./codexPetsManifest";
import { zoneInteriorCells } from "./officeZones";

/** Default (start-of-day) agent definitions. zone + offset pick a desk. */
interface Seed {
  name: string;
  role: Agent["role"];
  zone: Agent["zone"];
  state: AgentState;
  task: string;
  /** Which interior cell of the zone to occupy (0-based index). */
  cellIndex: number;
  nextAction: string;
}

const SEEDS: Seed[] = [
  { name: "Nova", role: "Coding", zone: "engineering-pods", state: "Shipping", task: "Preparing prototype release", cellIndex: 0, nextAction: "Open a pull request" },
  { name: "Kai", role: "Coding", zone: "engineering-pods", state: "Focused", task: "Refactoring auth module", cellIndex: 1, nextAction: "Write unit tests" },
  { name: "Kano", role: "Infra", zone: "engineering-pods", state: "Thinking", task: "Scaling the cluster", cellIndex: 4, nextAction: "Provision a new node" },

  { name: "Elara", role: "Research", zone: "research-library", state: "Reviewing", task: "Surveying agent frameworks", cellIndex: 0, nextAction: "Summarize findings" },
  { name: "Theo", role: "Data", zone: "research-library", state: "Learning", task: "Modeling retention metrics", cellIndex: 2, nextAction: "Build a dashboard" },

  { name: "Mira", role: "QA", zone: "qa-lab", state: "Blocked", task: "Reproducing flaky test", cellIndex: 0, nextAction: "Escalate to Coding" },
  { name: "Jin", role: "Automation", zone: "qa-lab", state: "Focused", task: "Wiring e2e pipeline", cellIndex: 2, nextAction: "Trigger nightly run" },

  { name: "Sage", role: "Security", zone: "security-desk", state: "Reviewing", task: "Auditing access logs", cellIndex: 0, nextAction: "Open compliance review" },
  { name: "Rhea", role: "Risk", zone: "security-desk", state: "Escalating", task: "Assessing vendor risk", cellIndex: 1, nextAction: "Draft mitigation plan" },

  { name: "Atlas", role: "Ops", zone: "open-workspace", state: "Collaborating", task: "Optimizing deploy flow", cellIndex: 0, nextAction: "Update runbook" },
  { name: "Iris", role: "Support", zone: "open-workspace", state: "Focused", task: "Resolving client ticket #482", cellIndex: 2, nextAction: "Reply to client" },
  { name: "Lior", role: "Customer Success", zone: "client-success", state: "In Meeting", task: "Onboarding Acme Corp", cellIndex: 0, nextAction: "Send welcome kit" },

  { name: "Vega", role: "Design", zone: "open-workspace", state: "Thinking", task: "Concepting onboarding flow", cellIndex: 4, nextAction: "Share mockups" },
  { name: "Orion", role: "Product", zone: "open-workspace", state: "Reviewing", task: "Prioritizing roadmap", cellIndex: 6, nextAction: "Sync with PMO" },

  { name: "Hana", role: "PMO", zone: "strategy-room", state: "In Meeting", task: "Aligning Q3 delivery", cellIndex: 0, nextAction: "Update delivery status" },
  { name: "Dario", role: "Strategy", zone: "strategy-room", state: "Thinking", task: "Modeling market expansion", cellIndex: 2, nextAction: "Brief the CEO" },

  { name: "Sol", role: "CEO", zone: "war-room", state: "In Meeting", task: "Reviewing strategic options", cellIndex: 0, nextAction: "Request strategic review" },

  { name: "Nadia", role: "Finance", zone: "finance-desk", state: "Focused", task: "Closing monthly books", cellIndex: 0, nextAction: "Review budget variance" },
  { name: "Cyrus", role: "Legal/Compliance", zone: "finance-desk", state: "Reviewing", task: "Updating DPAs", cellIndex: 2, nextAction: "File compliance memo" },

  { name: "Pax", role: "Sales", zone: "client-success", state: "Collaborating", task: "Drafting enterprise proposal", cellIndex: 2, nextAction: "Schedule demo" },
  { name: "Wren", role: "Documentation", zone: "break-area", state: "Idle", task: "Outlining API docs", cellIndex: 0, nextAction: "Publish guide" },
];

/** Build the full agent list with concrete grid positions. */
export function buildAgents(): Agent[] {
  return SEEDS.map((s, i) => {
    const cells = zoneInteriorCells(s.zone);
    const cell = cells[Math.min(s.cellIndex, cells.length - 1)] ?? { x: 1, y: 1 };
    return {
      id: `agent-${i + 1}`,
      name: s.name,
      role: s.role,
      state: s.state,
      petSlug: petSlugFor(s.role),
      zone: s.zone,
      task: s.task,
      energy: 60 + ((i * 7) % 40), // 60..99 spread
      gridX: cell.x,
      gridY: cell.y,
      nextAction: s.nextAction,
    };
  });
}

/** Initial agents (start-of-day). Simulation clones + mutates this. */
export const INITIAL_AGENTS: Agent[] = buildAgents();
