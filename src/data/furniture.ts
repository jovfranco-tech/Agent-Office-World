/**
 * Office furniture — v0.5 HARD VISUAL REFACTOR.
 *
 * The office is now built ENTIRELY from small, individual, semantic furniture
 * objects (each desk, chair, monitor is its own 1-cell piece). No big
 * rectangles, no composite blocks, no zone-as-color. Zones are readable purely
 * from the arrangement of furniture.
 *
 * Each "workstation" = a desk object + a chair object + a monitor object,
 * placed as three separate items so they read as a real workstation cluster.
 */
import type { Furniture } from "../types";

const furniture: Furniture[] = [];
let fid = 0;

/** Push one furniture item at a grid cell. */
const F = (
  type: Furniture["type"],
  x: number,
  y: number,
  zone?: Furniture["zone"],
  w = 1,
  h = 1
) => {
  fid += 1;
  furniture.push({ id: `f-${fid}`, type, x, y, w, h, zone });
};

/**
 * Place a complete workstation: desk + chair (in front) + monitor (on back).
 * Each is a SEPARATE object so the cluster reads as a real desk.
 * @param x,y back-left corner of the desk; the desk is 1 cell wide.
 */
function workstation(
  x: number,
  y: number,
  zone: Furniture["zone"],
  monitor: "monitor" | "dual-monitor" | "laptop" = "monitor"
) {
  F("desk", x, y, zone);
  F("chair", x, y + 1, zone); // chair in front of the desk
  if (monitor === "dual-monitor") {
    F("monitor", x, y, zone);
    F("monitor", x, y, zone); // second monitor (offset visually by renderer)
  } else if (monitor === "laptop") {
    F("monitor", x, y, zone);
  } else {
    F("monitor", x, y, zone);
  }
}

// ============================================================
// 1. RECEPTION / LOBBY  (zone: 0,0 7×5)
// ============================================================
F("reception-desk", 2, 1, "reception");
F("chair", 2, 2, "reception");
F("wall-sign", 3, 0, "reception"); // "AGENT OFFICE" sign
F("sofa", 1, 3, "reception"); // waiting bench
F("plant", 5, 1, "reception");
F("plant", 1, 4, "reception");
F("floor-lamp", 6, 3, "reception");
F("rug", 2, 3, "reception", 3, 1);

// ============================================================
// 2. OPEN WORKSPACE  (zone: 7,0 9×7) — 6 workstations, 2 rows
// ============================================================
// Row A (back row, y=1)
workstation(8, 1, "open-workspace");
workstation(10, 1, "open-workspace");
workstation(12, 1, "open-workspace");
// Row B (front row, y=4)
workstation(8, 4, "open-workspace");
workstation(10, 4, "open-workspace");
workstation(12, 4, "open-workspace");
// Shared whiteboard + greenery
F("whiteboard", 14, 1, "open-workspace");
F("plant", 7, 6, "open-workspace");
F("plant", 14, 6, "open-workspace");
F("floor-lamp", 11, 6, "open-workspace");

// ============================================================
// 3. ENGINEERING PODS  (zone: 16,0 14×7) — 3 pods of paired desks
// ============================================================
// Pod 1
workstation(17, 1, "engineering-pods", "dual-monitor");
workstation(19, 1, "engineering-pods", "dual-monitor");
// Pod 2
workstation(22, 1, "engineering-pods", "dual-monitor");
workstation(24, 1, "engineering-pods", "dual-monitor");
// Pod 3
workstation(27, 1, "engineering-pods", "dual-monitor");
F("whiteboard", 17, 5, "engineering-pods", 2, 1);
F("server-rack", 28, 5, "engineering-pods");
F("plant", 17, 6, "engineering-pods");
F("plant", 28, 1, "engineering-pods");
F("floor-lamp", 22, 6, "engineering-pods");

// ============================================================
// 4. STRATEGY / MEETING ROOM  (zone: 0,5 7×7)
//    Small conference table + 6 chairs + whiteboard + rug
// ============================================================
F("rug", 1, 6, "strategy-room", 5, 4);
// Small round table (rendered as a small meeting-table, 1 cell)
F("meeting-table", 3, 8, "strategy-room");
// 6 chairs around it
F("chair", 3, 7, "strategy-room"); // top
F("chair", 3, 9, "strategy-room"); // bottom
F("chair", 2, 8, "strategy-room"); // left
F("chair", 4, 8, "strategy-room"); // right
F("chair", 2, 7, "strategy-room"); // top-left
F("chair", 4, 9, "strategy-room"); // bottom-right
F("whiteboard", 6, 6, "strategy-room");
F("plant", 1, 10, "strategy-room");
F("floor-lamp", 1, 6, "strategy-room");

// ============================================================
// 5. WAR ROOM / COMMAND CENTER  (zone: 0,18 9×6) — 4 wall screens + console
// ============================================================
F("command-screen", 1, 18, "war-room");
F("command-screen", 2, 18, "war-room");
F("command-screen", 3, 18, "war-room");
F("command-screen", 4, 18, "war-room");
F("rug", 2, 21, "war-room", 5, 2);
F("meeting-table", 3, 21, "war-room"); // console table
F("chair", 3, 22, "war-room");
F("chair", 4, 22, "war-room");
F("whiteboard", 8, 19, "war-room");
F("floor-lamp", 1, 20, "war-room");

// ============================================================
// 6. RESEARCH / DOCUMENTATION  (zone: 0,12 7×6) — library
// ============================================================
// Bookshelf row (1-wide units)
F("bookshelf", 6, 13, "research-library");
F("bookshelf", 6, 14, "research-library");
F("bookshelf", 6, 15, "research-library");
F("bookshelf", 6, 16, "research-library");
// Analysis desks
workstation(1, 13, "research-library", "laptop");
workstation(3, 13, "research-library", "laptop");
F("whiteboard", 1, 16, "research-library", 2, 1);
F("plant", 1, 12, "research-library");
F("floor-lamp", 4, 16, "research-library");

// ============================================================
// 7. QA LAB  (zone: 7,12 7×6) — test stations
// ============================================================
workstation(8, 13, "qa-lab");
workstation(10, 13, "qa-lab");
F("test-bench", 8, 15, "qa-lab");
F("test-bench", 10, 15, "qa-lab");
F("whiteboard", 12, 13, "qa-lab");
F("plant", 8, 12, "qa-lab");
F("floor-lamp", 11, 16, "qa-lab");

// ============================================================
// 8. FINANCE / LEGAL CORNER  (zone: 7,18 7×6) — formal desks + cabinets
// ============================================================
workstation(8, 19, "finance-desk");
workstation(10, 19, "finance-desk");
F("filing-cabinet", 12, 19, "finance-desk");
F("filing-cabinet", 12, 21, "finance-desk");
F("plant", 8, 22, "finance-desk");
F("floor-lamp", 8, 18, "finance-desk");

// ============================================================
// 9. COMMAND CENTER WALL  (zone: 14,12 16×6) — wall of screens + console
// ============================================================
for (let i = 0; i < 6; i++) {
  F("command-screen", 15 + i * 2, 12, "command-center");
}
F("rug", 18, 14, "command-center", 8, 2);
F("meeting-table", 20, 14, "command-center"); // console
F("chair", 20, 15, "command-center");
F("chair", 22, 15, "command-center");
F("server-rack", 15, 16, "command-center");
F("floor-lamp", 28, 14, "command-center");

// ============================================================
// 10. CLIENT SUCCESS  (zone: 14,18 8×6) — lounge meeting
// ============================================================
F("sofa", 15, 19, "client-success");
F("sofa", 15, 22, "client-success");
F("coffee-table", 17, 20, "client-success");
F("plant", 20, 19, "client-success");
F("floor-lamp", 16, 19, "client-success");

// ============================================================
// 11. BREAK AREA  (zone: 22,18 4×6)
// ============================================================
F("sofa", 23, 19, "break-area");
F("coffee-table", 23, 21, "break-area");
F("coffee-machine", 22, 19, "break-area");
F("plant", 24, 22, "break-area");
F("plant", 22, 22, "break-area");
F("floor-lamp", 25, 20, "break-area");

// ============================================================
// 12. SECURITY DESK  (zone: 26,18 4×6)
// ============================================================
workstation(27, 19, "security-desk", "dual-monitor");
F("server-rack", 28, 21, "security-desk");
F("command-screen", 27, 18, "security-desk");
F("plant", 26, 22, "security-desk");

// ============================================================
// Corridor greenery (subtle, fills negative space between zones)
// ============================================================
F("plant", 13, 10, undefined);
F("plant", 20, 10, undefined);
F("plant", 25, 10, undefined);
F("floor-lamp", 11, 10, undefined);

export const FURNITURE: Furniture[] = furniture;

// ---- Audit helpers --------------------------------------------------------
export function countByType(): Record<string, number> {
  const c: Record<string, number> = {};
  for (const f of FURNITURE) c[f.type] = (c[f.type] ?? 0) + 1;
  return c;
}
