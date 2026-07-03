/**
 * CodexPetSprite
 *
 * Renders a single Codex Pet from a local spritesheet using CSS
 * `background-position` to step through frames. Animation is driven by
 * requestAnimationFrame against the atlas loop duration.
 *
 * If the pet slug is not available locally, it renders an explicit, minimal
 * "missing sprite" marker — never a pretty fake placeholder.
 */
import { useEffect, useRef, useState } from "react";
import type {
  CodexPetAnimationAlias,
  ResolvedPetSprite,
} from "../types/codexPet";
import {
  DEFAULT_ATLAS,
  aliasToAnimation,
  backgroundPositionFor,
  getFrame,
  isPetAvailable,
  resolveAtlas,
  spritesheetUrlFor,
} from "../lib/codexPetSprites";

export interface CodexPetSpriteProps {
  petSlug: string;
  /** Animation alias (idle, wave, run, failed, review, jump, thinking, working, blocked). */
  state: CodexPetAnimationAlias;
  /** Display width in px. Height auto-derived from atlas ratio (192:208). */
  size: number;
  /** Facing direction; flips the sprite horizontally when "left". */
  direction?: "left" | "right";
  /** Highlight this sprite (e.g. selected agent). */
  isSelected?: boolean;
  /** Optional floating label above the sprite. */
  label?: string;
  /** Role badge text (small chip near the sprite). */
  role?: string;
  /** Whether the agent is currently walking (adds a bob). */
  walking?: boolean;
  /** Accent color for selection ring / label border. */
  accent?: string;
  /** Optional pet.json override loaded by the parent (for non-default atlas). */
  petJson?: ResolvedPetSprite;
}

export default function CodexPetSprite({
  petSlug,
  state,
  size,
  direction = "right",
  isSelected = false,
  label,
  role,
  walking = false,
  accent = "#3b82f6",
}: CodexPetSpriteProps) {
  const available = isPetAvailable(petSlug);
  const atlas = resolveAtlas(undefined) ?? DEFAULT_ATLAS;
  const animation = aliasToAnimation(state);

  // Frame progress 0..1, advanced by rAF against the loop duration.
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timing whenever the animation changes so the new anim starts clean.
    startRef.current = null;
    const loopMs = (atlas.animations[animation] ?? atlas.animations.idle).loopMs;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      setProgress((elapsed % loopMs) / loopMs);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animation, atlas]);

  // ---- Missing sprite: explicit, minimal marker (NOT a pretty fake) -------
  if (!available) {
    const w = size;
    const h = Math.round((size * atlas.cellHeight) / atlas.cellWidth);
    return (
      <div
        className="missing-sprite"
        style={{ width: w, height: h }}
        title={`missing sprite: ${petSlug}`}
      >
        missing
        <br />
        sprite
      </div>
    );
  }

  const width = size;
  const height = Math.round((size * atlas.cellHeight) / atlas.cellWidth);
  const frame = getFrame(atlas, animation, progress);
  const { backgroundPosition, backgroundSize } = backgroundPositionFor(
    atlas,
    frame,
    width,
    height
  );

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transform: direction === "left" ? "scaleX(-1)" : undefined,
      }}
    >
      {/* Ground shadow so the pet feels anchored to the floor */}
      <div
        className="pet-shadow"
        style={{
          width: width * 0.8,
          height: height * 0.18,
          left: "50%",
          top: height * 0.92,
          opacity: 0.5,
        }}
      />
      {/* Selection / hover ring marker on the floor */}
      {isSelected && (
        <div
          className="pet-marker"
          style={{
            width: width * 0.9,
            height: width * 0.9,
            left: "50%",
            top: height * 0.95,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 12px ${accent}aa`,
            background: `${accent}14`,
          }}
        />
      )}
      {/* The actual sprite frame */}
      <div
        className={`pet-sprite ${walking ? "pet-walking" : ""}`}
        style={{
          position: "absolute",
          inset: 0,
          width,
          height,
          backgroundImage: `url(${spritesheetUrlFor(petSlug)})`,
          backgroundPosition,
          backgroundSize,
          filter: isSelected
            ? `drop-shadow(0 0 6px ${accent}cc)`
            : "drop-shadow(0 3px 3px rgba(0,0,0,0.45))",
        }}
      />
      {/* Floating label + role chip (counter-flipped if facing left) */}
      {(label || role) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -4,
            transform: `translate(-50%, -100%)${
              direction === "left" ? " scaleX(-1)" : ""
            }`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
          }}
        >
          {label && (
            <div
              className="label-floating"
              style={{ borderColor: isSelected ? accent : undefined }}
            >
              {label}
            </div>
          )}
          {role && (
            <div
              className="label-floating"
              style={{
                fontSize: 9,
                padding: "1px 6px",
                background: `${accent}22`,
                borderColor: `${accent}88`,
                color: accent,
              }}
            >
              {role}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
