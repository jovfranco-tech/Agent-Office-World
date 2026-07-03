/**
 * Office zones — v0.2: a denser, more realistic continuous office floor.
 *
 * The office is a single 30×24 grid. Zones tile the plane; corridors (empty
 * grid space) form walkable aisles so agents can move between zones and the
 * floor reads as ONE open plan, not isolated boxes.
 *
 * Grid origin (0,0) is the back corner. +x goes "right-down", +y goes
 * "left-down" in screen space (see lib/isometric.ts).
 */
import type { OfficeZone } from "../types";

/** Total office grid dimensions. */
export const OFFICE_GRID = { w: 30, h: 24 };

export const OFFICE_ZONES: OfficeZone[] = [
  {
    id: "reception",
    name: "Reception / Lobby",
    rect: { x: 0, y: 0, w: 7, h: 5 },
    color: "#181f33",
    kind: "open",
    description: "Front desk and seating for visitors entering the office.",
  },
  {
    id: "open-workspace",
    name: "Open Workspace",
    rect: { x: 7, y: 0, w: 9, h: 7 },
    color: "#141d33",
    kind: "open",
    description: "Open hot-desk area for product, design and ops.",
  },
  {
    id: "engineering-pods",
    name: "Engineering Pods",
    rect: { x: 16, y: 0, w: 14, h: 7 },
    color: "#0f2238",
    kind: "open",
    description: "Paired engineering desks with monitors and a server rack.",
  },
  {
    id: "strategy-room",
    name: "Strategy Room",
    rect: { x: 0, y: 5, w: 7, h: 7 },
    color: "#241a30",
    kind: "glass",
    description: "Glassed-in room with a meeting table and whiteboard.",
  },
  {
    id: "research-library",
    name: "Research Library",
    rect: { x: 0, y: 12, w: 7, h: 6 },
    color: "#1c2436",
    kind: "open",
    description: "Quiet area with bookshelves and analysis desks.",
  },
  {
    id: "war-room",
    name: "War Room",
    rect: { x: 0, y: 18, w: 9, h: 6 },
    color: "#2a1620",
    kind: "glass",
    description: "Intense collaboration room with a large wall of screens.",
  },
  {
    id: "qa-lab",
    name: "QA Lab",
    rect: { x: 7, y: 12, w: 7, h: 6 },
    color: "#102a26",
    kind: "lab",
    description: "Testing stations and QA rigs.",
  },
  {
    id: "finance-desk",
    name: "Finance Desk",
    rect: { x: 7, y: 18, w: 7, h: 6 },
    color: "#1f2a16",
    kind: "open",
    description: "Formal finance and compliance desks.",
  },
  {
    id: "client-success",
    name: "Client Success Area",
    rect: { x: 14, y: 18, w: 8, h: 6 },
    color: "#221a2a",
    kind: "lounge",
    description: "Lounge for client meetings and success management.",
  },
  {
    id: "break-area",
    name: "Break Area",
    rect: { x: 22, y: 18, w: 4, h: 6 },
    color: "#1a2620",
    kind: "lounge",
    description: "Sofas, a coffee table and plants to recharge.",
  },
  {
    id: "security-desk",
    name: "Security Desk",
    rect: { x: 26, y: 18, w: 4, h: 6 },
    color: "#2a1a1a",
    kind: "open",
    description: "Security monitoring console and server rack.",
  },
  {
    id: "command-center",
    name: "Command Center Wall",
    rect: { x: 14, y: 12, w: 16, h: 6 },
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
    if (w > 0 && h > 0 && x >= zx && x < zx + w && y >= zy && y < zy + h)
      return z;
  }
  return null;
}

/**
 * Return interior cells of a zone, with a configurable margin so agents/furniture
 * sit inside the zone edges (not on the walls).
 */
export function zoneInteriorCells(
  zoneId: string,
  margin = 1
): { x: number; y: number }[] {
  const z = getZone(zoneId);
  if (!z) return [];
  const cells: { x: number; y: number }[] = [];
  for (let x = z.rect.x + margin; x < z.rect.x + z.rect.w - margin; x++) {
    for (let y = z.rect.y + margin; y < z.rect.y + z.rect.h - margin; y++) {
      cells.push({ x, y });
    }
  }
  return cells;
}
