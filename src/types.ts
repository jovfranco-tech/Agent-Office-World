/**
 * Core domain types for Agent Office World.
 */
import type { CodexPetAnimationAlias } from "./types/codexPet";

export type AgentRole =
  | "CEO"
  | "PMO"
  | "Research"
  | "Coding"
  | "QA"
  | "Security"
  | "Finance"
  | "Sales"
  | "Support"
  | "Legal/Compliance"
  | "Ops"
  | "Design"
  | "Data"
  | "Infra"
  | "Product"
  | "Customer Success"
  | "Automation"
  | "Risk"
  | "Documentation"
  | "Strategy";

export type AgentState =
  | "Focused"
  | "Thinking"
  | "In Meeting"
  | "Reviewing"
  | "Blocked"
  | "Shipping"
  | "Idle"
  | "Escalating"
  | "Learning"
  | "Collaborating";

export type OfficeZoneId =
  | "reception"
  | "open-workspace"
  | "engineering-pods"
  | "strategy-room"
  | "war-room"
  | "qa-lab"
  | "research-library"
  | "finance-desk"
  | "client-success"
  | "break-area"
  | "command-center"
  | "security-desk";

/** A rectangle on the office grid. */
export interface GridRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OfficeZone {
  id: OfficeZoneId;
  name: string;
  /** Grid footprint. */
  rect: GridRect;
  /** Floor/carpet tint. */
  color: string;
  /** Short description shown in the zone inspector. */
  description: string;
  /** Optional visual flavor: glass / carpet / open / lab / etc. */
  kind: "open" | "carpet" | "glass" | "lab" | "lounge";
}

export type FurnitureType =
  | "desk"
  | "dual-monitor"
  | "laptop"
  | "dual-monitor-desk"
  | "laptop-desk"
  | "reception-desk"
  | "chair"
  | "monitor"
  | "whiteboard"
  | "plant"
  | "meeting-table"
  | "server-rack"
  | "command-screen"
  | "sofa"
  | "bookshelf"
  | "lamp"
  | "floor-lamp"
  | "coffee-table"
  | "filing-cabinet"
  | "coffee-machine"
  | "wall-sign"
  | "small-divider"
  | "divider"
  | "glass-partition"
  | "wall-screen"
  | "test-bench"
  | "rug";

export interface Furniture {
  id: string;
  type: FurnitureType;
  /** Grid position (top-left). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Rotation in degrees (0/90/180/270) for variety. */
  rot?: number;
  zone?: OfficeZoneId;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  state: AgentState;
  /** Slug of the Codex Pet used to render this agent. */
  petSlug: string;
  zone: OfficeZoneId;
  task: string;
  /** 0..100. */
  energy: number;
  /** Current grid position (interpolated when walking). */
  gridX: number;
  gridY: number;
  /** Optional override of the active animation alias. */
  animationOverride?: CodexPetAnimationAlias;
  /** Mock next action shown in the inspector. */
  nextAction: string;
}

export interface OfficeEvent {
  id: string;
  time: string;
  agentId: string;
  agentName: string;
  role: AgentRole;
  message: string;
  kind: "info" | "success" | "warning" | "risk";
}

export interface RoleFilter {
  role: AgentRole;
  petSlug: string;
  accent: string;
  emoji: string;
}
