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
      {/* Base floor — polished concrete: warm midtone + deep edges + specular */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "radial-gradient(ellipse at 55% 35%, #2c3142 0%, #252a38 30%, #1c2030 60%, #14181f 100%)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.45)",
        }}
      >
        {/* Polished concrete texture — fine grain noise */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
            opacity: 0.08,
            mixBlendMode: "overlay",
          }}
        />
        {/* Tile grid — warmer lines, like real office flooring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(180,170,150,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(180,170,150,0.035) 1px, transparent 1px)",
            backgroundSize: `${tile.w}px ${tile.h}px`,
            opacity: 0.8,
          }}
        />
        {/* Specular highlight — polished floor reflection */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 50% 35% at 50% 25%, rgba(255,245,220,0.06) 0%, transparent 60%)",
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
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Atmospheric haze — subtle warm fog in the back, cool in front */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "linear-gradient(160deg, rgba(40,35,30,0.12) 0%, transparent 40%, transparent 60%, rgba(15,20,35,0.12) 100%)",
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
