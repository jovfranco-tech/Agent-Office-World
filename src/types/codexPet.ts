/**
 * Codex Pets / Petdex sprite types.
 *
 * Source of truth for the sprite format:
 *   https://github.com/crafter-station/petdex
 *   https://assets.petdex.dev/manifests/petdex-v1.json
 *
 * The spritesheet is a FIXED global atlas (8 columns × 9 rows, 192×208 px frames),
 * so the grid/frame/animation contract is baked in here rather than expected
 * per-pet. A pet's own `pet.json` MAY override these values.
 */

/** The canonical animation rows of a Codex Pets spritesheet. */
export type CodexPetAnimation =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

/**
 * Friendly alias names used elsewhere in the app (and by Codex agent hooks).
 * These map onto the canonical animation rows.
 */
export type CodexPetAnimationAlias =
  | "idle"
  | "wave"
  | "run"
  | "failed"
  | "review"
  | "jump"
  | "thinking"
  | "working"
  | "blocked";

/** Atlas descriptor — describes how to slice a spritesheet into frames. */
export interface CodexPetAtlas {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  /** Map of animation id -> { row, frames, loop duration in ms } */
  animations: Record<
    CodexPetAnimation,
    { row: number; frames: number; loopMs: number }
  >;
}

/** The minimal pet.json shipped per pet on the Petdex CDN. */
export interface CodexPetJson {
  id: string;
  displayName: string;
  description?: string;
  /** Relative path to the spritesheet inside the pet folder. Default "spritesheet.webp". */
  spritesheetPath?: string;
  /** Optional atlas override. If absent, the global default atlas is used. */
  columns?: number;
  rows?: number;
  cellWidth?: number;
  cellHeight?: number;
}

/** A resolved sprite descriptor used by the renderer. */
export interface ResolvedPetSprite {
  slug: string;
  displayName: string;
  /** Absolute-from-root URL to the spritesheet (e.g. /sprites/codex-pets/boba/spritesheet.webp). */
  spritesheetUrl: string;
  /** Whether the local spritesheet file is known to exist. */
  available: boolean;
  atlas: CodexPetAtlas;
}
