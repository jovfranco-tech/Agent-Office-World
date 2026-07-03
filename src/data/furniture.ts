/**
 * Office furniture layout. Pieces are placed on the grid to give each zone a
 * recognizable, lived-in feel: desks with monitors in engineering, a meeting
 * table in the war room, sofas in the break area, server racks + a command
 * wall, plants scattered around, whiteboards, etc.
 */
import type { Furniture } from "../types";

export const FURNITURE: Furniture[] = [
  // Reception / Lobby
  { id: "f-rec-desk", type: "reception-desk", x: 1, y: 1, w: 3, h: 1, zone: "reception" },
  { id: "f-rec-sofa", type: "sofa", x: 1, y: 3, w: 2, h: 1, zone: "reception" },
  { id: "f-rec-plant", type: "plant", x: 4, y: 1, w: 1, h: 1, zone: "reception" },

  // Open Workspace — hot desks with monitors
  { id: "f-ow-d1", type: "desk", x: 7, y: 2, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-d2", type: "desk", x: 10, y: 2, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-d3", type: "desk", x: 13, y: 2, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-d4", type: "desk", x: 7, y: 5, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-d5", type: "desk", x: 10, y: 5, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-m1", type: "monitor", x: 7, y: 1, w: 1, h: 1, zone: "open-workspace" },
  { id: "f-ow-m2", type: "monitor", x: 10, y: 1, w: 1, h: 1, zone: "open-workspace" },
  { id: "f-ow-m3", type: "monitor", x: 13, y: 1, w: 1, h: 1, zone: "open-workspace" },
  { id: "f-ow-wb", type: "whiteboard", x: 14, y: 5, w: 2, h: 1, zone: "open-workspace" },
  { id: "f-ow-plant", type: "plant", x: 6, y: 6, w: 1, h: 1, zone: "open-workspace" },

  // Engineering Pods — clustered desks + server rack
  { id: "f-eng-d1", type: "desk", x: 17, y: 2, w: 2, h: 1, zone: "engineering-pods" },
  { id: "f-eng-d2", type: "desk", x: 20, y: 2, w: 2, h: 1, zone: "engineering-pods" },
  { id: "f-eng-d3", type: "desk", x: 23, y: 2, w: 2, h: 1, zone: "engineering-pods" },
  { id: "f-eng-d4", type: "desk", x: 17, y: 5, w: 2, h: 1, zone: "engineering-pods" },
  { id: "f-eng-d5", type: "desk", x: 20, y: 5, w: 2, h: 1, zone: "engineering-pods" },
  { id: "f-eng-m1", type: "monitor", x: 17, y: 1, w: 1, h: 1, zone: "engineering-pods" },
  { id: "f-eng-m2", type: "monitor", x: 20, y: 1, w: 1, h: 1, zone: "engineering-pods" },
  { id: "f-eng-m3", type: "monitor", x: 23, y: 1, w: 1, h: 1, zone: "engineering-pods" },
  { id: "f-eng-rack", type: "server-rack", x: 24, y: 5, w: 1, h: 2, zone: "engineering-pods" },
  { id: "f-eng-wb", type: "whiteboard", x: 17, y: 6, w: 2, h: 1, zone: "engineering-pods" },

  // Strategy Room — meeting table + whiteboard
  { id: "f-str-table", type: "meeting-table", x: 1, y: 7, w: 3, h: 2, zone: "strategy-room" },
  { id: "f-str-wb", type: "whiteboard", x: 4, y: 6, w: 1, h: 2, zone: "strategy-room" },
  { id: "f-str-plant", type: "plant", x: 1, y: 9, w: 1, h: 1, zone: "strategy-room" },

  // War Room — big meeting table
  { id: "f-war-table", type: "meeting-table", x: 1, y: 13, w: 4, h: 2, zone: "war-room" },
  { id: "f-war-wb", type: "whiteboard", x: 5, y: 12, w: 1, h: 2, zone: "war-room" },

  // QA Lab — desks + monitors
  { id: "f-qa-d1", type: "desk", x: 8, y: 13, w: 2, h: 1, zone: "qa-lab" },
  { id: "f-qa-d2", type: "desk", x: 11, y: 13, w: 2, h: 1, zone: "qa-lab" },
  { id: "f-qa-m1", type: "monitor", x: 8, y: 12, w: 1, h: 1, zone: "qa-lab" },
  { id: "f-qa-m2", type: "monitor", x: 11, y: 12, w: 1, h: 1, zone: "qa-lab" },
  { id: "f-qa-rack", type: "server-rack", x: 11, y: 15, w: 1, h: 1, zone: "qa-lab" },

  // Research Library — bookshelves + desks
  { id: "f-lib-sh1", type: "bookshelf", x: 14, y: 12, w: 1, h: 2, zone: "research-library" },
  { id: "f-lib-sh2", type: "bookshelf", x: 17, y: 12, w: 1, h: 2, zone: "research-library" },
  { id: "f-lib-d1", type: "desk", x: 14, y: 15, w: 2, h: 1, zone: "research-library" },
  { id: "f-lib-d2", type: "desk", x: 16, y: 15, w: 2, h: 1, zone: "research-library" },

  // Finance Desk
  { id: "f-fin-d1", type: "desk", x: 20, y: 13, w: 2, h: 1, zone: "finance-desk" },
  { id: "f-fin-d2", type: "desk", x: 23, y: 13, w: 2, h: 1, zone: "finance-desk" },
  { id: "f-fin-m1", type: "monitor", x: 20, y: 12, w: 1, h: 1, zone: "finance-desk" },
  { id: "f-fin-plant", type: "plant", x: 24, y: 15, w: 1, h: 1, zone: "finance-desk" },

  // Client Success — lounge meeting table
  { id: "f-cs-table", type: "meeting-table", x: 7, y: 18, w: 3, h: 2, zone: "client-success" },
  { id: "f-cs-sofa", type: "sofa", x: 11, y: 18, w: 2, h: 1, zone: "client-success" },
  { id: "f-cs-plant", type: "plant", x: 7, y: 21, w: 1, h: 1, zone: "client-success" },

  // Break Area — sofas + plants
  { id: "f-brk-sofa1", type: "sofa", x: 15, y: 18, w: 2, h: 1, zone: "break-area" },
  { id: "f-brk-sofa2", type: "sofa", x: 15, y: 20, w: 2, h: 1, zone: "break-area" },
  { id: "f-brk-plant1", type: "plant", x: 17, y: 19, w: 1, h: 1, zone: "break-area" },
  { id: "f-brk-plant2", type: "plant", x: 18, y: 21, w: 1, h: 1, zone: "break-area" },

  // Security Desk
  { id: "f-sec-d1", type: "desk", x: 20, y: 18, w: 2, h: 1, zone: "security-desk" },
  { id: "f-sec-m1", type: "monitor", x: 20, y: 17, w: 1, h: 1, zone: "security-desk" },

  // Command Center Wall — wall of screens
  { id: "f-cmd-s1", type: "command-screen", x: 23, y: 17, w: 1, h: 1, zone: "command-center" },
  { id: "f-cmd-s2", type: "command-screen", x: 23, y: 18, w: 1, h: 1, zone: "command-center" },
  { id: "f-cmd-s3", type: "command-screen", x: 23, y: 19, w: 1, h: 1, zone: "command-center" },
  { id: "f-cmd-s4", type: "command-screen", x: 23, y: 20, w: 1, h: 1, zone: "command-center" },
  { id: "f-cmd-s5", type: "command-screen", x: 25, y: 17, w: 1, h: 1, zone: "command-center" },
  { id: "f-cmd-s6", type: "command-screen", x: 25, y: 19, w: 1, h: 1, zone: "command-center" },

  // Scattered plants in corridors
  { id: "f-cor-plant1", type: "plant", x: 12, y: 9, w: 1, h: 1 },
  { id: "f-cor-plant2", type: "plant", x: 19, y: 10, w: 1, h: 1 },
];
