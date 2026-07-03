/**
 * Office furniture — v0.2.
 *
 * Most desks are generated from the DESK_SPOTS in lib/officeLayout.ts so that
 * furniture and agent seating stay perfectly aligned (agents sit in front of
 * their desk, never on top of it). Zone-specific pieces (meeting tables,
 * server racks, sofas, plants, lamps, the command wall, whiteboards) are
 * added explicitly to give each zone a recognizable, dense, lived-in look.
 */
import type { Furniture } from "../types";
import { DESK_SPOTS } from "../lib/officeLayout";

const furniture: Furniture[] = [];
let fid = 0;
const F = (
  type: Furniture["type"],
  x: number,
  y: number,
  w = 1,
  h = 1,
  zone?: Furniture["zone"],
  rot?: number
) => {
  fid += 1;
  furniture.push({ id: `f-${fid}`, type, x, y, w, h, zone, rot });
};

// --- Workstation desks, generated from desk spots ----------------
// A "desk" renders as a COMPOSITE unit (surface + monitor + chair), so we
// only emit one desk piece per spot — no separate monitor/chair that would
// overlap. Engineering pods get dual-monitor desks; QA/finance get regular
// desks; research gets laptop desks.
const ZONE_DESK_TYPE: Record<string, Furniture["type"]> = {
  "engineering-pods": "dual-monitor-desk",
  "qa-lab": "desk",
  "finance-desk": "desk",
  "research-library": "laptop-desk",
  "open-workspace": "desk",
  "security-desk": "dual-monitor-desk",
};
for (const spot of DESK_SPOTS) {
  const dt = ZONE_DESK_TYPE[spot.zone] ?? "desk";
  F(dt, spot.desk.x, spot.desk.y, spot.desk.w, spot.desk.h, spot.zone);
}

// --- Reception -----------------------------------------------------------
// (desk-rec-1 already provides the reception workstation; here we add the
// branded sign, waiting sofa and greenery so it reads as a lobby.)
F("wall-sign", 3, 0, 3, 1, "reception");
F("sofa", 1, 3, 2, 1, "reception");
F("plant", 5, 1, 1, 1, "reception");
F("plant", 1, 4, 1, 1, "reception");
F("floor-lamp", 6, 3, 1, 1, "reception");
F("rug", 2, 3, 3, 1, "reception");

// --- Open Workspace extras ----------------------------------------------
F("whiteboard", 14, 5, 2, 1, "open-workspace");
F("plant", 7, 6, 1, 1, "open-workspace");
F("plant", 15, 6, 1, 1, "open-workspace");
F("lamp", 11, 6, 1, 1, "open-workspace");

// --- Engineering Pods extras --------------------------------------------
F("server-rack", 28, 5, 1, 2, "engineering-pods");
F("whiteboard", 17, 6, 2, 1, "engineering-pods");
F("plant", 17, 6, 1, 1, "engineering-pods");
F("plant", 28, 1, 1, 1, "engineering-pods");
F("lamp", 22, 6, 1, 1, "engineering-pods");

// --- Strategy Room (meeting table + whiteboard) -------------------------
F("meeting-table", 1, 6, 5, 3, "strategy-room");
F("whiteboard", 6, 5, 1, 2, "strategy-room");
F("plant", 1, 10, 1, 1, "strategy-room");
F("lamp", 3, 5, 1, 1, "strategy-room");
F("chair", 2, 6, 1, 1, "strategy-room");
F("chair", 5, 6, 1, 1, "strategy-room");
F("chair", 2, 9, 1, 1, "strategy-room");
F("chair", 5, 9, 1, 1, "strategy-room");

// --- Research Library (bookshelves + analysis desks) --------------------
F("bookshelf", 6, 13, 1, 4, "research-library");
F("bookshelf", 1, 17, 5, 1, "research-library");
F("lamp", 3, 13, 1, 1, "research-library");
F("plant", 1, 13, 1, 1, "research-library");

// --- War Room (big screen wall + meeting table) -------------------------
F("command-screen", 1, 18, 1, 1, "war-room");
F("command-screen", 2, 18, 1, 1, "war-room");
F("command-screen", 3, 18, 1, 1, "war-room");
F("meeting-table", 2, 21, 5, 2, "war-room");
F("whiteboard", 8, 19, 1, 2, "war-room");
F("chair", 3, 21, 1, 1, "war-room");
F("chair", 6, 21, 1, 1, "war-room");

// --- QA Lab extras (test benches + checklist board) ----------------------
F("test-bench", 8, 16, 1, 1, "qa-lab");
F("test-bench", 11, 16, 1, 1, "qa-lab");
F("whiteboard", 12, 13, 1, 2, "qa-lab");
F("plant", 8, 13, 1, 1, "qa-lab");
F("floor-lamp", 11, 13, 1, 1, "qa-lab");

// --- Finance Desk extras (filing cabinets + formal) ----------------------
F("filing-cabinet", 12, 22, 1, 1, "finance-desk");
F("filing-cabinet", 13, 22, 1, 1, "finance-desk");
F("plant", 8, 22, 1, 1, "finance-desk");
F("floor-lamp", 8, 19, 1, 1, "finance-desk");
F("bookshelf", 8, 22, 1, 1, "finance-desk");

// --- Command Center Wall (a wall of screens) ----------------------------
for (let i = 0; i < 8; i++) {
  F("command-screen", 15 + i * 2, 12, 1, 1, "command-center");
}
F("meeting-table", 18, 15, 8, 1, "command-center");
F("chair", 19, 15, 1, 1, "command-center");
F("chair", 23, 15, 1, 1, "command-center");

// --- Client Success (lounge) --------------------------------------------
F("sofa", 15, 19, 2, 1, "client-success");
F("sofa", 15, 22, 2, 1, "client-success");
F("coffee-table", 18, 20, 2, 1, "client-success");
F("plant", 20, 19, 1, 1, "client-success");
F("lamp", 16, 19, 1, 1, "client-success");

// --- Break Area (sofa + coffee machine + snack) -------------------------
F("sofa", 23, 19, 2, 1, "break-area");
F("coffee-table", 23, 21, 2, 1, "break-area");
F("coffee-machine", 22, 19, 1, 1, "break-area");
F("plant", 24, 22, 1, 1, "break-area");
F("plant", 22, 22, 1, 1, "break-area");
F("floor-lamp", 25, 20, 1, 1, "break-area");

// --- Security Desk extras -----------------------------------------------
F("server-rack", 28, 19, 1, 2, "security-desk");
F("command-screen", 27, 19, 1, 1, "security-desk");
F("plant", 26, 22, 1, 1, "security-desk");

// --- Corridor plants (so the floor doesn't feel empty between zones) ----
F("plant", 9, 9, 1, 1);
F("plant", 13, 11, 1, 1);
F("plant", 20, 11, 1, 1);
F("plant", 25, 11, 1, 1);
F("lamp", 11, 9, 1, 1);
F("lamp", 22, 11, 1, 1);

export const FURNITURE: Furniture[] = furniture;
