/**
 * OfficeSceneV2Floor — premium floor for V3.
 *
 * Rich layered floor: warm base gradient → subtle tile pattern → per-zone
 * warm tint → soft inner glow → luminous perimeter edge. Reads as a real
 * office floor, not a flat dark plane.
 */
import { memo } from "react";
import { V2_ZONES, V2_GRID } from "../data/officeSceneV2Layout";
import { rectToCssBox, gridRectBounds, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  tile: TileSize;
  originX: number;
  originY: number;
}

function OfficeSceneV2FloorImpl({ tile, originX, originY }: Props) {
  const baseBox = rectToCssBox(
    { x: 0, y: 0, w: V2_GRID.w, h: V2_GRID.h },
    tile,
    originX,
    originY
  );
  return (
    <>
      {/* Base floor — warm layered gradient (not flat) */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "radial-gradient(ellipse at 60% 30%, #252b3a 0%, #1d2230 40%, #171b26 70%, #121620 100%)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Tile pattern — subtle warm lines like real office flooring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: `${tile.w}px ${tile.h}px`,
            opacity: 0.7,
          }}
        />
        {/* Warm ambient glow from center-top (like ceiling lights) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,240,210,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Zone tints — warm, subtle, each with a hint of its accent */}
      {V2_ZONES.map((z) => {
        const box = rectToCssBox(z.rect, tile, originX, originY);
        return (
          <div
            key={z.id}
            style={{
              position: "absolute",
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              clipPath: box.clipPath,
              background: `linear-gradient(135deg, ${z.tint} 0%, ${z.accent}08 100%)`,
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Luminous perimeter — soft blue-white rim like premium office glass */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          boxShadow:
            "inset 0 0 0 2px rgba(120,160,220,0.2), inset 0 0 30px rgba(80,120,200,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* Inner soft glow — adds depth/atmosphere */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export const OfficeSceneV2Floor = memo(OfficeSceneV2FloorImpl);
export default OfficeSceneV2Floor;

/** Compute V2 scene bounds (parallel to the old computeSceneBounds). */
export function computeV2SceneBounds(tile: TileSize = DEFAULT_TILE) {
  const bounds = gridRectBounds(
    { x: 0, y: 0, w: V2_GRID.w, h: V2_GRID.h },
    tile
  );
  const pad = 30;
  return {
    originX: bounds.minX - pad,
    originY: bounds.minY - pad,
    width: bounds.width + pad * 2,
    height: bounds.height + pad * 2,
  };
}
