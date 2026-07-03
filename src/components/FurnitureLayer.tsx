/**
 * FurnitureLayer — renders office furniture as simple isometric CSS shapes.
 *
 * Each piece is drawn at the screen position of its grid cell and depth-sorted
 * via z-index = (x + y). The shapes are intentionally minimal but
 * recognizable: desks are flat slabs, monitors are upright screens, plants are
 * green blobs in pots, etc. They give the office its lived-in feel without
 * needing image assets.
 */
import { memo } from "react";
import type { Furniture, FurnitureType } from "../types";
import { FURNITURE } from "../data/furniture";
import { DEFAULT_TILE, gridCenterToScreen, type TileSize } from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

/** Render a single furniture piece as CSS. */
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
  // Use the piece's top-left grid cell; large pieces (meeting table) span more.
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

/** The visual for each furniture type. Drawn relative to its anchor point. */
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
                ? "linear-gradient(180deg,#3a4a66,#27344a)"
                : "linear-gradient(180deg,#2a3753,#1c2640)",
            borderRadius: 4,
            border: "1px solid rgba(140,170,220,0.25)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          }}
        />
      );
    case "monitor":
    case "command-screen":
      return (
        <div
          style={{
            width: baseW * 0.55,
            height: baseH * 1.1,
            transform: "translate(-50%, -85%)",
            background:
              type === "command-screen"
                ? "linear-gradient(180deg,#0a1f3a,#061427)"
                : "linear-gradient(180deg,#0d1e36,#081424)",
            border: "2px solid #1f3a5e",
            borderRadius: 3,
            boxShadow:
              type === "command-screen"
                ? "0 0 10px rgba(56,189,248,0.5), 0 4px 6px rgba(0,0,0,0.5)"
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
                "repeating-linear-gradient(180deg, rgba(56,189,248,0.18) 0 2px, transparent 2px 5px)",
            }}
          />
        </div>
      );
    case "chair":
      return (
        <div
          style={{
            width: baseW * 0.4,
            height: baseH * 0.5,
            transform: "translate(-50%, -50%)",
            background: "#1b2a44",
            borderRadius: "50% 50% 30% 30%",
            border: "1px solid rgba(140,170,220,0.2)",
          }}
        />
      );
    case "whiteboard":
      return (
        <div
          style={{
            width: baseW * 0.9,
            height: baseH * 1.3,
            transform: "translate(-50%, -75%)",
            background: "linear-gradient(180deg,#e8eef7,#cdd6e6)",
            border: "2px solid #6b7a99",
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
            opacity: 0.92,
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
            width: baseW * 0.5,
            height: baseH * 1.1,
            transform: "translate(-50%, -80%)",
          }}
        >
          {/* foliage */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.5,
              height: baseW * 0.5,
              borderRadius: "50% 50% 45% 45%",
              background:
                "radial-gradient(circle at 35% 30%, #4ade80 0%, #16a34a 70%, #15803d 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          />
          {/* pot */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: baseW * 0.28,
              height: baseH * 0.45,
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
            width: baseW * 1.1,
            height: baseH * 1.1,
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(180deg,#3a2a1a,#241812)",
            border: "1px solid rgba(200,170,120,0.3)",
            borderRadius: 8,
            boxShadow: "0 5px 10px rgba(0,0,0,0.5)",
          }}
        />
      );
    case "server-rack":
      return (
        <div
          style={{
            width: baseW * 0.45,
            height: baseH * 1.6,
            transform: "translate(-50%, -75%)",
            background: "linear-gradient(180deg,#101826,#070c16)",
            border: "1px solid #1f3a5e",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(34,211,238,0.3), 0 4px 8px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* blinking rack LEDs */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 3,
                top: 4 + i * 7,
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
            width: baseW * 1.0,
            height: baseH * 0.7,
            transform: "translate(-50%, -55%)",
            background: "linear-gradient(180deg,#4a3a6a,#2e2350)",
            border: "1px solid rgba(180,150,220,0.3)",
            borderRadius: "8px 8px 4px 4px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          }}
        />
      );
    case "bookshelf":
      return (
        <div
          style={{
            width: baseW * 0.4,
            height: baseH * 1.4,
            transform: "translate(-50%, -70%)",
            background: "linear-gradient(180deg,#3a2a1a,#241812)",
            border: "1px solid rgba(200,170,120,0.25)",
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"].map(
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
    default:
      return null;
  }
}

function FurnitureLayerImpl({ tile = DEFAULT_TILE, originX, originY }: Props) {
  return (
    <>
      {FURNITURE.map((f) => (
        <FurniturePiece
          key={f.id}
          f={f}
          tile={tile}
          originX={originX}
          originY={originY}
        />
      ))}
    </>
  );
}

export const FurnitureLayer = memo(FurnitureLayerImpl);
export default FurnitureLayer;
