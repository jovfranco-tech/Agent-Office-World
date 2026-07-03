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

/** The visual for each furniture type, drawn relative to its anchor point. */
function Shape({
  type,
  tile,
  span,
}: {
  type: FurnitureType;
  tile: TileSize;
  span: number;
}) {
  const baseW = tile.w * Math.max(1, span) * 0.7;
  const baseH = tile.h * Math.max(1, span) * 0.7;

  switch (type) {
    // ---- COMPOSITE WORKSTATION DESKS -------------------------------------
    // A desk renders as ONE unit: surface + monitor on the back edge + a
    // chair in front. This is what makes the office read as an office.
    case "desk":
    case "laptop-desk":
    case "dual-monitor-desk": {
      const dual = type === "dual-monitor-desk";
      const laptop = type === "laptop-desk";
      const monCount = dual ? 2 : 1;
      return (
        <div style={{ position: "relative", width: baseW, height: baseH }}>
          {/* chair (behind desk surface in z, drawn first = appears in front of desk front edge) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "78%",
              width: baseW * 0.4,
              height: baseH * 0.55,
              transform: "translate(-50%, -50%)",
              background: "#1f2c44",
              borderRadius: "45% 45% 30% 30%",
              border: "1px solid rgba(150,180,230,0.25)",
              boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
            }}
          />
          {/* desk surface */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: baseW,
              height: baseH,
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(180deg,#3a4763,#222d44)",
              borderRadius: 4,
              border: "1px solid rgba(150,180,230,0.3)",
              boxShadow: "0 4px 7px rgba(0,0,0,0.5)",
            }}
          />
          {/* monitor(s) on the back edge — glowing blue so workstations read clearly */}
          {Array.from({ length: monCount }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${dual ? (i === 0 ? 30 : 70) : 50}%`,
                top: "8%",
                width: laptop ? baseW * 0.42 : baseW * 0.52,
                height: baseH * 1.0,
                transform: "translate(-50%, -50%)",
                background: laptop
                  ? "linear-gradient(180deg,#cbd5e1,#64748b)"
                  : "linear-gradient(180deg,#0a1f3a,#061427)",
                border: laptop
                  ? "1px solid #94a3b8"
                  : "2px solid #2563eb",
                borderRadius: laptop ? 2 : 3,
                boxShadow: laptop
                  ? "0 2px 3px rgba(0,0,0,0.5)"
                  : "0 0 8px rgba(59,130,246,0.65), 0 2px 3px rgba(0,0,0,0.5)",
                overflow: "hidden",
              }}
            >
              {!laptop && (
                <div
                  style={{
                    position: "absolute",
                    inset: 2,
                    background:
                      "repeating-linear-gradient(180deg, rgba(96,165,250,0.45) 0 2px, transparent 2px 4px)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    }
    case "reception-desk":
      return (
        <div style={{ position: "relative", width: baseW * 1.1, height: baseH }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "translate(0, 0)",
              background: "linear-gradient(180deg,#4a5d82,#2c3a58)",
              borderRadius: 6,
              border: "1px solid rgba(170,195,235,0.35)",
              boxShadow: "0 5px 9px rgba(0,0,0,0.5)",
            }}
          />
          {/* "Agent Office World" sign strip on the front */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "55%",
              transform: "translateX(-50%)",
              fontSize: Math.max(7, baseW * 0.13),
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "#bfdbfe",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            AGENT OFFICE
          </div>
        </div>
      );
    case "monitor":
    case "command-screen":
      return (
        <div
          style={{
            width: baseW * 0.6,
            height: baseH * 1.2,
            transform: "translate(-50%, -88%)",
            background:
              type === "command-screen"
                ? "linear-gradient(180deg,#0a1f3a,#061427)"
                : "linear-gradient(180deg,#0d1e36,#081424)",
            border: "2px solid #1f3a5e",
            borderRadius: 3,
            boxShadow:
              type === "command-screen"
                ? "0 0 12px rgba(56,189,248,0.55), 0 4px 6px rgba(0,0,0,0.5)"
                : "0 0 8px rgba(96,165,250,0.35), 0 4px 6px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 2,
              background:
                "repeating-linear-gradient(180deg, rgba(56,189,248,0.2) 0 2px, transparent 2px 5px)",
            }}
          />
        </div>
      );
    case "chair":
      return (
        <div
          style={{
            width: baseW * 0.42,
            height: baseH * 0.55,
            transform: "translate(-50%, -55%)",
            background: "#1b2a44",
            borderRadius: "40% 40% 30% 30%",
            border: "1px solid rgba(150,180,230,0.22)",
            boxShadow: "0 3px 4px rgba(0,0,0,0.4)",
          }}
        />
      );
    case "whiteboard":
      return (
        <div
          style={{
            width: baseW * 0.95,
            height: baseH * 1.35,
            transform: "translate(-50%, -78%)",
            background: "linear-gradient(180deg,#eef3fb,#cdd6e6)",
            border: "2px solid #6b7a99",
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
            opacity: 0.94,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 3,
              backgroundImage:
                "linear-gradient(rgba(100,130,180,0.4) 1px, transparent 1px)",
              backgroundSize: "100% 6px",
            }}
          />
        </div>
      );
    case "plant":
      return (
        <div
          style={{
            position: "relative",
            width: baseW * 0.55,
            height: baseH * 1.2,
            transform: "translate(-50%, -82%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.55,
              height: baseW * 0.55,
              borderRadius: "50% 50% 45% 45%",
              background:
                "radial-gradient(circle at 35% 30%, #4ade80 0%, #16a34a 70%, #15803d 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.3,
              height: baseH * 0.5,
              background: "linear-gradient(180deg,#8a5a3b,#5e3c26)",
              borderRadius: "3px 3px 6px 6px",
            }}
          />
        </div>
      );
    case "meeting-table": {
      // Composite conference table: wood-grain top + lighter inlay + chairs
      // arranged around the perimeter. This replaces the old solid brown box.
      const w = baseW * 1.15;
      const h = baseH * 1.15;
      const chairPositions = [
        { left: "20%", top: "50%" },
        { left: "80%", top: "50%" },
        { left: "50%", top: "15%" },
        { left: "50%", top: "85%" },
      ];
      return (
        <div
          style={{
            position: "relative",
            width: w,
            height: h,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* chairs behind/beside the table */}
          {chairPositions.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.left,
                top: p.top,
                width: w * 0.26,
                height: h * 0.4,
                transform: "translate(-50%, -50%)",
                background: "#26324a",
                borderRadius: "45% 45% 30% 30%",
                border: "1px solid rgba(150,180,230,0.2)",
                boxShadow: "0 2px 3px rgba(0,0,0,0.45)",
                zIndex: 0,
              }}
            />
          ))}
          {/* tabletop */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: w,
              height: h,
              transform: "translate(-50%, -50%)",
              background:
                "linear-gradient(135deg, #5b4128 0%, #42301c 60%, #342414 100%)",
              border: "1px solid rgba(220,190,140,0.4)",
              borderRadius: 12,
              boxShadow: "0 6px 14px rgba(0,0,0,0.55)",
              zIndex: 1,
            }}
          >
            {/* wood grain inlay */}
            <div
              style={{
                position: "absolute",
                inset: "14%",
                border: "1px solid rgba(210,180,130,0.25)",
                borderRadius: 8,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(210,180,130,0.08) 0 4px, transparent 4px 9px)",
              }}
            />
          </div>
        </div>
      );
    }
    case "coffee-table":
      return (
        <div
          style={{
            width: baseW * 0.85,
            height: baseH * 0.7,
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(180deg,#3a4a66,#27344a)",
            border: "1px solid rgba(150,180,230,0.2)",
            borderRadius: 6,
            boxShadow: "0 4px 7px rgba(0,0,0,0.4)",
          }}
        />
      );
    case "server-rack":
      return (
        <div
          style={{
            width: baseW * 0.48,
            height: baseH * 1.7,
            transform: "translate(-50%, -78%)",
            background: "linear-gradient(180deg,#101826,#070c16)",
            border: "1px solid #1f3a5e",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(34,211,238,0.3), 0 4px 8px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 3,
                top: 4 + i * 6,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#22d3ee" : "#f59e0b",
                opacity: 0.85,
                boxShadow: "0 0 4px currentColor",
              }}
            />
          ))}
        </div>
      );
    case "sofa":
      return (
        <div
          style={{
            width: baseW * 1.05,
            height: baseH * 0.75,
            transform: "translate(-50%, -58%)",
            background: "linear-gradient(180deg,#4a3a6a,#2e2350)",
            border: "1px solid rgba(180,150,220,0.3)",
            borderRadius: "10px 10px 5px 5px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          }}
        />
      );
    case "bookshelf":
      return (
        <div
          style={{
            width: baseW * 0.42,
            height: baseH * 1.5,
            transform: "translate(-50%, -72%)",
            background: "linear-gradient(180deg,#3a2a1a,#241812)",
            border: "1px solid rgba(200,170,120,0.25)",
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"].map(
            (c, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 2 + i * 3,
                  top: 2,
                  bottom: 2,
                  width: 3,
                  background: c,
                  opacity: 0.7,
                }}
              />
            )
          )}
        </div>
      );
    case "filing-cabinet":
      return (
        <div
          style={{
            position: "relative",
            width: baseW * 0.45,
            height: baseH * 1.25,
            transform: "translate(-50%, -75%)",
            background: "linear-gradient(180deg,#5b6b86,#33415c)",
            border: "1px solid #7b8ba8",
            borderRadius: 3,
            boxShadow: "0 4px 6px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 2,
                right: 2,
                top: 3 + i * (baseH * 0.4),
                height: 2,
                background: "#2a3550",
              }}
            />
          ))}
        </div>
      );
    case "coffee-machine":
      return (
        <div
          style={{
            position: "relative",
            width: baseW * 0.45,
            height: baseH * 0.9,
            transform: "translate(-50%, -72%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg,#1e293b,#0f172a)",
              border: "1px solid #475569",
              borderRadius: 3,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "30%",
              transform: "translateX(-50%)",
              width: "50%",
              height: "30%",
              background: "#334155",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "12%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 4px #ef4444",
            }}
          />
        </div>
      );
    case "wall-sign":
      return (
        <div
          style={{
            width: baseW * 0.9,
            height: baseH * 0.6,
            transform: "translate(-50%, -90%)",
            background: "linear-gradient(180deg,#1e3a8a,#172554)",
            border: "1px solid #3b82f6",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.max(6, baseW * 0.11),
            fontWeight: 800,
            color: "#bfdbfe",
            letterSpacing: "0.06em",
            boxShadow: "0 0 8px rgba(59,130,246,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          AGENT OFFICE
        </div>
      );
    case "small-divider":
      return (
        <div
          style={{
            width: baseW * 0.9,
            height: baseH * 0.5,
            transform: "translate(-50%, -60%)",
            background: "linear-gradient(180deg, rgba(150,200,255,0.3), rgba(120,170,230,0.15))",
            border: "1px solid rgba(200,230,255,0.4)",
            borderRadius: 3,
            opacity: 0.6,
          }}
        />
      );
    case "test-bench":
      return (
        <div style={{ position: "relative", width: baseW, height: baseH }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "translate(-50%,-50%)",
              left: "50%",
              top: "50%",
              width: baseW,
              height: baseH,
              background: "linear-gradient(180deg,#2a3a2a,#1a2418)",
              border: "1px solid #4a6a3a",
              borderRadius: 4,
              boxShadow: "0 4px 6px rgba(0,0,0,0.45)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "30%",
              top: "20%",
              width: baseW * 0.35,
              height: baseH * 0.7,
              transform: "translate(-50%,-50%)",
              background: "#0a1f3a",
              border: "1px solid #22d3ee",
              borderRadius: 2,
              boxShadow: "0 0 5px rgba(34,211,238,0.5)",
            }}
          />
        </div>
      );
    case "lamp":
    case "floor-lamp":
      return (
        <div
          style={{
            position: "relative",
            width: baseW * 0.3,
            height: baseH * 1.3,
            transform: "translate(-50%, -75%)",
          }}
        >
          {/* glow */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.7,
              height: baseW * 0.7,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(250,220,150,0.55) 0%, transparent 70%)",
            }}
          />
          {/* shade */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.3,
              height: baseW * 0.22,
              background: "linear-gradient(180deg,#fcd34d,#f59e0b)",
              borderRadius: "50% 50% 20% 20%",
            }}
          />
          {/* pole */}
          <div
            style={{
              position: "absolute",
              top: baseW * 0.22,
              left: "50%",
              transform: "translateX(-50%)",
              width: 2,
              bottom: baseH * 0.2,
              background: "#475569",
            }}
          />
          {/* base */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.35,
              height: 4,
              background: "#334155",
              borderRadius: 3,
            }}
          />
        </div>
      );
    case "rug":
      // A flat colored diamond-ish patch under furniture. Rendered very wide.
      return (
        <div
          style={{
            width: baseW * 1.6,
            height: baseH * 1.6,
            transform: "translate(-50%, -50%)",
            background:
              "repeating-linear-gradient(45deg, rgba(120,90,60,0.18) 0 6px, rgba(90,60,40,0.18) 6px 12px)",
            borderRadius: 8,
            opacity: 0.5,
          }}
        />
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
