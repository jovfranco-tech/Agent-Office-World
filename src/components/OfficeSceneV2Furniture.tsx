/**
 * OfficeSceneV2Furniture — renders V2 furniture using REAL Kenney CC0 sprites.
 *
 * For types that have a sprite PNG (desk, chair, sofa, plant, etc.), renders an
 * <img> positioned at the grid cell. For types without a sprite (walls, glass,
 * whiteboard, server-rack), falls back to the CSS Iso* components.
 *
 * Sprites are bottom-anchored: the bottom-center of the PNG aligns to the grid
 * cell center, so furniture "sits on" the floor tile.
 */
import { memo } from "react";
import { V2_FURNITURE, type V2Furniture } from "../data/officeSceneV2Layout";
import { spriteUrl, deskExtras, hasSprite } from "../data/officeSpriteMap";
import { renderIsoPiece } from "./iso/IsoFurniture";
import { gridCenterToScreen, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

/** Render a single furniture piece — sprite PNG if available, else CSS fallback. */
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

  // Sprites that span multiple cells (rugs, big tables) use center of span.
  const spanW = f.w ?? 1;
  const spanH = f.h ?? 1;
  const spanPos =
    spanW > 1 || spanH > 1
      ? gridCenterToScreen(f.x + spanW / 2, f.y + spanH / 2, tile)
      : pos;
  const spanLeft = spanPos.x - originX;
  const spanTop = spanPos.y - originY;

  // Rug: render first (behind), using sprite if available
  if (f.type === "rug") {
    const rugUrl = spriteUrl("rug");
    return (
      <div
        style={{
          position: "absolute",
          left: spanLeft,
          top: spanTop,
          transform: "translate(-50%, -50%)",
          zIndex: depth,
          pointerEvents: "none",
        }}
      >
        {rugUrl ? (
          <img
            src={rugUrl}
            alt="rug"
            style={{ width: tile.w * spanW * 1.1, opacity: 0.7, imageRendering: "auto" }}
            draggable={false}
          />
        ) : null}
      </div>
    );
  }

  // Real sprite furniture — scaled 1.8x for presence + contact shadow
  if (hasSprite(f.type)) {
    const url = spriteUrl(f.type, "right");
    const extras = deskExtras(f.type);
    const SPRITE_SCALE = 1.9;
    // Atmospheric depth: objects further "back" (lower x+y) are slightly dimmer
    const depthFactor = Math.min(1, (f.x + f.y) / 40);
    const atmoBright = 0.94 + depthFactor * 0.10; // 0.94 (far) to 1.04 (near)
    const isScreen = f.type === "command-wall" || f.type === "presentation-screen";
    // Unified warm lighting: all furniture gets the same sepia/saturation treatment
    // so nothing looks out of place. Screens break the rule intentionally (vivid).
    const depthFilter = isScreen
      ? `drop-shadow(0 6px 12px rgba(0,0,0,0.55)) brightness(${atmoBright + 0.18}) saturate(1.45) hue-rotate(-3deg)`
      : `drop-shadow(0 5px 8px rgba(0,0,0,0.5)) brightness(${atmoBright}) contrast(1.12) saturate(0.85) sepia(0.12) hue-rotate(-2deg)`;
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          transform: `translate(-50%, -100%) scale(${SPRITE_SCALE})`,
          zIndex: depth,
          pointerEvents: "none",
          filter: depthFilter,
        }}
      >
        {/* Ambient occlusion — wide soft shadow for grounding */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            width: "110%",
            height: 16,
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 80%)",
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(3px)",
          }}
        />
        {/* Contact shadow — tight dark ellipse directly under furniture */}
        <div
          style={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            width: "70%",
            height: 8,
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        {/* Rim light — top edge highlight (warm overhead light) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: "linear-gradient(180deg, rgba(255,245,225,0.1) 0%, transparent 100%)",
            borderRadius: "4px 4px 0 0",
            pointerEvents: "none",
            mixBlendMode: "screen",
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
        {/* Monitor overlays for desks */}
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
              filter: "brightness(1.3) saturate(1.4) drop-shadow(0 0 4px rgba(59,130,246,0.4))",
            }}
            draggable={false}
          />
        ))}
      </div>
    );
  }

  // CSS fallback for types without sprites (walls, glass, whiteboard, server-rack)
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
      {renderIsoPiece(f, tile)}
    </div>
  );
}

function OfficeSceneV2FurnitureImpl({
  tile = DEFAULT_TILE,
  originX,
  originY,
}: Props) {
  // Rugs first (behind), then everything else depth-sorted.
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
