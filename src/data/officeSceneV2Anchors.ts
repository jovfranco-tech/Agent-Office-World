/**
 * officeSceneV2Anchors.ts — activity anchors for the V2 scene.
 *
 * Each anchor is pegged to a real V2 furniture piece (nearbyFurnitureId)
 * so agents always end up next to a desk / meeting table / screen / sofa —
 * never floating in empty floor. 28+ anchors across all 8 zones.
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
  /** Furniture id this anchor sits next to (validated to exist). */
  nearbyFurnitureId: string;
  preferredRoles?: AgentRole[];
}

/**
 * Build the anchor list. We reference furniture by finding the desk/chair at
 * the relevant grid position, so nearbyFurnitureId always points to a real
 * piece. Sit positions are in front of desks (y+1) or around meeting tables.
 */
function furnitureAt(
  x: number,
  y: number,
  type?: string
): string | undefined {
  const f = V2_FURNITURE.find(
    (p) => p.x === x && p.y === y && (!type || p.type === type)
  );
  return f?.id;
}

export const V2_ANCHORS: V2Anchor[] = [
  // --- Strategy / Meeting Room (around the table) ---
  { id: "v2a-str-1", zoneId: "strategy-room", x: 1, y: 1, activity: "meeting", nearbyFurnitureId: furnitureAt(1, 1, "chair")!, preferredRoles: ["CEO", "PMO", "Strategy"] },
  { id: "v2a-str-2", zoneId: "strategy-room", x: 3, y: 1, activity: "meeting", nearbyFurnitureId: furnitureAt(3, 1, "chair")! },
  { id: "v2a-str-3", zoneId: "strategy-room", x: 4, y: 1, activity: "meeting", nearbyFurnitureId: furnitureAt(4, 1, "chair")! },
  { id: "v2a-str-4", zoneId: "strategy-room", x: 1, y: 4, activity: "meeting", nearbyFurnitureId: furnitureAt(1, 4, "chair")! },
  { id: "v2a-str-5", zoneId: "strategy-room", x: 4, y: 4, activity: "meeting", nearbyFurnitureId: furnitureAt(4, 4, "chair")! },

  // --- Reception / Lobby ---
  { id: "v2a-rec-1", zoneId: "reception", x: 8, y: 2, activity: "reception", nearbyFurnitureId: furnitureAt(8, 2, "chair")!, preferredRoles: ["Documentation"] },
  { id: "v2a-rec-2", zoneId: "reception", x: 7, y: 3, activity: "reception", nearbyFurnitureId: furnitureAt(6, 3, "sofa")! },

  // --- Engineering Pods (in front of dual-monitor desks) ---
  { id: "v2a-eng-1", zoneId: "engineering-pods", x: 12, y: 2, activity: "engineering", nearbyFurnitureId: furnitureAt(12, 1, "dual-monitor-desk")!, preferredRoles: ["Coding", "Infra", "Automation"] },
  { id: "v2a-eng-2", zoneId: "engineering-pods", x: 14, y: 2, activity: "engineering", nearbyFurnitureId: furnitureAt(14, 1, "dual-monitor-desk")! },
  { id: "v2a-eng-3", zoneId: "engineering-pods", x: 16, y: 2, activity: "engineering", nearbyFurnitureId: furnitureAt(16, 1, "dual-monitor-desk")! },
  { id: "v2a-eng-4", zoneId: "engineering-pods", x: 18, y: 2, activity: "engineering", nearbyFurnitureId: furnitureAt(18, 1, "dual-monitor-desk")! },
  { id: "v2a-eng-5", zoneId: "engineering-pods", x: 20, y: 2, activity: "engineering", nearbyFurnitureId: furnitureAt(20, 1, "dual-monitor-desk")! },
  { id: "v2a-eng-6", zoneId: "engineering-pods", x: 20, y: 5, activity: "command-center", nearbyFurnitureId: furnitureAt(20, 5, "server-rack")! },

  // --- Open Workspace (in front of desks) ---
  { id: "v2a-ow-1", zoneId: "open-workspace", x: 7, y: 7, activity: "desk-work", nearbyFurnitureId: furnitureAt(7, 6, "desk")!, preferredRoles: ["Ops", "Support", "Design", "Product"] },
  { id: "v2a-ow-2", zoneId: "open-workspace", x: 9, y: 7, activity: "desk-work", nearbyFurnitureId: furnitureAt(9, 6, "desk")! },
  { id: "v2a-ow-3", zoneId: "open-workspace", x: 7, y: 10, activity: "desk-work", nearbyFurnitureId: furnitureAt(7, 9, "desk")! },
  { id: "v2a-ow-4", zoneId: "open-workspace", x: 9, y: 10, activity: "desk-work", nearbyFurnitureId: furnitureAt(9, 9, "desk")! },
  { id: "v2a-ow-5", zoneId: "open-workspace", x: 6, y: 7, activity: "desk-work", nearbyFurnitureId: furnitureAt(6, 6, "desk")! },

  // --- Research / QA ---
  { id: "v2a-res-1", zoneId: "research-library", x: 2, y: 8, activity: "research", nearbyFurnitureId: furnitureAt(2, 7, "desk")!, preferredRoles: ["Research", "Data", "Documentation"] },
  { id: "v2a-res-2", zoneId: "research-library", x: 2, y: 11, activity: "research", nearbyFurnitureId: furnitureAt(2, 10, "desk")! },
  { id: "v2a-res-3", zoneId: "research-library", x: 0, y: 8, activity: "research", nearbyFurnitureId: furnitureAt(0, 7, "bookshelf")! },
  { id: "v2a-res-4", zoneId: "research-library", x: 4, y: 11, activity: "qa", nearbyFurnitureId: furnitureAt(4, 10, "whiteboard")!, preferredRoles: ["QA", "Product"] },

  // --- Finance / Legal ---
  { id: "v2a-fin-1", zoneId: "finance-desk", x: 1, y: 14, activity: "finance-legal", nearbyFurnitureId: furnitureAt(1, 13, "desk")!, preferredRoles: ["Finance", "Legal/Compliance"] },
  { id: "v2a-fin-2", zoneId: "finance-desk", x: 3, y: 14, activity: "finance-legal", nearbyFurnitureId: furnitureAt(3, 13, "desk")! },
  { id: "v2a-fin-3", zoneId: "finance-desk", x: 1, y: 16, activity: "finance-legal", nearbyFurnitureId: furnitureAt(1, 15, "filing-cabinet")! },

  // --- Break Area ---
  { id: "v2a-brk-1", zoneId: "break-area", x: 7, y: 13, activity: "break", nearbyFurnitureId: furnitureAt(7, 14, "coffee-table")! },
  { id: "v2a-brk-2", zoneId: "break-area", x: 7, y: 12, activity: "break", nearbyFurnitureId: furnitureAt(6, 12, "sofa")! },
  { id: "v2a-brk-3", zoneId: "break-area", x: 6, y: 11, activity: "break", nearbyFurnitureId: furnitureAt(6, 11, "coffee-machine")! },

  // --- Command Center (around console + screens) ---
  { id: "v2a-cmd-1", zoneId: "command-center", x: 13, y: 13, activity: "command-center", nearbyFurnitureId: furnitureAt(13, 13, "chair")!, preferredRoles: ["Security", "Risk", "Ops"] },
  { id: "v2a-cmd-2", zoneId: "command-center", x: 15, y: 13, activity: "command-center", nearbyFurnitureId: furnitureAt(15, 13, "chair")! },
  { id: "v2a-cmd-3", zoneId: "command-center", x: 17, y: 13, activity: "command-center", nearbyFurnitureId: furnitureAt(17, 13, "chair")! },
  { id: "v2a-cmd-4", zoneId: "command-center", x: 13, y: 10, activity: "command-center", nearbyFurnitureId: furnitureAt(13, 10, "chair")! },
  { id: "v2a-cmd-5", zoneId: "command-center", x: 17, y: 10, activity: "command-center", nearbyFurnitureId: furnitureAt(17, 10, "chair")! },
];

/** Map of zone → anchors. */
const V2_BY_ZONE = new Map<OfficeZoneId, V2Anchor[]>();
for (const a of V2_ANCHORS) {
  const list = V2_BY_ZONE.get(a.zoneId) ?? [];
  list.push(a);
  V2_BY_ZONE.set(a.zoneId, list);
}

export function v2AnchorsInZone(zone: OfficeZoneId): V2Anchor[] {
  return V2_BY_ZONE.get(zone) ?? [];
}

/** Pick a free V2 anchor in a zone, preferring the role. */
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

/** Validate that every anchor has a real nearbyFurnitureId. */
export function validateV2Anchors(): { ok: boolean; missing: string[] } {
  const ids = new Set(V2_FURNITURE.map((f) => f.id));
  const missing: string[] = [];
  for (const a of V2_ANCHORS) {
    if (!ids.has(a.nearbyFurnitureId)) missing.push(a.id);
  }
  return { ok: missing.length === 0, missing };
}
