/**
 * officeLayout.ts — v0.2 office realism layer.
 *
 * Defines the structural elements that make the floor read as a real office:
 *   - WALLS: the outer perimeter of the office.
 *   - PARTITIONS: low glass dividers between adjacent zones (so zones are
 *     distinguished but the floor stays continuous — not isolated boxes).
 *   - DESK SPOTS: anchor points where agents sit, each paired with a desk so
 *     agents are positioned sensibly (not randomly on top of furniture).
 *
 * Walls and partitions are grid segments rendered as thin 3D-ish slabs by
 * FurnitureLayer/WallLayer.
 */
import { OFFICE_GRID, OFFICE_ZONES } from "../data/officeZones";
import type { OfficeZoneId } from "../types";

export interface WallSegment {
  /** Start grid cell. */
  x1: number;
  y1: number;
  /** End grid cell (exclusive end). */
  x2: number;
  y2: number;
  /**
   * Wall tier:
   *   - "outer"  : the building perimeter (low, subtle — keeps the office
   *                enclosed without looking like a dungeon barrier).
   *   - "glass"  : translucent glass partition between zones (default).
   *   - "low"    : a very low divider (planter box / half-wall).
   */
  kind: "outer" | "glass" | "low";
}

/**
 * A desk cluster: a desk plus the agent-sitting spot in front of it.
 * Agents are placed at the `sit` position so they appear seated at the desk.
 */
export interface DeskSpot {
  id: string;
  /** The desk footprint (grid rect). */
  desk: { x: number; y: number; w: number; h: number };
  /** Where the agent sits (grid point, in front of the desk). */
  sit: { x: number; y: number };
  /** Which zone this belongs to. */
  zone: OfficeZoneId;
}

/**
 * Build the outer perimeter walls around the whole office.
 */
export function buildOuterWalls(): WallSegment[] {
  const { w, h } = OFFICE_GRID;
  return [
    { x1: 0, y1: 0, x2: w, y2: 0, kind: "outer" }, // top edge
    { x1: 0, y1: 0, x2: 0, y2: h, kind: "outer" }, // left edge
    { x1: w, y1: 0, x2: w, y2: h, kind: "outer" }, // right edge
    { x1: 0, y1: h, x2: w, y2: h, kind: "outer" }, // bottom edge
  ];
}

/**
 * Internal partitions — kept MINIMAL so the floor reads as one continuous
 * open office, not a grid of rooms. Only the meeting rooms (Strategy, War
 * Room) get a light glass enclosure; everything else flows. Open areas are
 * separated by furniture + subtle floor material change, not walls.
 */
export function buildGlassPartitions(): WallSegment[] {
  const segs: WallSegment[] = [];
  // Strategy Room glass enclosure (3 sides, open doorway on the right).
  segs.push({ x1: 0, y1: 5, x2: 7, y2: 5, kind: "glass" }); // front
  segs.push({ x1: 7, y1: 5, x2: 7, y2: 8, kind: "glass" }); // right upper
  segs.push({ x1: 7, y1: 10, x2: 7, y2: 12, kind: "glass" }); // right lower (door gap)
  // War Room glass enclosure (front only, open sides).
  segs.push({ x1: 0, y1: 18, x2: 9, y2: 18, kind: "glass" });
  // A single low divider hinting the Command Center zone.
  segs.push({ x1: 14, y1: 18, x2: 18, y2: 18, kind: "low" });
  segs.push({ x1: 24, y1: 18, x2: 28, y2: 18, kind: "low" });
  return segs;
}

export const ALL_WALLS: WallSegment[] = [
  ...buildOuterWalls(),
  ...buildGlassPartitions(),
];

/**
 * Desk spots — the realistic seating for every agent. Each spot places a desk
 * and a sit-position in front of it. Agents are assigned to these spots by id
 * (see agents.ts), so they always sit sensibly next to their desk, never on
 * top of furniture or floating in corridors.
 *
 * The layout follows the office plan: engineering pods get paired desks,
 * finance/qa get station desks, meeting rooms get table-perimeter seats, etc.
 */
export const DESK_SPOTS: DeskSpot[] = [
  // --- Engineering Pods (4 desks, paired) ---
  { id: "desk-eng-1", zone: "engineering-pods", desk: { x: 17, y: 1, w: 2, h: 1 }, sit: { x: 18, y: 3 } },
  { id: "desk-eng-2", zone: "engineering-pods", desk: { x: 20, y: 1, w: 2, h: 1 }, sit: { x: 21, y: 3 } },
  { id: "desk-eng-3", zone: "engineering-pods", desk: { x: 23, y: 1, w: 2, h: 1 }, sit: { x: 24, y: 3 } },
  { id: "desk-eng-4", zone: "engineering-pods", desk: { x: 26, y: 1, w: 2, h: 1 }, sit: { x: 27, y: 3 } },

  // --- Open Workspace (6 desks in 2 aligned rows) ---
  { id: "desk-ow-1", zone: "open-workspace", desk: { x: 8, y: 1, w: 2, h: 1 }, sit: { x: 9, y: 3 } },
  { id: "desk-ow-2", zone: "open-workspace", desk: { x: 11, y: 1, w: 2, h: 1 }, sit: { x: 12, y: 3 } },
  { id: "desk-ow-3", zone: "open-workspace", desk: { x: 14, y: 1, w: 2, h: 1 }, sit: { x: 15, y: 3 } },
  { id: "desk-ow-4", zone: "open-workspace", desk: { x: 8, y: 5, w: 2, h: 1 }, sit: { x: 9, y: 6 } },
  { id: "desk-ow-5", zone: "open-workspace", desk: { x: 11, y: 5, w: 2, h: 1 }, sit: { x: 12, y: 6 } },
  { id: "desk-ow-6", zone: "open-workspace", desk: { x: 14, y: 5, w: 2, h: 1 }, sit: { x: 15, y: 6 } },

  // --- QA Lab (2 desks) ---
  { id: "desk-qa-1", zone: "qa-lab", desk: { x: 8, y: 13, w: 2, h: 1 }, sit: { x: 9, y: 15 } },
  { id: "desk-qa-2", zone: "qa-lab", desk: { x: 11, y: 13, w: 2, h: 1 }, sit: { x: 12, y: 15 } },

  // --- Finance Desk (2 desks) ---
  { id: "desk-fin-1", zone: "finance-desk", desk: { x: 8, y: 19, w: 2, h: 1 }, sit: { x: 9, y: 21 } },
  { id: "desk-fin-2", zone: "finance-desk", desk: { x: 11, y: 19, w: 2, h: 1 }, sit: { x: 12, y: 21 } },

  // --- Research Library (2 desks) ---
  { id: "desk-lib-1", zone: "research-library", desk: { x: 1, y: 14, w: 2, h: 1 }, sit: { x: 2, y: 16 } },
  { id: "desk-lib-2", zone: "research-library", desk: { x: 4, y: 14, w: 2, h: 1 }, sit: { x: 5, y: 16 } },

  // --- Security Desk (1 console) ---
  { id: "desk-sec-1", zone: "security-desk", desk: { x: 27, y: 19, w: 2, h: 1 }, sit: { x: 28, y: 21 } },

  // --- Reception (1 desk) ---
  { id: "desk-rec-1", zone: "reception", desk: { x: 2, y: 1, w: 3, h: 1 }, sit: { x: 3, y: 3 } },
];

/** Map of desk spot id -> desk spot. */
const SPOTS_BY_ID = new Map(DESK_SPOTS.map((d) => [d.id, d]));

export function getDeskSpot(id: string): DeskSpot | undefined {
  return SPOTS_BY_ID.get(id);
}

/** Standing positions for agents that don't have a desk (meeting rooms, etc). */
export interface StandSpot {
  id: string;
  pos: { x: number; y: number };
  zone: OfficeZoneId;
}

export const STAND_SPOTS: StandSpot[] = [
  // Strategy Room — around the meeting table
  { id: "stand-strat-1", zone: "strategy-room", pos: { x: 2, y: 7 } },
  { id: "stand-strat-2", zone: "strategy-room", pos: { x: 5, y: 7 } },
  // War Room — near the screen wall
  { id: "stand-war-1", zone: "war-room", pos: { x: 2, y: 20 } },
  { id: "stand-war-2", zone: "war-room", pos: { x: 5, y: 20 } },
  // Client Success — lounge
  { id: "stand-cs-1", zone: "client-success", pos: { x: 16, y: 20 } },
  { id: "stand-cs-2", zone: "client-success", pos: { x: 19, y: 20 } },
  // Break area
  { id: "stand-brk-1", zone: "break-area", pos: { x: 23, y: 20 } },
  // Command Center — standing at the screens
  { id: "stand-cmd-1", zone: "command-center", pos: { x: 18, y: 14 } },
  { id: "stand-cmd-2", zone: "command-center", pos: { x: 24, y: 14 } },
];

const STAND_BY_ID = new Map(STAND_SPOTS.map((s) => [s.id, s]));
export function getStandSpot(id: string): StandSpot | undefined {
  return STAND_BY_ID.get(id);
}

/** Re-export zone list for convenience. */
export { OFFICE_ZONES };
