/**
 * IsoFurniture.tsx — large, recognizable isometric furniture components for V2.
 *
 * Each component renders as a self-contained CSS/HTML shape with enough detail
 * (shadows, borders, glow, wood grain, screen scanlines) to read as a real
 * office object, not a placeholder rectangle. All are positioned by the parent
 * (OfficeSceneV2Furniture) via absolute left/top; these just render the shape.
 */
import { memo } from "react";
import type { V2Furniture } from "../../data/officeSceneV2Layout";
import type { TileSize } from "../../lib/isometric";

interface PieceProps {
  f: V2Furniture;
  tile: TileSize;
  /** Scale factor for the whole piece (default 1). */
  s?: number;
}

const deskSurface =
  "linear-gradient(135deg, #3a4763 0%, #2a3550 60%, #222d44 100%)";
const woodGrain =
  "linear-gradient(135deg, #5b4128 0%, #42301c 60%, #342414 100%)";

/** IsoDesk — a desk surface with legs + optional monitor glow. */
export const IsoDesk = memo(function IsoDesk({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.72 * s;
  const h = tile.h * 0.72 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-50%)" }}>
      <div style={{ position: "absolute", inset: 0, transform: "translateY(2px)", background: "rgba(0,0,0,0.3)", borderRadius: 4, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", inset: 0, background: deskSurface, borderRadius: 4, border: "1px solid rgba(150,180,230,0.3)", boxShadow: "0 3px 5px rgba(0,0,0,0.45)" }} />
      {/* monitor on back edge */}
      <div style={{ position: "absolute", left: "50%", top: "-30%", width: w * 0.5, height: h * 0.95, transform: "translateX(-50%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #2563eb", borderRadius: 3, boxShadow: "0 0 7px rgba(59,130,246,0.5)" }} />
    </div>
  );
});

/** IsoDualMonitorDesk — engineering station with two glowing monitors. */
export const IsoDualMonitorDesk = memo(function IsoDualMonitorDesk({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.82 * s;
  const h = tile.h * 0.72 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-50%)" }}>
      <div style={{ position: "absolute", inset: 0, transform: "translateY(2px)", background: "rgba(0,0,0,0.3)", borderRadius: 4, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", inset: 0, background: deskSurface, borderRadius: 4, border: "1px solid rgba(150,180,230,0.3)", boxShadow: "0 3px 5px rgba(0,0,0,0.45)" }} />
      {/* dual monitors */}
      <div style={{ position: "absolute", left: "25%", top: "-35%", width: w * 0.32, height: h * 1.0, transform: "translateX(-50%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #2563eb", borderRadius: 3, boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
      <div style={{ position: "absolute", left: "75%", top: "-35%", width: w * 0.32, height: h * 1.0, transform: "translateX(-50%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #2563eb", borderRadius: 3, boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
    </div>
  );
});

/** IsoChair — a visible office chair. */
export const IsoChair = memo(function IsoChair({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.38 * s;
  const h = tile.h * 0.52 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-58%)", background: "linear-gradient(180deg,#2a3753,#1b2640)", borderRadius: "45% 45% 30% 30%", border: "1px solid rgba(150,180,230,0.25)", boxShadow: "0 2px 3px rgba(0,0,0,0.45)" }} />
  );
});

/** IsoMeetingTable — large conference table with wood grain. */
export const IsoMeetingTable = memo(function IsoMeetingTable({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const spanH = f.h ?? 1;
  const w = tile.w * (0.72 + (spanW - 1) * 0.5) * s;
  const h = tile.h * (0.72 + (spanH - 1) * 0.5) * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-50%)" }}>
      <div style={{ position: "absolute", inset: 0, transform: "translateY(3px)", background: "rgba(0,0,0,0.35)", borderRadius: 10, filter: "blur(3px)" }} />
      <div style={{ position: "absolute", inset: 0, background: woodGrain, border: "1px solid rgba(220,190,140,0.4)", borderRadius: 10, boxShadow: "0 5px 12px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "absolute", inset: "12%", border: "1px solid rgba(210,180,130,0.22)", borderRadius: 8, backgroundImage: "repeating-linear-gradient(90deg, rgba(210,180,130,0.06) 0 4px, transparent 4px 9px)" }} />
      </div>
    </div>
  );
});

/** IsoReceptionDesk — large branded counter. */
export const IsoReceptionDesk = memo(function IsoReceptionDesk({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.8 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 0.72 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-50%)" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#4a5d82,#2c3a58)", borderRadius: 5, border: "1px solid rgba(170,195,235,0.35)", boxShadow: "0 4px 7px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", left: "50%", top: "55%", transform: "translateX(-50%)", fontSize: Math.max(6, w * 0.1), fontWeight: 800, letterSpacing: "0.04em", color: "#bfdbfe", textShadow: "0 1px 2px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>
        {f.label ?? "RECEPTION"}
      </div>
    </div>
  );
});

/** IsoCommandWall — the WOW zone: a wall of 6 large glowing screens with animated content. */
export const IsoCommandWall = memo(function IsoCommandWall({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.85 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 2.4 * s;
  const screens = 6;
  // Each screen gets a slightly different "content" color for visual variety
  const screenColors = [
    { bg: "#0a1f3a", glow: "#22d3ee", accent: "rgba(34,211,238,0.3)" },
    { bg: "#0d1a2e", glow: "#3b82f6", accent: "rgba(59,130,246,0.3)" },
    { bg: "#0a1f3a", glow: "#22d3ee", accent: "rgba(34,211,238,0.3)" },
    { bg: "#0e1b2e", glow: "#818cf8", accent: "rgba(129,140,248,0.3)" },
    { bg: "#0a1f3a", glow: "#22d3ee", accent: "rgba(34,211,238,0.3)" },
    { bg: "#0d1a2e", glow: "#3b82f6", accent: "rgba(59,130,246,0.3)" },
  ];
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-82%)" }}>
      {/* Massive glow backdrop — the wow moment */}
      <div style={{
        position: "absolute",
        inset: -24,
        background: "radial-gradient(ellipse at center, rgba(34,211,238,0.35) 0%, rgba(34,211,238,0.12) 35%, transparent 70%)",
        borderRadius: 20,
        filter: "blur(6px)",
      }} />
      {/* Screen frames */}
      {screenColors.map((sc, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i / screens) * 100}%`,
          top: 0,
          width: `${100 / screens - 1.5}%`,
          height: "100%",
          background: `linear-gradient(180deg, ${sc.bg}, #061427)`,
          border: `2px solid ${sc.glow}`,
          borderRadius: 4,
          boxShadow: `0 0 14px ${sc.glow}99, inset 0 0 8px ${sc.accent}`,
          overflow: "hidden",
        }}>
          {/* Animated scanlines */}
          <div style={{
            position: "absolute",
            inset: 2,
            background: `repeating-linear-gradient(180deg, ${sc.accent} 0 2px, transparent 2px 5px)`,
            animation: `scanline ${1.5 + i * 0.2}s linear infinite`,
          }} />
          {/* Fake data bars (visual interest) */}
          <div style={{
            position: "absolute",
            bottom: "15%",
            left: "15%",
            right: "15%",
            height: "20%",
            background: `${sc.glow}33`,
            borderRadius: 1,
          }} />
          <div style={{
            position: "absolute",
            bottom: "40%",
            left: "15%",
            width: "40%",
            height: "12%",
            background: `${sc.glow}22`,
            borderRadius: 1,
          }} />
          {/* Blinking status dot */}
          <div style={{
            position: "absolute",
            top: "10%",
            right: "12%",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 4px #22c55e",
            animation: "ledBlink 2s ease-in-out infinite",
          }} />
        </div>
      ))}
    </div>
  );
});

/** IsoCommandScreen — single large screen. */
export const IsoCommandScreen = memo(function IsoCommandScreen({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.6 * s;
  const h = tile.h * 1.3 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-82%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #22d3ee", borderRadius: 3, boxShadow: "0 0 10px rgba(34,211,238,0.55)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 2, background: "repeating-linear-gradient(180deg, rgba(34,211,238,0.25) 0 2px, transparent 2px 5px)" }} />
    </div>
  );
});

/** IsoPresentationScreen — screen in meeting room. */
export const IsoPresentationScreen = memo(function IsoPresentationScreen({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.7 * s;
  const h = tile.h * 1.2 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-80%)", background: "linear-gradient(180deg,#0a1f3a,#061427)", border: "2px solid #a855f7", borderRadius: 3, boxShadow: "0 0 8px rgba(168,85,247,0.5)" }} />
  );
});

/** IsoSofa — lounge seating. */
export const IsoSofa = memo(function IsoSofa({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.85 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 0.7 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-60%)", background: "linear-gradient(180deg,#4a3a6a,#2e2350)", border: "1px solid rgba(180,150,220,0.3)", borderRadius: "10px 10px 5px 5px", boxShadow: "0 4px 7px rgba(0,0,0,0.4)" }} />
  );
});

/** IsoCoffeeMachine — break area appliance. */
export const IsoCoffeeMachine = memo(function IsoCoffeeMachine({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.42 * s;
  const h = tile.h * 0.85 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-72%)" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1e293b,#0f172a)", border: "1px solid #475569", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", width: "50%", height: "30%", background: "#334155", borderRadius: 2 }} />
      <div style={{ position: "absolute", left: "50%", bottom: "12%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 4px #ef4444" }} />
    </div>
  );
});

/** IsoCoffeeTable — small low table. */
export const IsoCoffeeTable = memo(function IsoCoffeeTable({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.75 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 0.65 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-50%)", background: "linear-gradient(180deg,#3a4a66,#27344a)", border: "1px solid rgba(150,180,230,0.2)", borderRadius: 6, boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }} />
  );
});

/** IsoBookshelf — tall shelf with colored book spines. */
export const IsoBookshelf = memo(function IsoBookshelf({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.4 * s;
  const h = tile.h * 1.5 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-72%)", background: "linear-gradient(180deg,#3a2a1a,#241812)", border: "1px solid rgba(200,170,120,0.25)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
      {["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#ec4899"].map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 2 + i * 3, top: 2, bottom: 2, width: 3, background: c, opacity: 0.7 }} />
      ))}
    </div>
  );
});

/** IsoWhiteboard — wall-mounted board with grid lines. */
export const IsoWhiteboard = memo(function IsoWhiteboard({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.85 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 1.3 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-78%)", background: "linear-gradient(180deg,#eef3fb,#cdd6e6)", border: "2px solid #6b7a99", borderRadius: 2, boxShadow: "0 3px 6px rgba(0,0,0,0.4)", opacity: 0.93, position: "relative" }}>
      <div style={{ position: "absolute", inset: 3, backgroundImage: "linear-gradient(rgba(100,130,180,0.4) 1px, transparent 1px)", backgroundSize: "100% 6px" }} />
    </div>
  );
});

/** IsoServerRack — tall rack with blinking LEDs. */
export const IsoServerRack = memo(function IsoServerRack({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.46 * s;
  const h = tile.h * 1.7 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-78%)", background: "linear-gradient(180deg,#101826,#070c16)", border: "1px solid #1f3a5e", borderRadius: 2, boxShadow: "0 0 8px rgba(34,211,238,0.3), 0 3px 6px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 3, top: 4 + i * 6, width: 4, height: 4, borderRadius: "50%", background: i % 2 === 0 ? "#22d3ee" : "#f59e0b", opacity: 0.85, boxShadow: "0 0 4px currentColor" }} />
      ))}
    </div>
  );
});

/** IsoFilingCabinet — tall metal cabinet with drawer lines. */
export const IsoFilingCabinet = memo(function IsoFilingCabinet({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.42 * s;
  const h = tile.h * 1.25 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-75%)", background: "linear-gradient(180deg,#5b6b86,#33415c)", border: "1px solid #7b8ba8", borderRadius: 3, boxShadow: "0 3px 5px rgba(0,0,0,0.45)", position: "relative", overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 2, right: 2, top: 3 + i * (h * 0.32), height: 2, background: "#2a3550" }} />
      ))}
    </div>
  );
});

/** IsoPlant — potted plant. */
export const IsoPlant = memo(function IsoPlant({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.5 * s;
  const h = tile.h * 1.1 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-80%)" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: w, height: w, borderRadius: "50% 50% 45% 45%", background: "radial-gradient(circle at 35% 30%, #4ade80, #16a34a 70%, #15803d)", boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: w * 0.55, height: h * 0.45, background: "linear-gradient(180deg,#8a5a3b,#5e3c26)", borderRadius: "3px 3px 6px 6px" }} />
    </div>
  );
});

/** IsoFloorLamp — tall lamp with warm glow. */
export const IsoFloorLamp = memo(function IsoFloorLamp({ f: _f, tile, s = 1 }: PieceProps) {
  const w = tile.w * 0.3 * s;
  const h = tile.h * 1.3 * s;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: "translate(-50%,-75%)" }}>
      <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: w * 2.2, height: w * 2.2, borderRadius: "50%", background: "radial-gradient(circle, rgba(250,220,150,0.5) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: w, height: w * 0.7, background: "linear-gradient(180deg,#fcd34d,#f59e0b)", borderRadius: "50% 50% 20% 20%" }} />
      <div style={{ position: "absolute", top: w * 0.7, left: "50%", transform: "translateX(-50%)", width: 2, bottom: h * 0.18, background: "#475569" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: w * 1.1, height: 4, background: "#334155", borderRadius: 3 }} />
    </div>
  );
});

/** IsoGlassPartition — translucent glass wall. */
export const IsoGlassPartition = memo(function IsoGlassPartition({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.7 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 1.6 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-72%)", background: "linear-gradient(180deg, rgba(170,215,255,0.4) 0%, rgba(120,170,230,0.2) 100%)", border: "1px solid rgba(200,230,255,0.5)", borderRadius: 3, opacity: 0.55, boxShadow: "0 0 8px rgba(150,200,255,0.2)" }} />
  );
});

/** IsoDivider — low opaque divider. */
export const IsoDivider = memo(function IsoDivider({ f, tile, s = 1 }: PieceProps) {
  const spanH = f.h ?? 1;
  const w = tile.w * 0.5 * s;
  const h = tile.h * (0.4 + (spanH - 1) * 0.25) * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-55%)", background: "linear-gradient(180deg,#2a3550,#1a2438)", border: "1px solid #3a4d6a", borderRadius: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.4)", opacity: 0.85 }} />
  );
});

/** IsoRug — flat floor covering (rendered behind furniture). */
export const IsoRug = memo(function IsoRug({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const spanH = f.h ?? 1;
  const w = tile.w * (1.0 + (spanW - 1) * 0.5) * s;
  const h = tile.h * (1.0 + (spanH - 1) * 0.5) * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-50%)", background: "repeating-linear-gradient(45deg, rgba(120,90,60,0.15) 0 6px, rgba(90,60,40,0.15) 6px 12px)", borderRadius: 8, opacity: 0.4 }} />
  );
});

/** IsoWallSign — branded wall sign. */
export const IsoWallSign = memo(function IsoWallSign({ f, tile, s = 1 }: PieceProps) {
  const spanW = f.w ?? 1;
  const w = tile.w * (0.85 + (spanW - 1) * 0.5) * s;
  const h = tile.h * 0.55 * s;
  return (
    <div style={{ width: w, height: h, transform: "translate(-50%,-88%)", background: "linear-gradient(180deg,#1e3a8a,#172554)", border: "1px solid #3b82f6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(6, w * 0.1), fontWeight: 800, color: "#bfdbfe", letterSpacing: "0.06em", boxShadow: "0 0 8px rgba(59,130,246,0.4)", whiteSpace: "nowrap" }}>
      {f.label ?? "AGENT OFFICE"}
    </div>
  );
});

/** Renderer dispatch: maps a V2FurnitureType to its Iso* component. */
export function renderIsoPiece(f: V2Furniture, tile: TileSize, s = 1) {
  switch (f.type) {
    case "desk": return <IsoDesk f={f} tile={tile} s={s} />;
    case "dual-monitor-desk": return <IsoDualMonitorDesk f={f} tile={tile} s={s} />;
    case "chair": return <IsoChair f={f} tile={tile} s={s} />;
    case "meeting-table": return <IsoMeetingTable f={f} tile={tile} s={s} />;
    case "reception-desk": return <IsoReceptionDesk f={f} tile={tile} s={s} />;
    case "command-wall": return <IsoCommandWall f={f} tile={tile} s={s} />;
    case "presentation-screen": return <IsoPresentationScreen f={f} tile={tile} s={s} />;
    case "sofa": return <IsoSofa f={f} tile={tile} s={s} />;
    case "coffee-machine": return <IsoCoffeeMachine f={f} tile={tile} s={s} />;
    case "coffee-table": return <IsoCoffeeTable f={f} tile={tile} s={s} />;
    case "bookshelf": return <IsoBookshelf f={f} tile={tile} s={s} />;
    case "whiteboard": return <IsoWhiteboard f={f} tile={tile} s={s} />;
    case "server-rack": return <IsoServerRack f={f} tile={tile} s={s} />;
    case "filing-cabinet": return <IsoFilingCabinet f={f} tile={tile} s={s} />;
    case "plant": return <IsoPlant f={f} tile={tile} s={s} />;
    case "floor-lamp": return <IsoFloorLamp f={f} tile={tile} s={s} />;
    case "glass-partition": return <IsoGlassPartition f={f} tile={tile} s={s} />;
    case "divider": return <IsoDivider f={f} tile={tile} s={s} />;
    case "rug": return <IsoRug f={f} tile={tile} s={s} />;
    case "wall-sign": return <IsoWallSign f={f} tile={tile} s={s} />;
    default: return null;
  }
}
