/**
 * OfficeFloor — renders the continuous isometric floor:
 * the base plane, each zone as a tinted diamond, and zone labels.
 *
 * Everything is positioned absolutely within the scene coordinate space.
 * The scene's transform (scale + translate to center) is applied by OfficeWorld.
 */
import { memo } from "react";
import type { OfficeZone } from "../types";
import { OFFICE_ZONES } from "../data/officeZones";
import {
  DEFAULT_TILE,
  gridCenterToScreen,
  gridRectBounds,
  rectToCssBox,
  type TileSize,
} from "../lib/isometric";
import { OFFICE_GRID } from "../data/officeZones";

interface Props {
  tile?: TileSize;
  originX: number;
  originY: number;
  selectedZoneId: string | null;
  onSelectZone: (zone: OfficeZone) => void;
  highlightedZoneIds?: Set<string>;
}

function FloorBase({
  tile,
  originX,
  originY,
}: {
  tile: TileSize;
  originX: number;
  originY: number;
}) {
  const box = rectToCssBox(
    { x: 0, y: 0, w: OFFICE_GRID.w, h: OFFICE_GRID.h },
    tile,
    originX,
    originY
  );
  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        clipPath: box.clipPath,
        background:
          "linear-gradient(135deg, #0a1020 0%, #0d1426 50%, #0a0f1e 100%)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)",
      }}
    >
      {/* Subtle floor grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: `${tile.w / 2}px ${tile.h / 2}px`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function OfficeEdge({
  tile,
  originX,
  originY,
}: {
  tile: TileSize;
  originX: number;
  originY: number;
}) {
  // A thin highlighted outline along the perimeter of the whole office.
  const box = rectToCssBox(
    { x: 0, y: 0, w: OFFICE_GRID.w, h: OFFICE_GRID.h },
    tile,
    originX,
    originY
  );
  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        clipPath: box.clipPath,
        background: "transparent",
        boxShadow: "inset 0 0 0 2px rgba(96,165,250,0.25)",
        pointerEvents: "none",
      }}
    />
  );
}

function OfficeFloorImpl({
  tile = DEFAULT_TILE,
  originX,
  originY,
  selectedZoneId,
  onSelectZone,
  highlightedZoneIds,
}: Props) {
  return (
    <>
      <FloorBase tile={tile} originX={originX} originY={originY} />
      {OFFICE_ZONES.map((zone) => {
        const box = rectToCssBox(zone.rect, tile, originX, originY);
        const isSelected = selectedZoneId === zone.id;
        const isHighlighted =
          highlightedZoneIds?.has(zone.id) && !isSelected;
        return (
          <div
            key={zone.id}
            className="zone-floor"
            onClick={(e) => {
              e.stopPropagation();
              onSelectZone(zone);
            }}
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              clipPath: box.clipPath,
              background: zone.color,
              cursor: "pointer",
              transition: "background 160ms ease",
              outline: "none",
              boxShadow: isSelected
                ? "inset 0 0 0 2px rgba(96,165,250,0.9), inset 0 0 30px rgba(96,165,250,0.25)"
                : isHighlighted
                ? "inset 0 0 0 1px rgba(96,165,250,0.5)"
                : "inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
            title={zone.name}
          >
            {/* zone kind overlay for visual flavor */}
            {zone.kind === "glass" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(135deg, rgba(150,200,255,0.06) 0 6px, transparent 6px 14px)",
                  pointerEvents: "none",
                }}
              />
            )}
            {zone.kind === "carpet" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 4px, transparent 4px 8px)",
                  pointerEvents: "none",
                }}
              />
            )}
            {zone.kind === "lounge" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,220,180,0.04)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        );
      })}
      <OfficeEdge tile={tile} originX={originX} originY={originY} />
      {/* Zone labels — rendered above zones but below furniture/agents */}
      {OFFICE_ZONES.map((zone) => {
        const c = gridCenterToScreen(
          zone.rect.x + zone.rect.w / 2,
          zone.rect.y + zone.rect.h / 2,
          tile
        );
        return (
          <div
            key={`lbl-${zone.id}`}
            className="zone-label"
            style={{
              left: c.x - originX,
              top: c.y - originY,
              zIndex: 5,
              opacity: selectedZoneId && selectedZoneId !== zone.id ? 0.4 : 0.7,
            }}
          >
            {zone.name}
          </div>
        );
      })}
    </>
  );
}

/** Compute the scene's bounding box + origin offset for the whole office. */
export function computeSceneBounds(tile: TileSize = DEFAULT_TILE) {
  const bounds = gridRectBounds(
    { x: 0, y: 0, w: OFFICE_GRID.w, h: OFFICE_GRID.h },
    tile
  );
  // Pad a bit so sprites/labels at the edges aren't clipped.
  const pad = 80;
  return {
    originX: bounds.minX - pad,
    originY: bounds.minY - pad,
    width: bounds.width + pad * 2,
    height: bounds.height + pad * 2,
  };
}

export const OfficeFloor = memo(OfficeFloorImpl);
export default OfficeFloor;
