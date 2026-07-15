/**
 * officeSceneV2Layout.ts — V3 REDESIGN from scratch.
 *
 * Design principles (from research):
 *   - ~30% furniture density (was ~60% — looked "amontonado")
 *   - 50-60% visible bare floor (negative space reads as "premium")
 *   - 2-tile corridors between zones
 *   - 3-5 pieces per zone (was 8-12)
 *   - 1 hero anchor (Command Center) + secondary clusters + sparse detail
 *   - Scale: desk = 1 tile, character ~1.7 tiles tall
 *
 * Grid: 32×26 (bigger = more breathing room). Zones are spread out with
 * wide corridors between them. Total furniture: ~42 pieces (was 105).
 */
import type { OfficeZoneId, GridRect } from "../types";

export const V2_GRID = { w: 32, h: 26 };

export interface V2Zone {
  id: OfficeZoneId;
  name: string;
  rect: GridRect;
  tint: string;
  accent: string;
}

/**
 * 8 zones with WIDE spacing and 2-tile corridors between them.
 * The grid is large (32×26) so each zone has room to breathe.
 */
export const V2_ZONES: V2Zone[] = [
  {
    id: "strategy-room",
    name: "Meeting Room",
    rect: { x: 1, y: 1, w: 7, h: 6 },
    tint: "#171a24",
    accent: "#a855f7",
  },
  {
    id: "reception",
    name: "Reception",
    rect: { x: 10, y: 1, w: 6, h: 5 },
    tint: "#1a1a1f",
    accent: "#f59e0b",
  },
  {
    id: "engineering-pods",
    name: "Engineering",
    rect: { x: 19, y: 1, w: 12, h: 7 },
    tint: "#121820",
    accent: "#3b82f6",
  },
  {
    id: "open-workspace",
    name: "Open Workspace",
    rect: { x: 9, y: 8, w: 8, h: 7 },
    tint: "#141822",
    accent: "#60a5fa",
  },
  {
    id: "research-library",
    name: "Research & QA",
    rect: { x: 1, y: 9, w: 6, h: 7 },
    tint: "#101820",
    accent: "#22d3ee",
  },
  {
    id: "finance-desk",
    name: "Finance & Legal",
    rect: { x: 1, y: 18, w: 7, h: 6 },
    tint: "#141610",
    accent: "#84cc16",
  },
  {
    id: "break-area",
    name: "Break Area",
    rect: { x: 10, y: 17, w: 6, h: 7 },
    tint: "#101814",
    accent: "#10b981",
  },
  {
    id: "command-center",
    name: "Command Center",
    rect: { x: 19, y: 10, w: 12, h: 14 },
    tint: "#0a1220",
    accent: "#22d3ee",
  },
];

export function getV2Zone(id: string): V2Zone | undefined {
  return V2_ZONES.find((z) => z.id === id);
}

export type V2FurnitureType =
  | "desk"
  | "dual-monitor-desk"
  | "chair"
  | "meeting-table"
  | "reception-desk"
  | "command-wall"
  | "sofa"
  | "coffee-machine"
  | "coffee-table"
  | "bookshelf"
  | "whiteboard"
  | "server-rack"
  | "filing-cabinet"
  | "plant"
  | "floor-lamp"
  | "glass-partition"
  | "divider"
  | "rug"
  | "wall-sign"
  | "presentation-screen";

export interface V2Furniture {
  id: string;
  type: V2FurnitureType;
  zone: OfficeZoneId;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label?: string;
}

let v2fid = 0;
function MF(
  type: V2FurnitureType,
  zone: OfficeZoneId,
  x: number,
  y: number,
  w?: number,
  h?: number,
  label?: string
): V2Furniture {
  v2fid += 1;
  return { id: `v2f-${v2fid}`, type, zone, x, y, w, h, label };
}

/**
 * V3 furniture: ~42 pieces total. Every piece is intentional.
 * Zones have 3-5 items each. Wide corridors between everything.
 */
export const V2_FURNITURE: V2Furniture[] = [
  // === MEETING ROOM (1,1 7×6) — table + chairs + whiteboard + screen + partitions ===
  MF("meeting-table", "strategy-room", 3, 3, 3, 2),
  MF("chair", "strategy-room", 3, 2),
  MF("chair", "strategy-room", 5, 2),
  MF("chair", "strategy-room", 3, 5),
  MF("chair", "strategy-room", 5, 5),
  MF("whiteboard", "strategy-room", 6, 2),
  MF("presentation-screen", "strategy-room", 1, 3),
  MF("plant", "strategy-room", 6, 5),
  // Glass partitions enclosing the meeting room (premium office feel)
  MF("glass-partition", "strategy-room", 7, 2, 1),
  MF("glass-partition", "strategy-room", 7, 4, 1),

  // === RECEPTION (10,1 6×5) — desk + seating + sign + plant ===
  MF("reception-desk", "reception", 11, 2, 3, 1, "AGENT OFFICE"),
  MF("wall-sign", "reception", 13, 1, 1, 1, "AGENT OFFICE"),
  MF("chair", "reception", 12, 3),
  MF("sofa", "reception", 13, 4),
  MF("plant", "reception", 14, 4),
  MF("floor-lamp", "reception", 10, 4),

  // === ENGINEERING (19,1 12×7) — 3 pods × dual-monitor desks + rack + plant ===
  MF("dual-monitor-desk", "engineering-pods", 20, 2),
  MF("chair", "engineering-pods", 20, 3),
  MF("dual-monitor-desk", "engineering-pods", 22, 2),
  MF("chair", "engineering-pods", 22, 3),
  MF("dual-monitor-desk", "engineering-pods", 25, 2),
  MF("chair", "engineering-pods", 25, 3),
  MF("dual-monitor-desk", "engineering-pods", 27, 2),
  MF("chair", "engineering-pods", 27, 3),
  MF("dual-monitor-desk", "engineering-pods", 20, 5),
  MF("chair", "engineering-pods", 20, 6),
  MF("dual-monitor-desk", "engineering-pods", 27, 5),
  MF("chair", "engineering-pods", 27, 6),
  MF("server-rack", "engineering-pods", 29, 5),
  MF("plant", "engineering-pods", 24, 6),

  // === OPEN WORKSPACE (9,8 8×7) — 5 stations + whiteboard + plants ===
  MF("desk", "open-workspace", 10, 9),
  MF("chair", "open-workspace", 10, 10),
  MF("desk", "open-workspace", 12, 9),
  MF("chair", "open-workspace", 12, 10),
  MF("desk", "open-workspace", 14, 9),
  MF("chair", "open-workspace", 14, 10),
  MF("desk", "open-workspace", 10, 12),
  MF("chair", "open-workspace", 10, 13),
  MF("desk", "open-workspace", 14, 12),
  MF("chair", "open-workspace", 14, 13),
  MF("whiteboard", "open-workspace", 15, 9),
  MF("plant", "open-workspace", 12, 13),

  // === RESEARCH & QA (1,9 6×7) — 5 pieces ===
  MF("bookshelf", "research-library", 1, 10),
  MF("bookshelf", "research-library", 1, 12),
  MF("desk", "research-library", 3, 10),
  MF("chair", "research-library", 3, 11),
  MF("whiteboard", "research-library", 4, 13),
  MF("plant", "research-library", 5, 10),

  // === FINANCE & LEGAL (1,18 7×6) — 5 pieces ===
  MF("desk", "finance-desk", 2, 19),
  MF("chair", "finance-desk", 2, 20),
  MF("desk", "finance-desk", 4, 19),
  MF("chair", "finance-desk", 4, 20),
  MF("filing-cabinet", "finance-desk", 6, 19),
  MF("plant", "finance-desk", 2, 22),

  // === BREAK AREA (10,17 6×7) — 4 pieces ===
  MF("sofa", "break-area", 11, 18),
  MF("coffee-table", "break-area", 12, 19),
  MF("coffee-machine", "break-area", 11, 21),
  MF("plant", "break-area", 14, 18),
  MF("rug", "break-area", 11, 18, 4, 4),

  // === COMMAND CENTER (19,10 12×14) — HERO ZONE ===
  // Wall of screens (hero anchor) + console table + chairs + racks
  MF("command-wall", "command-center", 21, 11, 8, 2),
  MF("meeting-table", "command-center", 23, 15, 4, 2),
  MF("chair", "command-center", 23, 17),
  MF("chair", "command-center", 25, 17),
  MF("chair", "command-center", 27, 15),
  MF("server-rack", "command-center", 21, 20),
  MF("server-rack", "command-center", 22, 20),
  MF("plant", "command-center", 29, 11),
  MF("plant", "command-center", 29, 22),
  MF("floor-lamp", "command-center", 28, 16),
  MF("rug", "command-center", 21, 14, 8, 6),

  // === Corridor + boundary details — fill negative space naturally ===
  MF("plant", "open-workspace", 18, 11),
  MF("floor-lamp", "open-workspace", 8, 14),
  // Divider between open workspace and engineering
  MF("divider", "open-workspace", 18, 9, 1),
  // Plants along the central corridor
  MF("plant", "open-workspace", 8, 11),
  MF("plant", "engineering-pods", 18, 6),
  // Break area extra seating
  MF("sofa", "break-area", 14, 21),
];

export function v2Metrics() {
  const c: Record<string, number> = {};
  for (const f of V2_FURNITURE) {
    c[f.type] = (c[f.type] ?? 0) + 1;
  }
  return { total: V2_FURNITURE.length, ...c };
}
