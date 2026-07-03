/**
 * Mock event templates. The simulation picks from these to populate the
 * EventTimeline. Each template is parameterized by agent.
 */
import type { AgentRole, OfficeEvent } from "../types";

export interface EventTemplate {
  role: AgentRole;
  message: string;
  kind: OfficeEvent["kind"];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  { role: "Research", message: "found 3 insights.", kind: "info" },
  { role: "QA", message: "detected a risk.", kind: "risk" },
  { role: "Security", message: "opened a compliance review.", kind: "warning" },
  { role: "Coding", message: "shipped a prototype.", kind: "success" },
  { role: "PMO", message: "updated delivery status.", kind: "info" },
  { role: "CEO", message: "requested strategic review.", kind: "warning" },
  { role: "Finance", message: "reviewed budget variance.", kind: "info" },
  { role: "Support", message: "resolved a client request.", kind: "success" },
  { role: "Design", message: "prepared a new concept.", kind: "info" },
  { role: "Ops", message: "optimized the workflow.", kind: "success" },
  { role: "Data", message: "shipped a new dashboard.", kind: "success" },
  { role: "Infra", message: "scaled the cluster.", kind: "info" },
  { role: "Sales", message: "opened a new opportunity.", kind: "success" },
  { role: "Risk", message: "flagged a compliance risk.", kind: "risk" },
  { role: "Automation", message: "automated a manual task.", kind: "success" },
  { role: "Legal/Compliance", message: "updated policy.", kind: "info" },
  { role: "Documentation", message: "published a guide.", kind: "info" },
  { role: "Strategy", message: "proposed a new direction.", kind: "info" },
];

/** Seed events shown on first load so the timeline isn't empty. */
export const SEED_EVENTS: Omit<OfficeEvent, "id" | "time">[] = [
  { agentId: "agent-4", agentName: "Elara", role: "Research", message: "found 3 insights.", kind: "info" },
  { agentId: "agent-7", agentName: "Mira", role: "QA", message: "detected a risk.", kind: "risk" },
  { agentId: "agent-9", agentName: "Sage", role: "Security", message: "opened a compliance review.", kind: "warning" },
  { agentId: "agent-1", agentName: "Nova", role: "Coding", message: "shipped a prototype.", kind: "success" },
];
