/**
 * officeSceneV2Anchors.ts — V3 anchors matching the V3 layout.
 * ~28 anchors, each next to real furniture. Spread out, not crowded.
 */
import type { AgentRole, OfficeZoneId } from "../types";
import { V2_FURNITURE } from "./officeSceneV2Layout";

export type V2Activity =
  | "desk-work"
  | "engineering"
  | "meeting"
  | "command-center"
  | "research"
  | "qa"
  | "finance-legal"
  | "break"
  | "reception";

export interface V2Anchor {
  id: string;
  zoneId: OfficeZoneId;
  x: number;
  y: number;
  activity: V2Activity;
  nearbyFurnitureId: string;
  preferredRoles?: AgentRole[];
}

function furnitureAt(x: number, y: number, type?: string): string | undefined {
  const f = V2_FURNITURE.find((p) => p.x === x && p.y === y && (!type || p.type === type));
  return f?.id;
}

export const V2_ANCHORS: V2Anchor[] = [
  // Meeting Room (chairs around table)
  { id: "v2a-str-1", zoneId: "strategy-room", x: 3, y: 2, activity: "meeting", nearbyFurnitureId: furnitureAt(3, 2, "chair")!, preferredRoles: ["CEO", "PMO", "Strategy"] },
  { id: "v2a-str-2", zoneId: "strategy-room", x: 5, y: 2, activity: "meeting", nearbyFurnitureId: furnitureAt(5, 2, "chair")! },
  { id: "v2a-str-3", zoneId: "strategy-room", x: 3, y: 5, activity: "meeting", nearbyFurnitureId: furnitureAt(3, 5, "chair")! },
  { id: "v2a-str-4", zoneId: "strategy-room", x: 5, y: 5, activity: "meeting", nearbyFurnitureId: furnitureAt(5, 5, "chair")! },

  // Reception
  { id: "v2a-rec-1", zoneId: "reception", x: 12, y: 3, activity: "reception", nearbyFurnitureId: furnitureAt(12, 3, "chair")!, preferredRoles: ["Documentation"] },
  { id: "v2a-rec-2", zoneId: "reception", x: 13, y: 3, activity: "reception", nearbyFurnitureId: furnitureAt(13, 3, "sofa")! },

  // Engineering (in front of desks)
  { id: "v2a-eng-1", zoneId: "engineering-pods", x: 20, y: 3, activity: "engineering", nearbyFurnitureId: furnitureAt(20, 3, "chair")!, preferredRoles: ["Coding", "Infra", "Automation"] },
  { id: "v2a-eng-2", zoneId: "engineering-pods", x: 22, y: 3, activity: "engineering", nearbyFurnitureId: furnitureAt(22, 3, "chair")! },
  { id: "v2a-eng-3", zoneId: "engineering-pods", x: 25, y: 3, activity: "engineering", nearbyFurnitureId: furnitureAt(25, 3, "chair")! },
  { id: "v2a-eng-4", zoneId: "engineering-pods", x: 27, y: 3, activity: "engineering", nearbyFurnitureId: furnitureAt(27, 3, "chair")! },

  // Open Workspace
  { id: "v2a-ow-1", zoneId: "open-workspace", x: 10, y: 10, activity: "desk-work", nearbyFurnitureId: furnitureAt(10, 10, "chair")!, preferredRoles: ["Ops", "Support", "Design", "Product"] },
  { id: "v2a-ow-2", zoneId: "open-workspace", x: 12, y: 10, activity: "desk-work", nearbyFurnitureId: furnitureAt(12, 10, "chair")! },
  { id: "v2a-ow-3", zoneId: "open-workspace", x: 14, y: 10, activity: "desk-work", nearbyFurnitureId: furnitureAt(14, 10, "chair")! },

  // Research & QA
  { id: "v2a-res-1", zoneId: "research-library", x: 3, y: 11, activity: "research", nearbyFurnitureId: furnitureAt(3, 11, "chair")!, preferredRoles: ["Research", "Data", "Documentation"] },
  { id: "v2a-res-2", zoneId: "research-library", x: 1, y: 10, activity: "research", nearbyFurnitureId: furnitureAt(1, 10, "bookshelf")! },
  { id: "v2a-res-3", zoneId: "research-library", x: 1, y: 12, activity: "research", nearbyFurnitureId: furnitureAt(1, 12, "bookshelf")! },

  // Finance & Legal
  { id: "v2a-fin-1", zoneId: "finance-desk", x: 2, y: 20, activity: "finance-legal", nearbyFurnitureId: furnitureAt(2, 20, "chair")!, preferredRoles: ["Finance", "Legal/Compliance"] },
  { id: "v2a-fin-2", zoneId: "finance-desk", x: 4, y: 20, activity: "finance-legal", nearbyFurnitureId: furnitureAt(4, 20, "chair")! },

  // Break Area
  { id: "v2a-brk-1", zoneId: "break-area", x: 12, y: 19, activity: "break", nearbyFurnitureId: furnitureAt(12, 19, "coffee-table")! },
  { id: "v2a-brk-2", zoneId: "break-area", x: 11, y: 21, activity: "break", nearbyFurnitureId: furnitureAt(11, 21, "coffee-machine")! },

  // Command Center (hero zone)
  { id: "v2a-cmd-1", zoneId: "command-center", x: 23, y: 17, activity: "command-center", nearbyFurnitureId: furnitureAt(23, 17, "chair")!, preferredRoles: ["Security", "Risk", "Ops"] },
  { id: "v2a-cmd-2", zoneId: "command-center", x: 25, y: 17, activity: "command-center", nearbyFurnitureId: furnitureAt(25, 17, "chair")! },
];

const V2_BY_ZONE = new Map<OfficeZoneId, V2Anchor[]>();
for (const a of V2_ANCHORS) {
  const list = V2_BY_ZONE.get(a.zoneId) ?? [];
  list.push(a);
  V2_BY_ZONE.set(a.zoneId, list);
}

export function v2AnchorsInZone(zone: OfficeZoneId): V2Anchor[] {
  return V2_BY_ZONE.get(zone) ?? [];
}

export function pickFreeV2Anchor(
  zone: OfficeZoneId,
  role: AgentRole,
  occupied: Set<string>
): V2Anchor | undefined {
  const list = v2AnchorsInZone(zone);
  if (list.length === 0) return undefined;
  const free = list.filter((a) => !occupied.has(`${a.x},${a.y}`));
  const pool = free.length ? free : list;
  const preferred = pool.filter((a) => a.preferredRoles?.includes(role));
  const chosen = preferred.length ? preferred : pool;
  return chosen[Math.floor(Math.random() * chosen.length)];
}

export function validateV2Anchors(): { ok: boolean; missing: string[] } {
  const ids = new Set(V2_FURNITURE.map((f) => f.id));
  const missing: string[] = [];
  for (const a of V2_ANCHORS) {
    if (!ids.has(a.nearbyFurnitureId)) missing.push(a.id);
  }
  return { ok: missing.length === 0, missing };
}
