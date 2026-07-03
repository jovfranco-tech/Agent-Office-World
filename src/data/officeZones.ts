/**
 * Office zones — the continuous floor of the office.
 *
 * The office is a single 26×22 grid. Zones are laid out as rectangles so they
 * tile the plane (no isolated boxes). Agents and furniture are placed inside
 * these rectangles. Empty grid space forms corridors / open floor.
 *
 * Grid origin (0,0) is the back corner. +x goes "right-down", +y goes
 * "left-down" in screen space (see lib/isometric.ts).
 */
import type { OfficeZone } from "../types";

/** Total office grid dimensions. */
export const OFFICE_GRID = { w: 26, h: 22 };

export const OFFICE_ZONES: OfficeZone[] = [
  {
    id: "reception",
    name: "Reception / Lobby",
    rect: { x: 0, y: 0, w: 6, h: 5 },
    color: "#1a2238",
    kind: "open",
    description: "Welcome desk and seating for visitors.",
  },
  {
    id: "open-workspace",
    name: "Open Workspace",
    rect: { x: 6, y: 0, w: 10, h: 7 },
    color: "#16203a",
    kind: "open",
    description: "Hot-desks where multiple agents collaborate in the open.",
  },
  {
    id: "engineering-pods",
    name: "Engineering Pods",
    rect: { x: 16, y: 0, w: 10, h: 7 },
    color: "#0f2236",
    kind: "open",
    description: "Clustered desks for the engineering team.",
  },
  {
    id: "strategy-room",
    name: "Strategy Room",
    rect: { x: 0, y: 5, w: 6, h: 6 },
    color: "#241a30",
    kind: "glass",
    description: "Glassed-in room for strategic planning.",
  },
  {
    id: "war-room",
    name: "War Room",
    rect: { x: 0, y: 11, w: 7, h: 6 },
    color: "#2a1620",
    kind: "glass",
    description: "Intense collaboration room for critical initiatives.",
  },
  {
    id: "qa-lab",
    name: "QA Lab",
    rect: { x: 7, y: 11, w: 6, h: 5 },
    color: "#102a26",
    kind: "lab",
    description: "Testing rigs and quality assurance stations.",
  },
  {
    id: "research-library",
    name: "Research Library",
    rect: { x: 13, y: 11, w: 6, h: 5 },
    color: "#1c2436",
    kind: "open",
    description: "Quiet area for research, reading and analysis.",
  },
  {
    id: "finance-desk",
    name: "Finance Desk",
    rect: { x: 19, y: 11, w: 7, h: 5 },
    color: "#1f2a16",
    kind: "open",
    description: "Budgeting, forecasting and financial controls.",
  },
  {
    id: "client-success",
    name: "Client Success Area",
    rect: { x: 6, y: 16, w: 8, h: 6 },
    color: "#221a2a",
    kind: "lounge",
    description: "Lounge setup for client meetings and success management.",
  },
  {
    id: "break-area",
    name: "Break Area",
    rect: { x: 14, y: 16, w: 5, h: 6 },
    color: "#1a2620",
    kind: "lounge",
    description: "Sofas, plants and a place to recharge.",
  },
  {
    id: "security-desk",
    name: "Security Desk",
    rect: { x: 19, y: 16, w: 3, h: 6 },
    color: "#2a1a1a",
    kind: "open",
    description: "Security monitoring and compliance desk.",
  },
  {
    id: "command-center",
    name: "Command Center Wall",
    rect: { x: 22, y: 16, w: 4, h: 6 },
    color: "#0c1a2a",
    kind: "open",
    description: "Wall of screens showing live metrics and dashboards.",
  },
];

/** Look up a zone by id. */
export function getZone(id: string): OfficeZone | undefined {
  return OFFICE_ZONES.find((z) => z.id === id);
}

/** Find the zone containing a grid point (null if corridor). */
export function zoneAt(x: number, y: number): OfficeZone | null {
  for (const z of OFFICE_ZONES) {
    const { x: zx, y: zy, w, h } = z.rect;
    if (x >= zx && x < zx + w && y >= zy && y < zy + h) return z;
  }
  return null;
}

/** Return all grid cells that belong to a zone (interior, with a 1-cell margin). */
export function zoneInteriorCells(zoneId: string): { x: number; y: number }[] {
  const z = getZone(zoneId);
  if (!z) return [];
  const cells: { x: number; y: number }[] = [];
  for (let x = z.rect.x + 1; x < z.rect.x + z.rect.w - 1; x++) {
    for (let y = z.rect.y + 1; y < z.rect.y + z.rect.h - 1; y++) {
      cells.push({ x, y });
    }
  }
  return cells;
}
