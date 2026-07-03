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

/** Render a wall segment as a tall extruded isometric slab along its grid line. */
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
  // The wall runs from grid (x1,y1) to (x2,y2). Compute both endpoints in
  // screen space and draw a thick, tall slab between them so it reads as a
  // real wall (not a flat line).
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
  const isGlass = seg.kind === "glass";
  // Make walls substantial: thick footprint + real height.
  const thickness = isGlass ? 7 : 12;
  const wallHeight = isGlass ? 26 : 52; // px of "wall" rising above the floor
  // Walls render above the floor/zone tint but below agents.
  const depthKey = Math.min(seg.x1, seg.x2) + Math.min(seg.y1, seg.y2);

  return (
    <div
      style={{
        position: "absolute",
        left: ax,
        top: ay,
        width: len,
        height: thickness,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
        zIndex: 200 + depthKey, // above floor (z<200), below agents (z>=1000)
        pointerEvents: "none",
      }}
    >
      {/* Upright wall face — rises UPWARD from the floor line. The slab's own
          box is the wall's footprint on the floor; this child sits on top of
          it and grows upward (bottom anchored at the footprint, height above). */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: "100%",
          width: "100%",
          height: wallHeight,
          background: isGlass
            ? "linear-gradient(180deg, rgba(170,215,255,0.55) 0%, rgba(120,170,230,0.3) 100%)"
            : "linear-gradient(180deg, #3a4d78 0%, #1e2740 100%)",
          borderTop: isGlass
            ? "2px solid rgba(200,230,255,0.9)"
            : "2px solid #52678f",
          borderLeft: isGlass
            ? "1px solid rgba(200,230,255,0.45)"
            : "1px solid #2c3858",
          borderRight: isGlass
            ? "1px solid rgba(200,230,255,0.2)"
            : "1px solid #141b30",
          boxShadow: isGlass
            ? "0 0 12px rgba(150,200,255,0.35), inset 0 0 14px rgba(180,220,255,0.18)"
            : "0 8px 16px rgba(0,0,0,0.65)",
          opacity: isGlass ? 0.8 : 1,
        }}
      />
      {/* Glass mullion lines for partitions */}
      {isGlass && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: "100%",
            width: "100%",
            height: wallHeight,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 36px, rgba(200,230,255,0.5) 36px 38px)",
            opacity: 0.55,
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
    case "desk":
    case "reception-desk":
      return (
        <div
          style={{
            width: baseW,
            height: baseH,
            transform: "translate(-50%, -50%)",
            background:
              type === "reception-desk"
                ? "linear-gradient(180deg,#44557a,#2a3753)"
                : "linear-gradient(180deg,#33415e,#1e2942)",
            borderRadius: 4,
            border: "1px solid rgba(150,180,230,0.28)",
            boxShadow: "0 5px 9px rgba(0,0,0,0.45)",
          }}
        />
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
    case "meeting-table":
      return (
        <div
          style={{
            width: baseW * 1.15,
            height: baseH * 1.15,
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(180deg,#4a3624,#2a1d12)",
            border: "1px solid rgba(210,180,130,0.35)",
            borderRadius: 10,
            boxShadow: "0 6px 12px rgba(0,0,0,0.5)",
          }}
        />
      );
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
    case "lamp":
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
              "repeating-linear-gradient(45deg, rgba(120,90,60,0.25) 0 6px, rgba(90,60,40,0.25) 6px 12px)",
            borderRadius: 8,
            opacity: 0.6,
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
