/**
 * officeSceneV2Layout.ts — OfficeSceneV2 curated layout.
 *
 * A COMPACT 22×18 grid (vs the old 30×24) so the office fills more of the
 * viewport and reads as dense. All coordinates are hand-placed and
 * intentional — no procedural generation.
 *
 * Zones are distinguished by FURNITURE, not paint: colors here are very faint
 * tints (used at ~12% opacity) just for subtle floor differentiation.
 */
import type { OfficeZoneId, GridRect } from "../types";

/** Compact grid dimensions for V2. */
export const V2_GRID = { w: 22, h: 18 };

export interface V2Zone {
  id: OfficeZoneId;
  name: string;
  rect: GridRect;
  /** Very faint floor tint (applied at low opacity by the floor layer). */
  tint: string;
  /** Accent color for that zone's glow / signage. */
  accent: string;
}

/**
 * 8 curated zones tiling the 22×18 grid. Corridors (1-cell gaps) form
 * walkable aisles between the zone bands so agents can move naturally.
 */
export const V2_ZONES: V2Zone[] = [
  {
    id: "strategy-room",
    name: "Meeting / Strategy",
    rect: { x: 0, y: 0, w: 6, h: 6 },
    tint: "#1a1525",
    accent: "#a855f7",
  },
  {
    id: "reception",
    name: "Reception / Lobby",
    rect: { x: 6, y: 0, w: 5, h: 5 },
    tint: "#15191f",
    accent: "#f59e0b",
  },
  {
    id: "engineering-pods",
    name: "Engineering Pods",
    rect: { x: 11, y: 0, w: 11, h: 7 },
    tint: "#0e1622",
    accent: "#3b82f6",
  },
  {
    id: "open-workspace",
    name: "Open Workspace",
    rect: { x: 6, y: 5, w: 5, h: 6 },
    tint: "#101828",
    accent: "#60a5fa",
  },
  {
    id: "research-library",
    name: "Research / QA",
    rect: { x: 0, y: 6, w: 6, h: 6 },
    tint: "#0f1a24",
    accent: "#22d3ee",
  },
  {
    id: "finance-desk",
    name: "Finance / Legal",
    rect: { x: 0, y: 12, w: 6, h: 6 },
    tint: "#14180e",
    accent: "#84cc16",
  },
  {
    id: "break-area",
    name: "Break Area",
    rect: { x: 6, y: 11, w: 4, h: 7 },
    tint: "#0f1814",
    accent: "#10b981",
  },
  {
    id: "command-center",
    name: "Command Center",
    rect: { x: 10, y: 7, w: 12, h: 11 },
    tint: "#0a1320",
    accent: "#22d3ee",
  },
];

/** Look up a V2 zone by id. */
export function getV2Zone(id: string): V2Zone | undefined {
  return V2_ZONES.find((z) => z.id === id);
}

/**
 * V2 furniture items — each is a semantic object with a known visual
 * component (rendered by OfficeSceneV2Furniture). Unlike the old furniture.ts,
 * these are typed by the Iso* component that draws them, so each piece is
 * large and recognizable.
 */
export type V2FurnitureType =
  | "desk"
  | "dual-monitor-desk"
  | "laptop-desk"
  | "reception-desk"
  | "chair"
  | "meeting-table"
  | "command-wall"
  | "command-screen"
  | "presentation-screen"
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
  | "wall-sign";

export interface V2Furniture {
  id: string;
  type: V2FurnitureType;
  zone: OfficeZoneId;
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** Optional label text for signage (reception desk, wall sign). */
  label?: string;
}

/** Helper to push furniture concisely. */
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
 * A complete workstation: desk + chair + monitor. Returns 3 furniture items.
 * The chair sits in front of the desk (y+1); the monitor is on the desk.
 */
function workstationV2(
  zone: OfficeZoneId,
  x: number,
  y: number,
  dual = false
): V2Furniture[] {
  const items: V2Furniture[] = [];
  items.push(MF(dual ? "dual-monitor-desk" : "desk", zone, x, y));
  items.push(MF("chair", zone, x, y + 1));
  // monitor count is implied by desk type (rendered inside IsoDesk/IsoDualMonitorDesk)
  return items;
}

/**
 * The curated V2 furniture layout. Hand-placed for maximum readability.
 * Every anchor in officeSceneV2Anchors references one of these furniture ids
 * via nearbyFurnitureId.
 */
export const V2_FURNITURE: V2Furniture[] = [
  // ================================================================
  // MEETING / STRATEGY ROOM (0,0 6×6)
  // ================================================================
  MF("rug", "strategy-room", 1, 1, 4, 4),
  MF("meeting-table", "strategy-room", 1, 2, 4, 2),
  MF("chair", "strategy-room", 1, 1),
  MF("chair", "strategy-room", 2, 1),
  MF("chair", "strategy-room", 3, 1),
  MF("chair", "strategy-room", 4, 1),
  MF("chair", "strategy-room", 1, 4),
  MF("chair", "strategy-room", 4, 4),
  MF("whiteboard", "strategy-room", 5, 1),
  MF("presentation-screen", "strategy-room", 5, 3),
  MF("glass-partition", "strategy-room", 0, 0, 6, 1), // front glass wall
  MF("plant", "strategy-room", 0, 5),
  MF("floor-lamp", "strategy-room", 3, 0),

  // ================================================================
  // RECEPTION / LOBBY (6,0 5×5)
  // ================================================================
  MF("reception-desk", "reception", 7, 1, 3, 1, "AGENT OFFICE"),
  MF("chair", "reception", 8, 2),
  MF("wall-sign", "reception", 7, 0, 3, 1, "AGENT OFFICE"),
  MF("sofa", "reception", 6, 3, 2, 1),
  MF("plant", "reception", 10, 1),
  MF("plant", "reception", 6, 4),
  MF("rug", "reception", 6, 3, 4, 1),
  MF("floor-lamp", "reception", 10, 3),

  // ================================================================
  // ENGINEERING PODS (11,0 11×7) — 3 pods of dual-monitor desks
  // ================================================================
  // Pod 1
  ...workstationV2("engineering-pods", 12, 1, true),
  ...workstationV2("engineering-pods", 14, 1, true),
  // Pod 2
  ...workstationV2("engineering-pods", 16, 1, true),
  ...workstationV2("engineering-pods", 18, 1, true),
  // Pod 3
  ...workstationV2("engineering-pods", 20, 1, true),
  MF("server-rack", "engineering-pods", 20, 5),
  MF("whiteboard", "engineering-pods", 12, 5, 2, 1),
  MF("plant", "engineering-pods", 11, 6),
  MF("plant", "engineering-pods", 21, 6),
  MF("floor-lamp", "engineering-pods", 16, 6),
  MF("divider", "engineering-pods", 15, 0, 1, 4), // between pod 1 and 2
  MF("divider", "engineering-pods", 19, 0, 1, 4), // between pod 2 and 3

  // ================================================================
  // OPEN WORKSPACE (6,5 5×6) — 4 workstations + laptop
  // ================================================================
  ...workstationV2("open-workspace", 7, 6),
  ...workstationV2("open-workspace", 9, 6),
  ...workstationV2("open-workspace", 7, 9),
  ...workstationV2("open-workspace", 9, 9),
  ...workstationV2("open-workspace", 6, 6),
  MF("whiteboard", "open-workspace", 10, 6, 1, 2),
  MF("plant", "open-workspace", 6, 10),
  MF("plant", "open-workspace", 10, 10),
  MF("floor-lamp", "open-workspace", 8, 10),
  MF("rug", "open-workspace", 6, 6, 5, 5),

  // ================================================================
  // RESEARCH / QA (0,6 6×6) — shelves + test benches + analysis
  // ================================================================
  MF("bookshelf", "research-library", 0, 7),
  MF("bookshelf", "research-library", 0, 9),
  MF("bookshelf", "research-library", 0, 11),
  MF("bookshelf", "research-library", 5, 7),
  ...workstationV2("research-library", 2, 7),
  ...workstationV2("research-library", 2, 10),
  MF("whiteboard", "research-library", 4, 10, 1, 2),
  MF("plant", "research-library", 1, 6),
  MF("floor-lamp", "research-library", 3, 11),

  // ================================================================
  // FINANCE / LEGAL (0,12 6×6)
  // ================================================================
  ...workstationV2("finance-desk", 1, 13),
  ...workstationV2("finance-desk", 3, 13),
  MF("filing-cabinet", "finance-desk", 1, 15),
  MF("filing-cabinet", "finance-desk", 3, 15),
  MF("plant", "finance-desk", 5, 13),
  MF("floor-lamp", "finance-desk", 0, 12),
  MF("rug", "finance-desk", 0, 13, 5, 4),

  // ================================================================
  // BREAK AREA (6,11 4×7)
  // ================================================================
  MF("sofa", "break-area", 6, 12, 3, 1),
  MF("sofa", "break-area", 6, 15, 3, 1),
  MF("coffee-table", "break-area", 7, 14, 2, 1),
  MF("coffee-machine", "break-area", 6, 11),
  MF("plant", "break-area", 9, 12),
  MF("plant", "break-area", 9, 16),
  MF("floor-lamp", "break-area", 9, 14),

  // ================================================================
  // COMMAND CENTER (10,7 12×11) — the WOW zone
  // ================================================================
  MF("command-wall", "command-center", 11, 7, 10, 2), // wall of 6 large screens
  MF("rug", "command-center", 11, 10, 10, 6),
  MF("meeting-table", "command-center", 13, 11, 6, 2), // console table
  MF("chair", "command-center", 13, 13),
  MF("chair", "command-center", 15, 13),
  MF("chair", "command-center", 17, 13),
  MF("chair", "command-center", 13, 10),
  MF("chair", "command-center", 17, 10),
  MF("server-rack", "command-center", 11, 16),
  MF("server-rack", "command-center", 12, 16),
  MF("whiteboard", "command-center", 20, 10, 1, 3),
  MF("plant", "command-center", 11, 9),
  MF("plant", "command-center", 20, 16),
  MF("floor-lamp", "command-center", 19, 9),
  MF("floor-lamp", "command-center", 11, 14),
  MF("glass-partition", "command-center", 10, 7, 1, 8), // left glass wall
  MF("glass-partition", "command-center", 10, 7, 12, 1), // front glass

  // ================================================================
  // Corridor greenery (fills negative space between zones)
  // ================================================================
  MF("plant", "open-workspace", 11, 6),
  MF("plant", "open-workspace", 11, 9),
  MF("floor-lamp", "open-workspace", 5, 8),

  // Additional partitions/dividers to meet the 8+ minimum and define zones
  MF("divider", "open-workspace", 6, 5, 1, 3), // separates open-workspace from reception
  MF("divider", "finance-desk", 6, 12, 1, 4), // separates finance from break
  MF("glass-partition", "strategy-room", 6, 0, 1, 4), // right wall of strategy room
];

/** Quick metric audit for V2. */
export function v2Metrics() {
  const c: Record<string, number> = {};
  for (const f of V2_FURNITURE) {
    const key = f.type;
    c[key] = (c[key] ?? 0) + 1;
  }
  // Count desks (workstations expand to desk+chair)
  const desks =
    (c["desk"] ?? 0) + (c["dual-monitor-desk"] ?? 0) + (c["laptop-desk"] ?? 0);
  return {
    desks,
    chairs: c["chair"] ?? 0,
    monitors: desks + (c["command-wall"] ?? 0) * 6 + (c["presentation-screen"] ?? 0),
    commandScreens: (c["command-wall"] ?? 0) * 6,
    meetingTables: c["meeting-table"] ?? 0,
    sofas: c["sofa"] ?? 0,
    bookshelves: c["bookshelf"] ?? 0,
    cabinets: c["filing-cabinet"] ?? 0,
    plants: c["plant"] ?? 0,
    lamps: c["floor-lamp"] ?? 0,
    partitions: (c["glass-partition"] ?? 0) + (c["divider"] ?? 0),
    rugs: c["rug"] ?? 0,
    total: V2_FURNITURE.length,
  };
}
