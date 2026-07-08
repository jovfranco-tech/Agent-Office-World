/**
 * OfficeSceneV2Furniture — renders V2 furniture, depth-sorted by x+y.
 * Rugs render first (behind everything), then all other pieces.
 */
import { memo } from "react";
import { V2_FURNITURE } from "../data/officeSceneV2Layout";
import { renderIsoPiece } from "./iso/IsoFurniture";
import { gridCenterToScreen, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

function OfficeSceneV2FurnitureImpl({
  tile = DEFAULT_TILE,
  originX,
  originY,
}: Props) {
  const rugs = V2_FURNITURE.filter((f) => f.type === "rug");
  const rest = V2_FURNITURE.filter((f) => f.type !== "rug").sort(
    (a, b) => a.x + a.y - (b.x + b.y)
  );

  return (
    <>
      {rugs.map((f) => {
        const pos = gridCenterToScreen(f.x + (f.w ?? 1) / 2, f.y + (f.h ?? 1) / 2, tile);
        return (
          <div
            key={f.id}
            style={{ position: "absolute", left: pos.x - originX, top: pos.y - originY, zIndex: f.x + f.y }}
          >
            {renderIsoPiece(f, tile, 1.1)}
          </div>
        );
      })}
      {rest.map((f) => {
        const pos = gridCenterToScreen(f.x, f.y, tile);
        return (
          <div
            key={f.id}
            style={{ position: "absolute", left: pos.x - originX, top: pos.y - originY, zIndex: f.x + f.y }}
          >
            {renderIsoPiece(f, tile)}
          </div>
        );
      })}
    </>
  );
}

export const OfficeSceneV2Furniture = memo(OfficeSceneV2FurnitureImpl);
export default OfficeSceneV2Furniture;
