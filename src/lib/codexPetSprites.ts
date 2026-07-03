/**
 * Codex Pets sprite atlas + helpers.
 *
 * The Petdex spritesheet is a FIXED global atlas:
 *   - 8 columns × 9 rows
 *   - each frame is 192 × 208 px
 *   - full sheet is 1536 × 1872 px
 *   - each animation occupies exactly one row
 *
 * Verified against the live CDN assets (boba, tabby, heimerdinger, glitchcat
 * are all 1536×1872). A pet's own `pet.json` may override the grid via the
 * fields columns / rows / cellWidth / cellHeight.
 */
import type {
  CodexPetAnimation,
  CodexPetAnimationAlias,
  CodexPetAtlas,
  CodexPetJson,
} from "../types/codexPet";

/** The canonical default atlas shared by all Codex Pets. */
export const DEFAULT_ATLAS: CodexPetAtlas = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208,
  animations: {
    idle: { row: 0, frames: 6, loopMs: 1100 },
    "running-right": { row: 1, frames: 8, loopMs: 1060 },
    "running-left": { row: 2, frames: 8, loopMs: 1060 },
    waving: { row: 3, frames: 4, loopMs: 700 },
    jumping: { row: 4, frames: 5, loopMs: 840 },
    failed: { row: 5, frames: 8, loopMs: 1220 },
    waiting: { row: 6, frames: 6, loopMs: 1010 },
    running: { row: 7, frames: 6, loopMs: 820 },
    review: { row: 8, frames: 6, loopMs: 1030 },
  },
};

/**
 * Map friendly animation aliases (used by agent states) to canonical rows.
 * Per spec: if a state's animation is missing, fall back to `idle`.
 */
const ALIAS_TO_ANIMATION: Record<CodexPetAnimationAlias, CodexPetAnimation> = {
  idle: "idle",
  wave: "waving",
  run: "running",
  failed: "failed",
  review: "review",
  jump: "jumping",
  thinking: "review",
  working: "idle",
  blocked: "failed",
};

export function aliasToAnimation(
  alias: CodexPetAnimationAlias
): CodexPetAnimation {
  return ALIAS_TO_ANIMATION[alias] ?? "idle";
}

/** Resolve an atlas from a pet.json, falling back to the global default. */
export function resolveAtlas(petJson: CodexPetJson | undefined): CodexPetAtlas {
  if (!petJson) return DEFAULT_ATLAS;
  const a = DEFAULT_ATLAS;
  if (
    petJson.columns &&
    petJson.rows &&
    petJson.cellWidth &&
    petJson.cellHeight &&
    (petJson.columns !== a.columns ||
      petJson.rows !== a.rows ||
      petJson.cellWidth !== a.cellWidth ||
      petJson.cellHeight !== a.cellHeight)
  ) {
    return {
      ...a,
      columns: petJson.columns,
      rows: petJson.rows,
      cellWidth: petJson.cellWidth,
      cellHeight: petJson.cellHeight,
    };
  }
  return a;
}

export interface FrameInfo {
  /** Column (0-based) of the frame in the spritesheet. */
  col: number;
  /** Row (0-based) of the frame in the spritesheet. */
  row: number;
  /** Total frames in this animation loop. */
  frames: number;
  /** Loop duration in ms. */
  loopMs: number;
}

/**
 * Compute the frame info for a given animation at a given progress.
 * @param progress 0..1 within the loop.
 */
export function getFrame(
  atlas: CodexPetAtlas,
  animation: CodexPetAnimation,
  progress: number
): FrameInfo {
  const def = atlas.animations[animation] ?? atlas.animations.idle;
  const frameIndex = Math.floor(progress * def.frames) % def.frames;
  return {
    col: frameIndex % atlas.columns,
    row: def.row,
    frames: def.frames,
    loopMs: def.loopMs,
  };
}

/**
 * Convert a frame into a CSS `background-position` (in px) for a spritesheet
 * rendered at the given display size.
 *
 * We compute the offset in source pixels and then scale by (size/cellHeight),
 * keeping the background-size equal to (columns*size × rows*size) so the whole
 * sheet scales uniformly.
 */
export function backgroundPositionFor(
  atlas: CodexPetAtlas,
  frame: FrameInfo,
  displayWidth: number,
  displayHeight: number
): { backgroundPosition: string; backgroundSize: string } {
  const scaleX = displayWidth / atlas.cellWidth;
  const scaleY = displayHeight / atlas.cellHeight;
  const offsetX = -frame.col * atlas.cellWidth * scaleX;
  const offsetY = -frame.row * atlas.cellHeight * scaleY;
  return {
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    backgroundSize: `${atlas.columns * atlas.cellWidth * scaleX}px ${
      atlas.rows * atlas.cellHeight * scaleY
    }px`,
  };
}

/**
 * The list of slugs that were actually fetched locally. This is generated at
 * build time by scripts/fetch-codex-pets.mjs into public/sprites/codex-pets/
 * index.json. We import it statically so the renderer knows what's available
 * without a runtime filesystem check.
 *
 * If the file is missing (e.g. pets not fetched yet), `KNOWN_SLUGS` is empty
 * and every pet renders as "missing sprite" — which is the honest fallback.
 */
import indexJson from "../../public/sprites/codex-pets/index.json";

interface IndexFile {
  pets: { slug: string }[];
}

export const KNOWN_SLUGS: Set<string> = new Set(
  (indexJson as IndexFile).pets.map((p) => p.slug)
);

/** Base path where pets live (served as static assets by Vite). */
export const SPRITES_BASE = "/sprites/codex-pets";

/** Returns true if a pet slug was fetched locally and should render. */
export function isPetAvailable(slug: string): boolean {
  return KNOWN_SLUGS.has(slug);
}

export function spritesheetUrlFor(slug: string): string {
  return `${SPRITES_BASE}/${slug}/spritesheet.webp`;
}
