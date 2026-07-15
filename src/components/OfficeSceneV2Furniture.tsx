/**
 * OfficeSceneV2Furniture — Kenney sprites + aggressive depth treatment.
 *
 * Strategy: use the recognizable Kenney PNGs (they read as furniture) but
 * wrap each one with: contact shadow SVG + ambient occlusion + warm unifying
 * filter + rim light. The SVG layer underneath provides the 3D grounding that
 * flat PNGs lack, without sacrificing recognizability.
 */
import { memo } from "react";
import { V2_FURNITURE, type V2Furniture } from "../data/officeSceneV2Layout";
import { spriteUrl, deskExtras, hasSprite } from "../data/officeSpriteMap";
import {
  SvgCommandWall, SvgGlassPartition, SvgRug, SvgWallSign,
} from "./iso/IsoSVG";
import { renderIsoPiece } from "./iso/IsoFurniture";
import { gridCenterToScreen, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

/** Projected shadow SVG drawn under the furniture sprite. */
function GroundShadow({ w, h }: { w: number; h: number }) {
  return (
    <svg
      width={w * 1.3}
      height={h * 0.5}
      viewBox={`0 0 ${w * 1.3} ${h * 0.5}`}
      style={{ position: "absolute", bottom: -h * 0.1, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: -1 }}
    >
      <defs>
        <radialGradient id={`shadow-${w}-${h}`}>
          <stop offset="0%" stopColor="rgba(50,38,20,0.35)" />
          <stop offset="50%" stopColor="rgba(50,38,20,0.12)" />
          <stop offset="100%" stopColor="rgba(50,38,20,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={w * 0.65} cy={h * 0.25} rx={w * 0.6} ry={h * 0.22} fill={`url(#shadow-${w}-${h})`} />
    </svg>
  );
}

function FurnitureItem({
  f,
  tile,
  originX,
  originY,
}: {
  f: V2Furniture;
  tile: TileSize;
  originX: number;
  originY: number;
}) {
  const pos = gridCenterToScreen(f.x, f.y, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const depth = f.x + f.y;
  const spanW = f.w ?? 1;
  const spanH = f.h ?? 1;

  // Rugs — SVG, behind everything
  if (f.type === "rug") {
    const spanPos = gridCenterToScreen(f.x + spanW / 2, f.y + spanH / 2, tile);
    return (
      <div style={{ position: "absolute", left: spanPos.x - originX, top: spanPos.y - originY, transform: "translate(-50%, -50%)", zIndex: depth, pointerEvents: "none" }}>
        <SvgRug size={tile.w * 1.8} spanW={spanW} spanH={spanH} />
      </div>
    );
  }

  // Command wall — SVG (complex multi-screen with LEDs)
  if (f.type === "command-wall") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -75%)", zIndex: depth, pointerEvents: "none", filter: "drop-shadow(0 8px 16px rgba(34,211,238,0.15))" }}>
        <SvgCommandWall size={tile.w * (2 + (spanW - 1) * 0.3)} />
      </div>
    );
  }

  // Glass partitions — SVG
  if (f.type === "glass-partition" || f.type === "divider") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -70%)", zIndex: depth, pointerEvents: "none" }}>
        <SvgGlassPartition size={tile.w * 1.2} spanW={spanW} />
      </div>
    );
  }

  // Wall sign — SVG
  if (f.type === "wall-sign") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -85%)", zIndex: depth, pointerEvents: "none" }}>
        <SvgWallSign size={tile.w * 1.8} label={f.label ?? "AGENT OFFICE"} />
      </div>
    );
  }

  // Kenney sprite furniture — recognizable + depth treatment
  if (hasSprite(f.type)) {
    const url = spriteUrl(f.type, "right");
    const extras = deskExtras(f.type);
    const SCALE = 2.0;
    const spriteW = tile.w * SCALE;
    const spriteH = tile.h * SCALE * 1.3;
    const isScreen = f.type === "presentation-screen";

    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          zIndex: depth,
          pointerEvents: "none",
        }}
      >
        {/* Ground shadow SVG (3D grounding) */}
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: spriteW, height: spriteH * 0.3 }}>
          <GroundShadow w={spriteW} h={spriteH} />
        </div>
        {/* The sprite itself — scaled + filtered for depth + cohesion */}
        <div
          style={{
            transform: `translate(-50%, -100%) scale(${SCALE})`,
            transformOrigin: "bottom center",
            filter: isScreen
              ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.2) saturate(1.5)"
              : "drop-shadow(1px 3px 5px rgba(50,38,18,0.3)) brightness(1.06) contrast(1.08) sepia(0.05) saturate(0.95)",
          }}
        >
          {/* Rim light overlay — warm top glow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(180deg, rgba(255,245,225,0.06) 0%, transparent 100%)",
              borderRadius: "3px 3px 0 0",
              pointerEvents: "none",
              mixBlendMode: "screen",
              zIndex: 10,
            }}
          />
          {url && (
            <img
              src={url}
              alt={f.type}
              style={{ imageRendering: "auto", display: "block", position: "relative" }}
              draggable={false}
            />
          )}
          {/* Monitor glow overlays for desks */}
          {extras.map((ex, i) => (
            <img
              key={i}
              src={ex}
              alt="monitor"
              style={{
                position: "absolute",
                left: i === 0 ? "20%" : "55%",
                top: "-15%",
                width: "35%",
                imageRendering: "auto",
                filter: "brightness(1.4) saturate(1.5) drop-shadow(0 0 5px rgba(59,130,246,0.5))",
              }}
              draggable={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // CSS fallback (whiteboard, server-rack)
  return (
    <div style={{ position: "absolute", left, top, zIndex: depth, pointerEvents: "none" }}>
      {renderIsoPiece(f, tile)}
    </div>
  );
}

function OfficeSceneV2FurnitureImpl({ tile = DEFAULT_TILE, originX, originY }: Props) {
  const rugs = V2_FURNITURE.filter((f) => f.type === "rug");
  const rest = V2_FURNITURE.filter((f) => f.type !== "rug").sort(
    (a, b) => a.x + a.y - (b.x + b.y)
  );
  return (
    <>
      {rugs.map((f) => (
        <FurnitureItem key={f.id} f={f} tile={tile} originX={originX} originY={originY} />
      ))}
      {rest.map((f) => (
        <FurnitureItem key={f.id} f={f} tile={tile} originX={originX} originY={originY} />
      ))}
    </>
  );
}

export const OfficeSceneV2Furniture = memo(OfficeSceneV2FurnitureImpl);
export default OfficeSceneV2Furniture;
