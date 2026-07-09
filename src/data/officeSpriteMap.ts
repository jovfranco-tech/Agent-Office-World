/**
 * officeSpriteMap.ts — maps V2 furniture types to real Kenney CC0 sprite PNGs.
 *
 * Kenney Furniture Kit (CC0, no attribution required):
 * https://opengameart.org/content/furniture-kit
 *
 * Sprites live in public/sprites/office/. Each is a transparent PNG
 * bottom-anchored, sized to its own bounding box (e.g. desk is 85×88px).
 * Direction variants: _NE (facing right-down) and _SE (facing left-down).
 */
import type { V2FurnitureType } from "./officeSceneV2Layout";

const BASE = "/sprites/office";

/**
 * Map a furniture type to its sprite filename. Returns the base name without
 * direction suffix; the renderer appends _NE or _SE based on facing.
 */
export function spriteForType(type: V2FurnitureType): string | null {
  switch (type) {
    case "desk":
      return "desk";
    case "dual-monitor-desk":
      return "desk";
    case "chair":
      return "chairDesk";
    case "meeting-table":
      return "table";
    case "reception-desk":
      return "deskCorner"; // wider desk for reception
    case "sofa":
      return "loungeSofa";
    case "coffee-table":
      return "tableCoffee";
    case "coffee-machine":
      return "kitchenCoffeeMachine";
    case "bookshelf":
      return "bookcaseClosed";
    case "filing-cabinet":
      return "sideTable"; // closest to a cabinet
    case "whiteboard":
      return null; // no direct sprite; rendered as CSS
    case "server-rack":
      return null; // rendered as CSS with LEDs
    case "command-wall":
    case "presentation-screen":
      return "televisionModern";
    case "plant":
      return "pottedPlant";
    case "floor-lamp":
      return "lampRoundFloor";
    case "rug":
      return "rugRectangle";
    case "glass-partition":
    case "divider":
      return null; // rendered as CSS (translucent)
    case "wall-sign":
      return null; // CSS sign
    default:
      return null;
  }
}

/** Returns true if this type has a real sprite PNG. */
export function hasSprite(type: V2FurnitureType): boolean {
  return spriteForType(type) !== null;
}

/**
 * Get the full URL for a sprite, choosing direction by facing.
 * @param type furniture type
 * @param direction "left" (SE) or "right" (NE)
 */
export function spriteUrl(
  type: V2FurnitureType,
  direction: "left" | "right" = "right"
): string | null {
  const base = spriteForType(type);
  if (!base) return null;
  const suffix = direction === "left" ? "_SE" : "_NE";
  return `${BASE}/${base}${suffix}.png`;
}

/** Extra overlay sprites for composite furniture (e.g. monitor on a desk). */
export function deskExtras(type: V2FurnitureType): string[] {
  if (type === "dual-monitor-desk") {
    return [`${BASE}/computerScreen_NE.png`, `${BASE}/computerScreen_SE.png`];
  }
  if (type === "desk") {
    return [`${BASE}/computerScreen_NE.png`];
  }
  return [];
}
