/**
 * CodexPetSprite — v0.2.
 *
 * Renders a single Codex Pet from a local spritesheet using CSS
 * `background-position`, advanced by requestAnimationFrame.
 *
 * New v0.2 props allow strong per-agent visual differentiation:
 *   - variant:   hue-rotate / brightness / saturate tint
 *   - accessory: a small emoji glyph drawn beside the pet
 *   - statusRing: explicit ring color
 *   - shadow:    toggle the ground shadow
 *   - scale:     uniform size multiplier
 *
 * If the pet slug is not available locally, it renders an explicit, minimal
 * "missing sprite" marker — never a pretty fake placeholder.
 */
import { useEffect, useRef, useState } from "react";
import type {
  CodexPetAnimationAlias,
  ResolvedPetSprite,
} from "../types/codexPet";
import type { ActivityKind } from "../types";
import {
  DEFAULT_ATLAS,
  aliasToAnimation,
  backgroundPositionFor,
  getFrame,
  isPetAvailable,
  resolveAtlas,
  spritesheetUrlFor,
} from "../lib/codexPetSprites";

export interface PetVariant {
  /** Hue-rotate in degrees. */
  hue?: number;
  /** Brightness multiplier (1 = none). */
  brightness?: number;
  /** Saturate multiplier (1 = none). */
  saturate?: number;
}

export interface CodexPetSpriteProps {
  petSlug: string;
  state: CodexPetAnimationAlias;
  /** Base display width in px. Height auto-derived from atlas ratio. */
  size: number;
  direction?: "left" | "right";
  isSelected?: boolean;
  label?: string;
  role?: string;
  walking?: boolean;
  accent?: string;
  /** v0.2: visual variant (tint) applied to the sprite. */
  variant?: PetVariant;
  /** v0.2: a small accessory glyph drawn beside the pet. */
  accessory?: string;
  /** v0.2: explicit status ring color (defaults to accent). */
  statusRing?: string;
  /** v0.2: toggle the ground shadow (default true). */
  shadow?: boolean;
  /** v0.2: uniform size multiplier on top of `size` (default 1). */
  scale?: number;
  /** v0.6: current activity (drives a small floating activity effect). */
  activity?: ActivityKind;
  /** v0.6: business state for the activity effect emoji. */
  stateLabel?: string;
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
  variant,
  accessory,
  statusRing,
  shadow = true,
  scale = 1,
  activity,
  stateLabel,
}: CodexPetSpriteProps) {
  const available = isPetAvailable(petSlug);
  const atlas = resolveAtlas(undefined) ?? DEFAULT_ATLAS;
  // When walking, override to the run animation so the pet visibly "walks".
  const animation = walking
    ? aliasToAnimation("run")
    : aliasToAnimation(state);
  const ringColor = statusRing ?? accent;

  // Activity effect: a small floating emoji above the sprite.
  const effect = activityEffect(activity, stateLabel);

  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
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
    const w = size * scale;
    const h = Math.round((size * atlas.cellHeight * scale) / atlas.cellWidth);
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

  const width = size * scale;
  const height = Math.round((size * atlas.cellHeight * scale) / atlas.cellWidth);
  const frame = getFrame(atlas, animation, progress);
  const { backgroundPosition, backgroundSize } = backgroundPositionFor(
    atlas,
    frame,
    width,
    height
  );

  // Build the CSS filter: drop-shadow + optional variant tints.
  const filters: string[] = [];
  if (isSelected) filters.push(`drop-shadow(0 0 6px ${accent}cc)`);
  else filters.push("drop-shadow(0 3px 3px rgba(0,0,0,0.45))");
  if (variant?.hue) filters.push(`hue-rotate(${variant.hue}deg)`);
  if (variant?.brightness) filters.push(`brightness(${variant.brightness})`);
  if (variant?.saturate) filters.push(`saturate(${variant.saturate})`);

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
      {shadow && (
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
      )}
      {/* Selection / hover ring marker on the floor */}
      {isSelected && (
        <div
          className="pet-marker"
          style={{
            width: width * 0.9,
            height: width * 0.9,
            left: "50%",
            top: height * 0.95,
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 12px ${ringColor}aa`,
            background: `${ringColor}14`,
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
          filter: filters.join(" "),
        }}
      />
      {/* Activity effect: small floating emoji/indicator above the sprite */}
      {effect && (
        <div
          className="activity-effect"
          style={{
            position: "absolute",
            left: "50%",
            top: -2,
            transform: `translate(-50%, -100%)${
              direction === "left" ? " scaleX(-1)" : ""
            }`,
            fontSize: Math.max(11, width * 0.24),
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
            pointerEvents: "none",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
          title={effect.label}
        >
          {effect.glyph}
        </div>
      )}
      {/* Accessory glyph (kept un-flipped so it reads correctly) */}
      {accessory && (
        <div
          style={{
            position: "absolute",
            right: -2,
            top: 2,
            fontSize: Math.max(11, width * 0.26),
            transform: direction === "left" ? "scaleX(-1)" : undefined,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          {accessory}
        </div>
      )}
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

/**
 * Map an activity / business state to a small floating visual effect shown
 * above the sprite. Returns null when no effect applies (idle/walking).
 */
function activityEffect(
  activity: ActivityKind | undefined,
  stateLabel: string | undefined
): { glyph: string; label: string } | null {
  // Walking: no effect (the motion itself is the signal).
  if (stateLabel === "walking") return null;

  // Business-state-driven effects take priority for clarity.
  if (stateLabel === "Thinking") return { glyph: "💭", label: "thinking" };
  if (stateLabel === "Blocked") return { glyph: "⚠️", label: "blocked" };
  if (stateLabel === "Escalating") return { glyph: "⚠️", label: "escalating" };
  if (stateLabel === "Shipping") return { glyph: "✨", label: "shipping" };
  if (stateLabel === "In Meeting" || stateLabel === "Collaborating") {
    return { glyph: "💬", label: "in meeting" };
  }

  // Activity-driven effects.
  switch (activity) {
    case "meeting":
      return { glyph: "💬", label: "meeting" };
    case "command-monitoring":
    case "screen-review":
      return { glyph: "🖥", label: "reviewing" };
    case "research":
      return { glyph: "📖", label: "researching" };
    case "qa-test":
      return { glyph: "🔬", label: "testing" };
    case "break":
      return { glyph: "☕", label: "on break" };
    case "lobby":
      return { glyph: "🛋", label: "at reception" };
    case "desk-work":
    default:
      return { glyph: "⌨", label: "working" };
  }
}

