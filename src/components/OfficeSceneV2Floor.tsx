/**
 * OfficeSceneV2Floor — the base floor for V2.
 *
 * A warm, continuous office floor (not flat black) with a subtle tile texture.
 * Zone tints are applied very faintly (~12% opacity) so zones differentiate
 * slightly by floor material but are READ via furniture, not paint.
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
      {/* Base floor — warm dark, not flat black */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          background:
            "linear-gradient(135deg, #1e2330 0%, #1a1f2b 50%, #161a24 100%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* Subtle floor tile texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: `${tile.w / 2}px ${tile.h / 2}px`,
          }}
        />
      </div>
      {/* Zone tints — very faint */}
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
              background: z.tint,
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
        );
      })}
      {/* Soft perimeter edge */}
      <div
        style={{
          position: "absolute",
          left: baseBox.left,
          top: baseBox.top,
          width: baseBox.width,
          height: baseBox.height,
          clipPath: baseBox.clipPath,
          boxShadow: "inset 0 0 0 2px rgba(96,165,250,0.15)",
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
