/**
 * FurnitureLayer — v0.2.
 *
 * Renders three layers of the office, back-to-front within this pass:
 *   1. WallLayer  — outer perimeter walls + glass partitions (drawn first so
 *      they sit behind furniture/agents).
 *   2. Floor decor — rugs.
 *   3. Furniture  — desks, monitors, chairs, plants, lamps, sofas, tables,
 *      bookshelves, server racks, command screens.
 *
 * Everything is positioned in screen space (see lib/isometric.ts) and
 * depth-sorted by z-index = (x + y) so sprites don't overlap incorrectly.
 * Wall segments are rendered as thin extruded slabs to give the office real
 * physical edges instead of floating furniture on a flat tint.
 */
import { memo } from "react";
import type { Furniture, FurnitureType } from "../types";
import { FURNITURE } from "../data/furniture";
import { ALL_WALLS, type WallSegment } from "../lib/officeLayout";
import {
  DEFAULT_TILE,
  gridCenterToScreen,
  gridToScreen,
  type TileSize,
} from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

/**
 * Render a wall segment. v0.3: walls are deliberately LOW and light so they
 * read as subtle office enclosure / glass partitions, NOT dungeon barriers.
 *   - outer : thin low baseboard along the building edge
 *   - glass : translucent short partition with a faint frame
 *   - low   : a very low planter-style divider
 */
function WallSlab({
  seg,
  tile,
  originX,
  originY,
}: {
  seg: WallSegment;
  tile: TileSize;
  originX: number;
  originY: number;
}) {
  const a = gridToScreen(seg.x1, seg.y1, tile);
  const b = gridToScreen(seg.x2, seg.y2, tile);
  const ax = a.x - originX;
  const ay = a.y - originY;
  const bx = b.x - originX;
  const by = b.y - originY;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const depthKey = Math.min(seg.x1, seg.x2) + Math.min(seg.y1, seg.y2);

  // Per-tier visual weight. Walls are deliberately VERY subtle — just a faint
  // edge / glass tint, never a barrier. The office must read as open space.
  const tiers = {
    outer: { thickness: 2, height: 5, opacity: 0.7 },
    glass: { thickness: 3, height: 12, opacity: 0.4 },
    low: { thickness: 4, height: 6, opacity: 0.85 },
  } as const;
  const t = tiers[seg.kind];
  const isGlass = seg.kind === "glass";

  return (
    <div
      style={{
        position: "absolute",
        left: ax,
        top: ay,
        width: len,
        height: t.thickness,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
        zIndex: 200 + depthKey,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: "100%",
          width: "100%",
          height: t.height,
          background: isGlass
            ? "linear-gradient(180deg, rgba(170,215,255,0.45) 0%, rgba(120,170,230,0.22) 100%)"
            : seg.kind === "low"
            ? "linear-gradient(180deg, #2a3a52 0%, #1a2438 100%)"
            : "linear-gradient(180deg, #2a3550 0%, #161e30 100%)",
          borderTop: isGlass
            ? "1px solid rgba(200,230,255,0.7)"
            : `1px solid ${seg.kind === "low" ? "#3a4d6a" : "#33415e"}`,
          boxShadow: isGlass
            ? "0 0 6px rgba(150,200,255,0.25)"
            : "0 3px 6px rgba(0,0,0,0.45)",
          opacity: t.opacity,
          borderRadius: seg.kind === "low" ? 2 : 0,
        }}
      />
      {isGlass && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: "100%",
            width: "100%",
            height: t.height,
            borderTop: "1px solid rgba(200,230,255,0.35)",
            borderLeft: "1px solid rgba(200,230,255,0.18)",
          }}
        />
      )}
    </div>
  );
}

/** The visual for each furniture type, drawn relative to its anchor point.
 * v0.5: every item is a SMALL, standalone, recognizable object. No big
 * rectangles. Desks/chairs/monitors are separate pieces placed at their own
 * grid cells, so a workstation reads as desk + chair + monitor together. */
function Shape({
  type,
  tile,
  span,
}: {
  type: FurnitureType;
  tile: TileSize;
  span: number;
}) {
  // Single-cell items use span 1. Multi-cell (rugs/whiteboards) scale up.
  const baseW = tile.w * Math.max(1, span) * 0.62;
  const baseH = tile.h * Math.max(1, span) * 0.62;
  const surface = "linear-gradient(180deg,#3a4763,#222d44)";
  const woodSurface = "linear-gradient(135deg,#5b4128,#3a2818)";

  switch (type) {
    // ---- DESK: a small desk surface with legs ---------------------------
    case "desk":
      return (
        <div style={{ position: "relative", width: baseW, height: baseH, transform: "translate(-50%,-50%)" }}>
          {/* shadow */}
          <div style={{ position: "absolute", inset: 0, transform: "translateY(2px)", background: "rgba(0,0,0,0.35)", borderRadius: 4, filter: "blur(2px)" }} />
          {/* surface */}
          <div style={{ position: "absolute", inset: 0, background: surface, borderRadius: 4, border: "1px solid rgba(150,180,230,0.3)", boxShadow: "0 3px 5px rgba(0,0,0,0.45)" }} />
          {/* legs hint */}
          <div style={{ position: "absolute", left: "12%", bottom: "-3px", width: 2, height: 4, background: "#1a2438" }} />
          <div style={{ position: "absolute", right: "12%", bottom: "-3px", width: 2, height: 4, background: "#1a2438" }} />
        </div>
      );

    // ---- RECEPTION DESK: taller, branded front --------------------------
    case "reception-desk":
      return (
        <div style={{ position: "relative", width: baseW * 1.4, height: baseH, transform: "translate(-50%,-50%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#4a5d82,#2c3a58)", borderRadius: 5, border: "1px solid rgba(170,195,235,0.35)", boxShadow: "0 4px 7px rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", left: "50%", top: "55%", transform: "translateX(-50%)", fontSize: Math.max(6, baseW * 0.11), fontWeight: 800, letterSpacing: "0.04em", color: "#bfdbfe", textShadow: "0 1px 2px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>RECEPTION</div>
        </div>
      );

    // ---- CHAIR: small office chair --------------------------------------
    case "chair":
      return (
        <div style={{ width: baseW * 0.5, height: baseH * 0.7, transform: "translate(-50%,-60%)", background: "#24324c", borderRadius: "45% 45% 30% 30%", border: "1px solid rgba(150,180,230,0.25)", boxShadow: "0 2px 3px rgba(0,0,0,0.45)" }} />
      );

    // ---- MONITOR: glowing screen on a stand -----------------------------
    case "monitor":
    case "dual-monitor":
      return (
        <div style={{ position: "relative", width: baseW * 0.55, height: baseH * 0.95, transform: "translate(-50%,-78%)" }}>
          {/* screen */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #2563eb", borderRadius: 3, boxShadow: "0 0 7px rgba(59,130,246,0.6), 0 2px 3px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 2, background: "repeating-linear-gradient(180deg, rgba(96,165,250,0.4) 0 2px, transparent 2px 4px)" }} />
          </div>
          {/* stand */}
          <div style={{ position: "absolute", left: "50%", bottom: "-3px", transform: "translateX(-50%)", width: 2, height: 4, background: "#475569" }} />
          <div style={{ position: "absolute", left: "50%", bottom: "-4px", transform: "translateX(-50%)", width: baseW * 0.25, height: 2, background: "#334155", borderRadius: 2 }} />
        </div>
      );
    case "laptop":
      return (
        <div style={{ width: baseW * 0.45, height: baseH * 0.6, transform: "translate(-50%,-65%)", background: "linear-gradient(180deg,#cbd5e1,#64748b)", border: "1px solid #94a3b8", borderRadius: 2, boxShadow: "0 2px 3px rgba(0,0,0,0.5)" }} />
      );

    // ---- COMMAND SCREEN: bigger wall display ----------------------------
    case "command-screen":
    case "wall-screen":
      return (
        <div style={{ width: baseW * 0.8, height: baseH * 1.4, transform: "translate(-50%,-82%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #1f3a5e", borderRadius: 3, boxShadow: "0 0 12px rgba(56,189,248,0.6), 0 3px 5px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 2, background: "repeating-linear-gradient(180deg, rgba(56,189,248,0.25) 0 2px, transparent 2px 5px)" }} />
        </div>
      );

    // ---- MEETING TABLE: small round-ish table (chairs are separate) ------
    case "meeting-table":
      return (
        <div style={{ width: baseW * 1.1, height: baseH * 1.1, transform: "translate(-50%,-50%)", background: woodSurface, border: "1px solid rgba(220,190,140,0.4)", borderRadius: 10, boxShadow: "0 5px 10px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", inset: "16%", border: "1px solid rgba(210,180,130,0.22)", borderRadius: 7, backgroundImage: "repeating-linear-gradient(90deg, rgba(210,180,130,0.07) 0 4px, transparent 4px 8px)" }} />
        </div>
      );

    // ---- COFFEE TABLE: small low table ----------------------------------
    case "coffee-table":
      return (
        <div style={{ width: baseW * 0.8, height: baseH * 0.7, transform: "translate(-50%,-50%)", background: "linear-gradient(180deg,#3a4a66,#27344a)", border: "1px solid rgba(150,180,230,0.2)", borderRadius: 6, boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }} />
      );

    // ---- SOFA: lounge seating -------------------------------------------
    case "sofa":
      return (
        <div style={{ width: baseW * 1.2, height: baseH * 0.8, transform: "translate(-50%,-60%)", background: "linear-gradient(180deg,#4a3a6a,#2e2350)", border: "1px solid rgba(180,150,220,0.3)", borderRadius: "10px 10px 5px 5px", boxShadow: "0 4px 7px rgba(0,0,0,0.4)" }} />
      );

    // ---- WHITEBOARD ------------------------------------------------------
    case "whiteboard":
      return (
        <div style={{ width: baseW * 0.9, height: baseH * 1.3, transform: "translate(-50%,-78%)", background: "linear-gradient(180deg,#eef3fb,#cdd6e6)", border: "2px solid #6b7a99", borderRadius: 2, boxShadow: "0 3px 6px rgba(0,0,0,0.4)", opacity: 0.93, position: "relative" }}>
          <div style={{ position: "absolute", inset: 3, backgroundImage: "linear-gradient(rgba(100,130,180,0.4) 1px, transparent 1px)", backgroundSize: "100% 6px" }} />
        </div>
      );

    // ---- PLANT -----------------------------------------------------------
    case "plant":
      return (
        <div style={{ position: "relative", width: baseW * 0.55, height: baseH * 1.1, transform: "translate(-50%,-80%)" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: baseW * 0.55, height: baseW * 0.55, borderRadius: "50% 50% 45% 45%", background: "radial-gradient(circle at 35% 30%, #4ade80, #16a34a 70%, #15803d)", boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: baseW * 0.3, height: baseH * 0.5, background: "linear-gradient(180deg,#8a5a3b,#5e3c26)", borderRadius: "3px 3px 6px 6px" }} />
        </div>
      );

    // ---- SERVER RACK -----------------------------------------------------
    case "server-rack":
      return (
        <div style={{ width: baseW * 0.48, height: baseH * 1.7, transform: "translate(-50%,-78%)", background: "linear-gradient(180deg,#101826,#070c16)", border: "1px solid #1f3a5e", borderRadius: 2, boxShadow: "0 0 8px rgba(34,211,238,0.3), 0 3px 6px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 3, top: 4 + i * 6, width: 4, height: 4, borderRadius: "50%", background: i % 2 === 0 ? "#22d3ee" : "#f59e0b", opacity: 0.85, boxShadow: "0 0 4px currentColor" }} />
          ))}
        </div>
      );

    // ---- BOOKSHELF (1-wide unit) ----------------------------------------
    case "bookshelf":
      return (
        <div style={{ width: baseW * 0.42, height: baseH * 1.5, transform: "translate(-50%,-72%)", background: "linear-gradient(180deg,#3a2a1a,#241812)", border: "1px solid rgba(200,170,120,0.25)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
          {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"].map((c, i) => (
            <div key={i} style={{ position: "absolute", left: 2 + i * 3, top: 2, bottom: 2, width: 3, background: c, opacity: 0.7 }} />
          ))}
        </div>
      );

    // ---- FILING CABINET --------------------------------------------------
    case "filing-cabinet":
      return (
        <div style={{ position: "relative", width: baseW * 0.45, height: baseH * 1.25, transform: "translate(-50%,-75%)", background: "linear-gradient(180deg,#5b6b86,#33415c)", border: "1px solid #7b8ba8", borderRadius: 3, boxShadow: "0 3px 5px rgba(0,0,0,0.45)", overflow: "hidden" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 2, right: 2, top: 3 + i * (baseH * 0.4), height: 2, background: "#2a3550" }} />
          ))}
        </div>
      );

    // ---- COFFEE MACHINE --------------------------------------------------
    case "coffee-machine":
      return (
        <div style={{ position: "relative", width: baseW * 0.45, height: baseH * 0.9, transform: "translate(-50%,-72%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1e293b,#0f172a)", border: "1px solid #475569", borderRadius: 3 }} />
          <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", width: "50%", height: "30%", background: "#334155", borderRadius: 2 }} />
          <div style={{ position: "absolute", left: "50%", bottom: "12%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 4px #ef4444" }} />
        </div>
      );

    // ---- WALL SIGN -------------------------------------------------------
    case "wall-sign":
      return (
        <div style={{ width: baseW * 0.9, height: baseH * 0.6, transform: "translate(-50%,-90%)", background: "linear-gradient(180deg,#1e3a8a,#172554)", border: "1px solid #3b82f6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(6, baseW * 0.11), fontWeight: 800, color: "#bfdbfe", letterSpacing: "0.06em", boxShadow: "0 0 8px rgba(59,130,246,0.4)", whiteSpace: "nowrap" }}>AGENT OFFICE</div>
      );

    // ---- DIVIDERS / PARTITIONS (small, subtle) --------------------------
    case "small-divider":
    case "divider":
    case "glass-partition":
      return (
        <div style={{ width: baseW * 0.9, height: baseH * 0.5, transform: "translate(-50%,-60%)", background: "linear-gradient(180deg, rgba(150,200,255,0.3), rgba(120,170,230,0.15))", border: "1px solid rgba(200,230,255,0.4)", borderRadius: 3, opacity: 0.6 }} />
      );

    // ---- TEST BENCH ------------------------------------------------------
    case "test-bench":
      return (
        <div style={{ position: "relative", width: baseW, height: baseH }}>
          <div style={{ position: "absolute", inset: 0, transform: "translate(-50%,-50%)", left: "50%", top: "50%", width: baseW, height: baseH, background: "linear-gradient(180deg,#2a3a2a,#1a2418)", border: "1px solid #4a6a3a", borderRadius: 4, boxShadow: "0 3px 5px rgba(0,0,0,0.45)" }} />
          <div style={{ position: "absolute", left: "30%", top: "20%", width: baseW * 0.35, height: baseH * 0.7, transform: "translate(-50%,-50%)", background: "#0a1f3a", border: "1px solid #22d3ee", borderRadius: 2, boxShadow: "0 0 5px rgba(34,211,238,0.5)" }} />
        </div>
      );

    // ---- FLOOR LAMP / LAMP ----------------------------------------------
    case "lamp":
    case "floor-lamp":
      return (
        <div style={{ position: "relative", width: baseW * 0.3, height: baseH * 1.3, transform: "translate(-50%,-75%)" }}>
          <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: baseW * 0.7, height: baseW * 0.7, borderRadius: "50%", background: "radial-gradient(circle, rgba(250,220,150,0.55) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: baseW * 0.3, height: baseW * 0.22, background: "linear-gradient(180deg,#fcd34d,#f59e0b)", borderRadius: "50% 50% 20% 20%" }} />
          <div style={{ position: "absolute", top: baseW * 0.22, left: "50%", transform: "translateX(-50%)", width: 2, bottom: baseH * 0.2, background: "#475569" }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: baseW * 0.35, height: 4, background: "#334155", borderRadius: 3 }} />
        </div>
      );

    // ---- RUG: flat, subtle, under furniture -----------------------------
    case "rug":
      return (
        <div style={{ width: baseW * 1.7, height: baseH * 1.7, transform: "translate(-50%,-50%)", background: "repeating-linear-gradient(45deg, rgba(120,90,60,0.15) 0 6px, rgba(90,60,40,0.15) 6px 12px)", borderRadius: 8, opacity: 0.45 }} />
      );

    // legacy composite desk types (render as plain desk surface)
    case "dual-monitor-desk":
    case "laptop-desk":
      return (
        <div style={{ width: baseW, height: baseH, transform: "translate(-50%,-50%)", background: surface, borderRadius: 4, border: "1px solid rgba(150,180,230,0.3)", boxShadow: "0 3px 5px rgba(0,0,0,0.45)" }} />
      );
    default:
      return null;
  }
}

function FurniturePiece({
  f,
  tile,
  originX,
  originY,
}: {
  f: Furniture;
  tile: TileSize;
  originX: number;
  originY: number;
}) {
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const pos = gridCenterToScreen(cx, cy, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const depth = f.x + f.y;

  return (
    <div
      className="furniture"
      style={{ left, top, zIndex: depth }}
      title={f.type}
    >
      <Shape type={f.type} tile={tile} span={Math.max(f.w, f.h)} />
    </div>
  );
}

function FurnitureLayerImpl({ tile = DEFAULT_TILE, originX, originY }: Props) {
  return (
    <>
      {/* Rugs first (under everything) */}
      {FURNITURE.filter((f) => f.type === "rug").map((f) => (
        <FurniturePiece key={f.id} f={f} tile={tile} originX={originX} originY={originY} />
      ))}
      {/* Walls + partitions */}
      {ALL_WALLS.map((seg, i) => (
        <WallSlab key={`wall-${i}`} seg={seg} tile={tile} originX={originX} originY={originY} />
      ))}
      {/* All other furniture, depth-sorted by the piece's grid position */}
      {[...FURNITURE]
        .filter((f) => f.type !== "rug")
        .sort((a, b) => a.x + a.y - (b.x + b.y))
        .map((f) => (
          <FurniturePiece key={f.id} f={f} tile={tile} originX={originX} originY={originY} />
        ))}
    </>
  );
}

export const FurnitureLayer = memo(FurnitureLayerImpl);
export default FurnitureLayer;
