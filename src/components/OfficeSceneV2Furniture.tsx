/**
 * OfficeSceneV2Furniture — Kenney sprites rendered with proper scale + grounding.
 *
 * Key fixes for 9+:
 *   1. PER-TYPE SCALE: each furniture type gets a scale tuned to its sprite
 *      dimensions vs the 64×32 tile footprint. A desk sprite (85×88) needs
 *      ~1.4x to match a 64px tile; a tiny pottedPlant (21×61) needs ~1.6x.
 *      This eliminates the cluttered (2.0x) AND tiny (1.0x) extremes.
 *   2. Bottom-anchored positioning: sprite bottom = grid cell center, so the
 *      sprite "stands" on the floor at the right depth.
 *   3. Contact shadow: soft elliptical gradient puddle under each sprite.
 *   4. Warm unifying filter so all sprites share the same lighting world.
 *   5. Exports FurnitureItem so OfficeSceneV2 can interleave furniture + agents
 *      in ONE depth-sorted painter's pass (the critical depth fix).
 */
import { memo } from "react";
import { V2_FURNITURE, type V2Furniture, type V2FurnitureType } from "../data/officeSceneV2Layout";
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

/**
 * Per-type scale factor. Tuned so each sprite fills its 1-tile footprint
 * convincingly without being giant or tiny. Values derived from sprite
 * dimensions: a desk (85px wide) at scale 1.4 → 119px, matching the ~120px
 * diagonal of an iso tile at 64px width.
 */
const TYPE_SCALE: Partial<Record<V2FurnitureType, number>> = {
  desk: 1.4,
  "dual-monitor-desk": 1.45,
  chair: 1.4,
  "meeting-table": 1.55,      // table is 97×94, needs to span 3×2 grid
  "reception-desk": 1.55,     // deskCorner is 147×101, hero reception piece
  sofa: 1.35,
  "coffee-table": 1.3,
  "coffee-machine": 1.2,
  bookshelf: 1.35,            // 49×99 tall piece
  "filing-cabinet": 1.25,
  plant: 1.55,                // 21×61 small but should read
  "floor-lamp": 1.45,
  "presentation-screen": 1.45,
};

/** Shadow size proportional to sprite scale. */
const TYPE_SHADOW: Partial<Record<V2FurnitureType, number>> = {
  desk: 80,
  "dual-monitor-desk": 85,
  chair: 40,
  "meeting-table": 110,
  "reception-desk": 130,
  sofa: 110,
  "coffee-table": 70,
  "coffee-machine": 35,
  bookshelf: 60,
  "filing-cabinet": 55,
  plant: 28,
  "floor-lamp": 22,
  "presentation-screen": 60,
};

/**
 * Render a single furniture piece. Exported so the scene can depth-sort it
 * together with agents in a unified painter's pass.
 */
export function FurnitureItem({
  f,
  tile,
  originX,
  originY,
  zIndex,
}: {
  f: V2Furniture;
  tile: TileSize;
  originX: number;
  originY: number;
  zIndex: number;
}) {
  const pos = gridCenterToScreen(f.x, f.y, tile);
  const left = pos.x - originX;
  const top = pos.y - originY;
  const spanW = f.w ?? 1;
  const spanH = f.h ?? 1;

  // --- Rugs: SVG, drawn flat on the floor (lowest layer) ---
  if (f.type === "rug") {
    const spanPos = gridCenterToScreen(f.x + spanW / 2 - 0.5, f.y + spanH / 2 - 0.5, tile);
    return (
      <div style={{ position: "absolute", left: spanPos.x - originX, top: spanPos.y - originY, transform: "translate(-50%, -50%)", zIndex, pointerEvents: "none" }}>
        <SvgRug size={tile.w * 1.8} spanW={spanW} spanH={spanH} />
      </div>
    );
  }

  // --- Command wall: SVG hero piece ---
  if (f.type === "command-wall") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -72%)", zIndex, pointerEvents: "none", filter: "drop-shadow(0 6px 12px rgba(34,211,238,0.16))" }}>
        <SvgCommandWall size={tile.w * (1.6 + (spanW - 1) * 0.22)} />
      </div>
    );
  }

  // --- Glass partitions / dividers: SVG ---
  if (f.type === "glass-partition" || f.type === "divider") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -78%)", zIndex, pointerEvents: "none" }}>
        <SvgGlassPartition size={tile.w * 1.5} spanW={spanW} />
      </div>
    );
  }

  // --- Wall sign: SVG ---
  if (f.type === "wall-sign") {
    return (
      <div style={{ position: "absolute", left, top, transform: "translate(-50%, -90%)", zIndex, pointerEvents: "none" }}>
        <SvgWallSign size={tile.w * 1.8} label={f.label ?? "AGENT OFFICE"} />
      </div>
    );
  }

  // --- Kenney sprite furniture ---
  if (hasSprite(f.type)) {
    const url = spriteUrl(f.type, "right");
    const extras = deskExtras(f.type);
    const SCALE = TYPE_SCALE[f.type] ?? 1.25;
    const shadowW = TYPE_SHADOW[f.type] ?? 60;
    const isScreen = f.type === "presentation-screen";
    const spriteFilter = isScreen
      ? "drop-shadow(0 4px 10px rgba(0,0,0,0.35)) brightness(1.15) saturate(1.4)"
      : "drop-shadow(0 3px 5px rgba(50,38,18,0.28)) brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)";

    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          zIndex,
          pointerEvents: "none",
        }}
      >
        {/* Contact shadow: soft elliptical gradient puddle under the sprite */}
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            width: shadowW,
            height: shadowW * 0.32,
            transform: "translateX(-50%)",
            background:
              "radial-gradient(ellipse at center, rgba(50,38,20,0.35) 0%, rgba(50,38,20,0.15) 45%, transparent 75%)",
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />
        {/* The sprite — bottom-anchored at grid cell center */}
        <div
          style={{
            position: "relative",
            transform: `translate(-50%, -100%) scale(${SCALE})`,
            transformOrigin: "bottom center",
            filter: spriteFilter,
          }}
        >
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
                left: i === 0 ? "22%" : "55%",
                top: "-12%",
                width: "32%",
                imageRendering: "auto",
                filter: "brightness(1.35) saturate(1.5) drop-shadow(0 0 4px rgba(59,130,246,0.5))",
              }}
              draggable={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- CSS fallback (whiteboard, server-rack) ---
  return (
    <div style={{ position: "absolute", left, top, zIndex, pointerEvents: "none" }}>
      {renderIsoPiece(f, tile)}
    </div>
  );
}

function OfficeSceneV2FurnitureImpl({ tile = DEFAULT_TILE, originX, originY }: Props) {
  // Rugs first (lowest depth), then everything else back-to-front.
  const rugs = V2_FURNITURE.filter((f) => f.type === "rug");
  const rest = V2_FURNITURE.filter((f) => f.type !== "rug").sort(
    (a, b) => a.x + a.y - (b.x + b.y)
  );
  return (
    <>
      {rugs.map((f, i) => (
        <FurnitureItem key={f.id} f={f} tile={tile} originX={originX} originY={originY} zIndex={i + 1} />
      ))}
      {rest.map((f) => (
        <FurnitureItem
          key={f.id}
          f={f}
          tile={tile}
          originX={originX}
          originY={originY}
          zIndex={Math.round(f.x + f.y)}
        />
      ))}
    </>
  );
}

export const OfficeSceneV2Furniture = memo(OfficeSceneV2FurnitureImpl);
export default OfficeSceneV2Furniture;
