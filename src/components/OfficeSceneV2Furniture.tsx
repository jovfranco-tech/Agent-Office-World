/**
 * OfficeSceneV2Furniture — renders V2 furniture using CUSTOM SVG components.
 *
 * Replaced flat Kenney PNGs with IsoSVG.tsx — dimensional isometric furniture
 * with top/left/right faces, consistent lighting, and cohesive palette.
 * This is the upgrade that breaks the "flat sprites" ceiling toward 9+.
 */
import { memo } from "react";
import { V2_FURNITURE, type V2Furniture } from "../data/officeSceneV2Layout";
import {
  SvgDesk, SvgDualDesk, SvgChair, SvgMeetingTable, SvgReceptionDesk,
  SvgCommandWall, SvgSofa, SvgCoffeeTable, SvgCoffeeMachine,
  SvgBookshelf, SvgWhiteboard, SvgServerRack, SvgFilingCabinet,
  SvgPlant, SvgFloorLamp, SvgGlassPartition, SvgRug, SvgWallSign,
} from "./iso/IsoSVG";
import { gridCenterToScreen, DEFAULT_TILE, type TileSize } from "../lib/isometric";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
}

/** Render a furniture piece as SVG. */
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

  // Rug: centered on span, behind everything
  if (f.type === "rug") {
    const spanPos = gridCenterToScreen(f.x + spanW / 2, f.y + spanH / 2, tile);
    return (
      <div style={{ position: "absolute", left: spanPos.x - originX, top: spanPos.y - originY, transform: "translate(-50%, -50%)", zIndex: depth, pointerEvents: "none" }}>
        <SvgRug size={tile.w * 1.5} spanW={spanW} spanH={spanH} />
      </div>
    );
  }

  // Map furniture type → SVG component with scale
  const SCALE = 1.5;
  let svg: React.ReactNode = null;
  const s = tile.w * SCALE;

  switch (f.type) {
    case "desk":
      svg = <SvgDesk size={s} />;
      break;
    case "dual-monitor-desk":
      svg = <SvgDualDesk size={s} />;
      break;
    case "chair":
      svg = <SvgChair size={s * 0.7} />;
      break;
    case "meeting-table":
      svg = <SvgMeetingTable size={s * (1 + (spanW - 1) * 0.4)} />;
      break;
    case "reception-desk":
      svg = <SvgReceptionDesk size={s * 1.3} />;
      break;
    case "command-wall":
      svg = <SvgCommandWall size={s * (1.5 + (spanW - 1) * 0.3)} />;
      break;
    case "sofa":
      svg = <SvgSofa size={s * 1.1} />;
      break;
    case "coffee-table":
      svg = <SvgCoffeeTable size={s * 0.8} />;
      break;
    case "coffee-machine":
      svg = <SvgCoffeeMachine size={s * 0.6} />;
      break;
    case "bookshelf":
      svg = <SvgBookshelf size={s * 0.75} />;
      break;
    case "whiteboard":
      svg = <SvgWhiteboard size={s} />;
      break;
    case "server-rack":
      svg = <SvgServerRack size={s * 0.7} />;
      break;
    case "filing-cabinet":
      svg = <SvgFilingCabinet size={s * 0.65} />;
      break;
    case "plant":
      svg = <SvgPlant size={s * 0.7} />;
      break;
    case "floor-lamp":
      svg = <SvgFloorLamp size={s * 0.55} />;
      break;
    case "glass-partition":
      svg = <SvgGlassPartition size={s} spanW={spanW} />;
      break;
    case "divider":
      svg = <SvgGlassPartition size={s * 0.6} spanW={spanW} />;
      break;
    case "wall-sign":
      svg = <SvgWallSign size={s * 1.2} label={f.label ?? "AGENT OFFICE"} />;
      break;
    default:
      svg = null;
  }

  if (!svg) return null;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: "translate(-50%, -75%)",
        zIndex: depth,
        pointerEvents: "none",
      }}
    >
      {svg}
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
