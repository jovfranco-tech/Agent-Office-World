/**
 * Isometric projection helpers.
 *
 * Classic 2:1 isometric (diamond tiles). Grid coordinates are laid out on a
 * flat plane; we convert to screen-space pixel coordinates for absolute
 * positioning of floor tiles, zones, furniture, and agents.
 *
 *   screen.x = (gridX - gridY) * (tileW / 2)
 *   screen.y = (gridX + gridY) * (tileH / 2)
 *
 * Depth ordering uses (gridX + gridY): things further "back" (smaller sum)
 * render behind things further "front" (larger sum).
 */
import type { GridRect } from "../types";

export interface TileSize {
  /** Width of a grid cell in px. */
  w: number;
  /** Height of a grid cell in px. */
  h: number;
}

export const DEFAULT_TILE: TileSize = { w: 64, h: 32 };

/** Convert a grid coordinate to a screen-space pixel position (top-left origin). */
export function gridToScreen(
  gridX: number,
  gridY: number,
  tile: TileSize = DEFAULT_TILE
): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (tile.w / 2),
    y: (gridX + gridY) * (tile.h / 2),
  };
}

/** The center of a grid cell, in screen space. */
export function gridCenterToScreen(
  gridX: number,
  gridY: number,
  tile: TileSize = DEFAULT_TILE
): { x: number; y: number } {
  const c = gridToScreen(gridX, gridY);
  return { x: c.x, y: c.y + tile.h / 2 };
}

/**
 * The screen-space polygon (diamond) for a grid rectangle, returned as the
 * top vertex and the four corner offsets. Used to render zone floors.
 */
export function rectToDiamond(rect: GridRect, tile: TileSize = DEFAULT_TILE) {
  const { x: x0, y: y0, w, h } = rect;
  // corners in grid space
  const tl = gridToScreen(x0, y0, tile); // top (back)
  const tr = gridToScreen(x0 + w, y0, tile); // right
  const br = gridToScreen(x0 + w, y0 + h, tile); // bottom (front)
  const bl = gridToScreen(x0, y0 + h, tile); // left
  return { tl, tr, br, bl };
}

/**
 * Pixel bounding box (in scene space) of a grid rectangle, used to size the
 * scene container.
 */
export function gridRectBounds(rect: GridRect, tile: TileSize = DEFAULT_TILE) {
  const corners = rectToDiamond(rect, tile);
  const xs = [corners.tl.x, corners.tr.x, corners.br.x, corners.bl.x];
  const ys = [corners.tl.y, corners.tr.y, corners.br.y, corners.bl.y];
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * CSS-ready box for a grid rectangle's diamond. Returns the absolute
 * left/top/width/height of the bounding box (so an element with these values
 * + the clipPath covers exactly the diamond), AND a ready clip-path string.
 *
 * Origin (0,0) of the scene is the top vertex of grid cell (0,0). All coords
 * are non-negative after shifting by the grid offset.
 */
export interface CssBox {
  left: number;
  top: number;
  width: number;
  height: number;
  clipPath: string;
  /** depth sort key for the rectangle's front-most corner */
  depth: number;
}

export function rectToCssBox(
  rect: GridRect,
  tile: TileSize = DEFAULT_TILE,
  originX = 0,
  originY = 0
): CssBox {
  const corners = rectToDiamond(rect, tile);
  const xs = [corners.tl.x, corners.tr.x, corners.br.x, corners.bl.x];
  const ys = [corners.tl.y, corners.tr.y, corners.br.y, corners.bl.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  const left = minX - originX;
  const top = minY - originY;

  // clip-path as percentages within this element's own box
  const pct = (sx: number, sy: number) => {
    const px = ((sx - minX) / width) * 100;
    const py = ((sy - minY) / height) * 100;
    return `${px.toFixed(2)}% ${py.toFixed(2)}%`;
  };
  const clipPath = `polygon(${pct(corners.tl.x, corners.tl.y)}, ${pct(
    corners.tr.x,
    corners.tr.y
  )}, ${pct(corners.br.x, corners.br.y)}, ${pct(corners.bl.x, corners.bl.y)})`;

  return {
    left,
    top,
    width,
    height,
    clipPath,
    depth: rect.x + rect.y + rect.w + rect.h,
  };
}

/** Depth key for painter's-algorithm sorting (smaller = rendered first/behind). */
export function depthKey(gridX: number, gridY: number): number {
  return gridX + gridY;
}

/**
 * Build a CSS clip-path polygon (in %) for a diamond given the four screen
 * corners relative to the element's own bounding box.
 */
export function diamondClipPath(
  corners: ReturnType<typeof rectToDiamond>,
  originX: number,
  originY: number,
  width: number,
  height: number
): string {
  const pct = (sx: number, sy: number) => {
    const px = ((sx - originX) / width) * 100;
    const py = ((sy - originY) / height) * 100;
    return `${px.toFixed(2)}% ${py.toFixed(2)}%`;
  };
  return `polygon(${pct(corners.tl.x, corners.tl.y)}, ${pct(
    corners.tr.x,
    corners.tr.y
  )}, ${pct(corners.br.x, corners.br.y)}, ${pct(corners.bl.x, corners.bl.y)})`;
}
