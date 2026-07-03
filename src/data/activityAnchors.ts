/**
 * activityAnchors.ts — v0.6
 *
 * Role-aware "activity anchors" scattered across each zone. When Live Mode is
 * active, the activity scheduler moves agents toward these anchors (not random
 * cells), so an agent always ends up at a meaningful spot: at a desk, around a
 * meeting table, in front of a screen, by the coffee machine, etc.
 *
 * Coordinates are in grid space and sit inside each zone's interior.
 */
import type { AgentRole, OfficeZoneId, ActivityKind } from "../types";

export type { ActivityKind };

export interface ActivityAnchor {
  id: string;
  zone: OfficeZoneId;
  x: number;
  y: number;
  activity: ActivityKind;
  /** Roles that preferentially use this anchor. */
  preferredRoles?: AgentRole[];
}

export const ACTIVITY_ANCHORS: ActivityAnchor[] = [
  // --- Reception ---
  { id: "a-rec-1", zone: "reception", x: 2, y: 3, activity: "lobby", preferredRoles: ["Documentation"] },
  { id: "a-rec-2", zone: "reception", x: 4, y: 3, activity: "lobby" },

  // --- Open Workspace: desk-work anchors ---
  { id: "a-ow-1", zone: "open-workspace", x: 8, y: 3, activity: "desk-work", preferredRoles: ["Ops", "Support", "Design", "Product"] },
  { id: "a-ow-2", zone: "open-workspace", x: 10, y: 3, activity: "desk-work" },
  { id: "a-ow-3", zone: "open-workspace", x: 12, y: 3, activity: "desk-work" },
  { id: "a-ow-4", zone: "open-workspace", x: 8, y: 5, activity: "desk-work" },
  { id: "a-ow-5", zone: "open-workspace", x: 10, y: 5, activity: "desk-work" },
  { id: "a-ow-6", zone: "open-workspace", x: 12, y: 5, activity: "desk-work" },

  // --- Engineering Pods ---
  { id: "a-eng-1", zone: "engineering-pods", x: 17, y: 3, activity: "desk-work", preferredRoles: ["Coding", "Infra", "Automation"] },
  { id: "a-eng-2", zone: "engineering-pods", x: 19, y: 3, activity: "desk-work" },
  { id: "a-eng-3", zone: "engineering-pods", x: 22, y: 3, activity: "desk-work" },
  { id: "a-eng-4", zone: "engineering-pods", x: 24, y: 3, activity: "desk-work" },
  { id: "a-eng-5", zone: "engineering-pods", x: 27, y: 3, activity: "desk-work" },
  { id: "a-eng-6", zone: "engineering-pods", x: 26, y: 5, activity: "screen-review" },

  // --- Strategy Room: meeting anchors around the table ---
  { id: "a-str-1", zone: "strategy-room", x: 3, y: 7, activity: "meeting", preferredRoles: ["CEO", "PMO", "Strategy"] },
  { id: "a-str-2", zone: "strategy-room", x: 2, y: 8, activity: "meeting" },
  { id: "a-str-3", zone: "strategy-room", x: 4, y: 8, activity: "meeting" },
  { id: "a-str-4", zone: "strategy-room", x: 3, y: 9, activity: "meeting" },

  // --- Research Library ---
  { id: "a-lib-1", zone: "research-library", x: 1, y: 14, activity: "research", preferredRoles: ["Research", "Data", "Documentation"] },
  { id: "a-lib-2", zone: "research-library", x: 3, y: 14, activity: "research" },
  { id: "a-lib-3", zone: "research-library", x: 4, y: 16, activity: "research" },

  // --- War Room ---
  { id: "a-war-1", zone: "war-room", x: 3, y: 21, activity: "meeting" },
  { id: "a-war-2", zone: "war-room", x: 4, y: 22, activity: "command-monitoring" },

  // --- QA Lab ---
  { id: "a-qa-1", zone: "qa-lab", x: 8, y: 14, activity: "qa-test", preferredRoles: ["QA", "Product"] },
  { id: "a-qa-2", zone: "qa-lab", x: 10, y: 14, activity: "qa-test" },
  { id: "a-qa-3", zone: "qa-lab", x: 8, y: 15, activity: "qa-test" },

  // --- Finance / Legal ---
  { id: "a-fin-1", zone: "finance-desk", x: 8, y: 20, activity: "desk-work", preferredRoles: ["Finance", "Legal/Compliance"] },
  { id: "a-fin-2", zone: "finance-desk", x: 10, y: 20, activity: "desk-work" },
  { id: "a-fin-3", zone: "finance-desk", x: 11, y: 21, activity: "desk-work" },

  // --- Client Success ---
  { id: "a-cs-1", zone: "client-success", x: 15, y: 20, activity: "meeting", preferredRoles: ["Sales", "Customer Success"] },
  { id: "a-cs-2", zone: "client-success", x: 17, y: 20, activity: "meeting" },
  { id: "a-cs-3", zone: "client-success", x: 19, y: 21, activity: "desk-work" },

  // --- Break Area ---
  { id: "a-brk-1", zone: "break-area", x: 23, y: 20, activity: "break" },
  { id: "a-brk-2", zone: "break-area", x: 24, y: 21, activity: "break" },

  // --- Security Desk ---
  { id: "a-sec-1", zone: "security-desk", x: 27, y: 20, activity: "command-monitoring", preferredRoles: ["Security", "Risk"] },

  // --- Command Center: screen-review / monitoring ---
  { id: "a-cmd-1", zone: "command-center", x: 18, y: 14, activity: "command-monitoring", preferredRoles: ["Security", "Risk", "Ops"] },
  { id: "a-cmd-2", zone: "command-center", x: 20, y: 14, activity: "screen-review" },
  { id: "a-cmd-3", zone: "command-center", x: 22, y: 14, activity: "screen-review" },
  { id: "a-cmd-4", zone: "command-center", x: 24, y: 14, activity: "command-monitoring" },
];

/** All anchors grouped by zone id. */
const ANCHORS_BY_ZONE = new Map<OfficeZoneId, ActivityAnchor[]>();
for (const a of ACTIVITY_ANCHORS) {
  const list = ANCHORS_BY_ZONE.get(a.zone) ?? [];
  list.push(a);
  ANCHORS_BY_ZONE.set(a.zone, list);
}

export function anchorsInZone(zone: OfficeZoneId): ActivityAnchor[] {
  return ANCHORS_BY_ZONE.get(zone) ?? [];
}

/** Pick a free anchor (one not currently occupied) in a zone, preferring the role. */
export function pickFreeAnchor(
  zone: OfficeZoneId,
  role: AgentRole,
  occupied: Set<string>
): ActivityAnchor | undefined {
  const list = anchorsInZone(zone);
  if (list.length === 0) return undefined;
  const free = list.filter((a) => !occupied.has(`${a.x},${a.y}`));
  const pool = free.length ? free : list;
  // Prefer role-matching anchors.
  const preferred = pool.filter((a) => a.preferredRoles?.includes(role));
  const chosen = preferred.length ? preferred : pool;
  return chosen[Math.floor(Math.random() * chosen.length)];
}

export function anchorOccupiedKey(a: { x: number; y: number }): string {
  return `${a.x},${a.y}`;
}
