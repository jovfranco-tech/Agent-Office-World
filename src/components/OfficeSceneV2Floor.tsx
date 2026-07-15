/**
 * OfficeSceneV2Floor — LIGHT premium floor.
 *
 * The #1 change for 9/10: a LIGHT floor (warm off-white polished concrete),
 * not dark. Every premium isometric office reference uses light floors —
 * dark floors read as "game board", light floors read as "real office".
 *
 * Layers: warm off-white base → noise texture → subtle tile grid →
 * specular → per-zone warm tint → soft edges.
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
      {/* Base floor — warm off-white polished concrete (LIGHT, not dark) */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "radial-gradient(ellipse at 55% 35%, #e8e2d6 0%, #ddd6c8 30%, #cec6b6 65%, #b8b0a0 100%)",
          boxShadow: "inset 0 0 60px rgba(80,70,50,0.15)",
        }}
      >
        {/* Concrete grain noise */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' /%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            opacity: 0.06,
            mixBlendMode: "multiply",
          }}
        />
        {/* Tile grid — warm subtle lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(140,130,110,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(140,130,110,0.06) 1px, transparent 1px)",
            backgroundSize: `${tile.w}px ${tile.h}px`,
            opacity: 0.9,
          }}
        />
        {/* Specular highlight — polished reflection from ceiling lights */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 45% 30% at 50% 25%, rgba(255,250,240,0.35) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Zone tints — visible color differentiation on light floor */}
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
              background: `linear-gradient(135deg, ${z.accent}1a 0%, ${z.accent}0a 100%)`,
              opacity: 0.85,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Perimeter — soft warm edge (like baseboard / wall trim) */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          boxShadow:
            "inset 0 0 0 2px rgba(160,145,120,0.25), inset 0 0 25px rgba(120,100,70,0.1)",
          pointerEvents: "none",
        }}
      />

      {/* Edge vignette — gentle darkening at borders for depth */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(80,70,50,0.12) 85%, rgba(60,50,35,0.25) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export const OfficeSceneV2Floor = memo(OfficeSceneV2FloorImpl);
export default OfficeSceneV2Floor;

/** Compute V2 scene bounds. */
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
