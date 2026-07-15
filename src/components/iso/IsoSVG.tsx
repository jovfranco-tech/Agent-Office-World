/**
 * IsoSVG.tsx — custom isometric furniture rendered as SVG with real 3D facets.
 *
 * Each piece has top/left/right faces with distinct shading (light from
 * upper-left), giving genuine depth that flat PNG sprites can't achieve.
 * This is the key upgrade from 8.5 → 9+: cohesive, dimensional furniture.
 *
 * Style: warm modern office, muted palette, clean lines. Consistent with
 * the light polished concrete floor.
 */

/** Shared SVG wrapper with shadow + scale. */
function IsoBox({
  w = 64,
  h = 64,
  children,
  shadow = true,
}: {
  w?: number;
  h?: number;
  children: React.ReactNode;
  shadow?: boolean;
}) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        overflow: "visible",
        display: "block",
        filter: shadow
          ? "drop-shadow(2px 4px 6px rgba(60,45,25,0.25))"
          : "none",
      }}
    >
      {children}
    </svg>
  );
}

// Color palette — warm cohesive office tones
const C = {
  wood: { top: "#c4a47a", left: "#9a7d58", right: "#7a6347" },
  desk: { top: "#d4cfc4", left: "#a8a399", right: "#87837a" },
  dark: { top: "#3a3d48", left: "#2c2e37", right: "#22242b" },
  screen: { top: "#0c1c30", left: "#08121f", right: "#060e18" },
  glow: "#22d3ee",
  blue: "#3b82f6",
  green: "#4ade80",
  fabric: { top: "#8b7daa", left: "#6e6191", right: "#564b75" },
  metal: { top: "#7a8090", left: "#5c6170", right: "#474b58" },
  white: { top: "#e8e4dc", left: "#c8c4bc", right: "#aaa69e" },
  plant: { top: "#4ade80", left: "#22c55e", right: "#16a34a" },
  pot: { top: "#a07a5a", left: "#7e5e44", right: "#604632" },
  amber: "#f59e0b",
};

/** A 3D box drawn isometrically with top/left/right faces. */
function IsoPrism({
  cx,
  cy,
  tw,
  th,
  depth,
  colors,
}: {
  cx: number;
  cy: number;
  tw: number;
  th: number;
  depth: number;
  colors: { top: string; left: string; right: string };
}) {
  // Diamond top face
  const top = `${cx},${cy - th / 2} ${cx + tw / 2},${cy} ${cx},${cy + th / 2} ${cx - tw / 2},${cy}`;
  // Left face (front-left)
  const left = `${cx - tw / 2},${cy} ${cx},${cy + th / 2} ${cx},${cy + th / 2 + depth} ${cx - tw / 2},${cy + depth}`;
  // Right face (front-right)
  const right = `${cx},${cy + th / 2} ${cx + tw / 2},${cy} ${cx + tw / 2},${cy + depth} ${cx},${cy + th / 2 + depth}`;
  return (
    <>
      <polygon points={right} fill={colors.right} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <polygon points={left} fill={colors.left} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <polygon points={top} fill={colors.top} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
    </>
  );
}

// === DESK with monitor ===
export function SvgDesk({ size = 64 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 1.4} h={s * 1.3}>
      {/* Monitor */}
      <IsoPrism cx={s * 0.5} cy={s * 0.25} tw={s * 0.35} th={s * 0.18} depth={s * 0.35} colors={C.dark} />
      {/* Screen glow */}
      <polygon
        points={`${s * 0.5},${s * 0.1} ${s * 0.65},${s * 0.18} ${s * 0.5},${s * 0.26} ${s * 0.35},${s * 0.18}`}
        fill={C.glow}
        opacity="0.7"
      />
      {/* Desk surface */}
      <IsoPrism cx={s * 0.7} cy={s * 0.6} tw={s * 0.9} th={s * 0.45} depth={s * 0.12} colors={C.desk} />
    </IsoBox>
  );
}

// === DUAL MONITOR DESK (engineering) ===
export function SvgDualDesk({ size = 64 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 1.6} h={s * 1.3}>
      {/* Left monitor */}
      <IsoPrism cx={s * 0.3} cy={s * 0.22} tw={s * 0.3} th={s * 0.16} depth={s * 0.38} colors={C.dark} />
      <polygon points={`${s*0.3},${s*0.08} ${s*0.42},${s*0.14} ${s*0.3},${s*0.2} ${s*0.18},${s*0.14}`} fill={C.glow} opacity="0.6" />
      {/* Right monitor */}
      <IsoPrism cx={s * 0.7} cy={s * 0.22} tw={s * 0.3} th={s * 0.16} depth={s * 0.38} colors={C.dark} />
      <polygon points={`${s*0.7},${s*0.08} ${s*0.82},${s*0.14} ${s*0.7},${s*0.2} ${s*0.58},${s*0.14}`} fill={C.blue} opacity="0.6" />
      {/* Desk */}
      <IsoPrism cx={s * 0.8} cy={s * 0.6} tw={s * 1.1} th={s * 0.55} depth={s * 0.12} colors={C.desk} />
    </IsoBox>
  );
}

// === CHAIR ===
export function SvgChair({ size = 64 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.7} h={s * 0.8} shadow={false}>
      {/* Seat */}
      <IsoPrism cx={s * 0.35} cy={s * 0.35} tw={s * 0.4} th={s * 0.2} depth={s * 0.08} colors={C.fabric} />
      {/* Backrest */}
      <IsoPrism cx={s * 0.5} cy={s * 0.15} tw={s * 0.15} th={s * 0.3} depth={s * 0.25} colors={C.fabric} />
    </IsoBox>
  );
}

// === MEETING TABLE ===
export function SvgMeetingTable({ size = 96 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 1.5} h={s}>
      <IsoPrism cx={s * 0.75} cy={s * 0.4} tw={s * 1.1} th={s * 0.55} depth={s * 0.15} colors={C.wood} />
      {/* Wood grain highlight on top */}
      <polygon
        points={`${s*0.75},${s*0.12} ${s*1.25},${s*0.4} ${s*0.75},${s*0.68} ${s*0.25},${s*0.4}`}
        fill="rgba(200,170,120,0.15)"
      />
    </IsoBox>
  );
}

// === RECEPTION DESK ===
export function SvgReceptionDesk({ size = 96 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 1.6} h={s * 1.1}>
      <IsoPrism cx={s * 0.8} cy={s * 0.5} tw={s * 1.2} th={s * 0.6} depth={s * 0.25} colors={C.white} />
      {/* Sign panel */}
      <rect x={s * 0.3} y={s * 0.15} width={s * 0.5} height={s * 0.12} rx="2" fill={C.blue} opacity="0.8" />
      <text x={s * 0.55} y={s * 0.24} textAnchor="middle" fontSize={s * 0.06} fill="white" fontWeight="bold" fontFamily="sans-serif">
        AGENT OFFICE
      </text>
    </IsoBox>
  );
}

// === COMMAND WALL (6 screens) ===
export function SvgCommandWall({ size = 200 }: { size?: number }) {
  const s = size;
  const screens = 6;
  const screenW = s * 0.13;
  return (
    <svg width={s * 1.4} height={s} viewBox={`0 0 ${s * 1.4} ${s}`} style={{ overflow: "visible" }}>
      {/* Bloom backdrop */}
      <ellipse cx={s * 0.7} cy={s * 0.4} rx={s * 0.7} ry={s * 0.35} fill={C.glow} opacity="0.08" />
      {Array.from({ length: screens }).map((_, i) => {
        const cx = s * 0.15 + i * (s * 0.21);
        const colors = i % 2 === 0 ? C.screen : { top: "#0a1830", left: "#06101e", right: "#040a14" };
        const glowColor = i % 3 === 0 ? C.glow : i % 3 === 1 ? C.blue : "#818cf8";
        return (
          <g key={i}>
            {/* Screen body */}
            <IsoPrism cx={cx} cy={s * 0.3} tw={screenW} th={screenW * 0.5} depth={s * 0.42} colors={colors} />
            {/* Screen face glow */}
            <polygon
              points={`${cx},${s*0.14} ${cx+screenW*0.5},${s*0.3} ${cx},${s*0.46} ${cx-screenW*0.5},${s*0.3}`}
              fill={glowColor}
              opacity="0.55"
            />
            {/* Status LED */}
            <circle cx={cx + screenW * 0.3} cy={s * 0.22} r="1.5" fill={C.green} opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      {/* Console table */}
      <IsoPrism cx={s * 0.7} cy={s * 0.75} tw={s * 0.9} th={s * 0.45} depth={s * 0.15} colors={C.dark} />
    </svg>
  );
}

// === SOFA ===
export function SvgSofa({ size = 80 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 1.3} h={s * 0.9}>
      {/* Base */}
      <IsoPrism cx={s * 0.6} cy={s * 0.5} tw={s * 0.9} th={s * 0.45} depth={s * 0.12} colors={C.fabric} />
      {/* Back cushion */}
      <IsoPrism cx={s * 0.75} cy={s * 0.2} tw={s * 0.2} th={s * 0.4} depth={s * 0.22} colors={C.fabric} />
    </IsoBox>
  );
}

// === COFFEE TABLE ===
export function SvgCoffeeTable({ size = 56 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s} h={s * 0.7}>
      <IsoPrism cx={s * 0.5} cy={s * 0.35} tw={s * 0.7} th={s * 0.35} depth={s * 0.08} colors={C.wood} />
    </IsoBox>
  );
}

// === COFFEE MACHINE ===
export function SvgCoffeeMachine({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.6} h={s * 0.9}>
      <IsoPrism cx={s * 0.3} cy={s * 0.3} tw={s * 0.35} th={s * 0.18} depth={s * 0.5} colors={C.metal} />
      {/* Red LED */}
      <circle cx={s * 0.35} cy={s * 0.5} r="1.5" fill="#ef4444" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
    </IsoBox>
  );
}

// === BOOKSHELF ===
export function SvgBookshelf({ size = 48 }: { size?: number }) {
  const s = size;
  const bookColors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
  return (
    <IsoBox w={s * 0.6} h={s * 1.3}>
      <IsoPrism cx={s * 0.3} cy={s * 0.5} tw={s * 0.35} th={s * 0.18} depth={s * 0.85} colors={C.wood} />
      {/* Books on top */}
      {bookColors.map((bc, i) => (
        <rect key={i} x={s * 0.12 + i * 3} y={s * 0.05} width="2" height={s * 0.25} fill={bc} opacity="0.7" rx="0.5" />
      ))}
    </IsoBox>
  );
}

// === WHITEBOARD ===
export function SvgWhiteboard({ size = 56 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s} h={s * 1.2}>
      {/* Frame */}
      <IsoPrism cx={s * 0.5} cy={s * 0.4} tw={s * 0.7} th={s * 0.35} depth={s * 0.6} colors={{ top: "#e8e4dc", left: "#c8c4bc", right: "#aaa69e" }} />
      {/* Grid lines on board face */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={s * 0.2} y1={s * 0.2 + i * 6} x2={s * 0.8} y2={s * 0.2 + i * 6} stroke="rgba(100,130,180,0.2)" strokeWidth="0.5" />
      ))}
    </IsoBox>
  );
}

// === SERVER RACK ===
export function SvgServerRack({ size = 44 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.6} h={s * 1.4}>
      <IsoPrism cx={s * 0.3} cy={s * 0.55} tw={s * 0.3} th={s * 0.15} depth={s * 0.95} colors={C.metal} />
      {/* LEDs */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={s * 0.18} cy={s * 0.25 + i * 7} r="1.2" fill={i % 2 === 0 ? C.glow : C.amber} opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </IsoBox>
  );
}

// === FILING CABINET ===
export function SvgFilingCabinet({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.6} h={s * 1.1}>
      <IsoPrism cx={s * 0.3} cy={s * 0.4} tw={s * 0.3} th={s * 0.15} depth={s * 0.7} colors={C.metal} />
      {/* Drawer lines */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={s * 0.15} y1={s * 0.2 + i * 12} x2={s * 0.45} y2={s * 0.2 + i * 12} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      ))}
    </IsoBox>
  );
}

// === PLANT ===
export function SvgPlant({ size = 44 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.7} h={s * 1.1} shadow={false}>
      {/* Pot */}
      <IsoPrism cx={s * 0.35} cy={s * 0.75} tw={s * 0.3} th={s * 0.15} depth={s * 0.2} colors={C.pot} />
      {/* Foliage */}
      <ellipse cx={s * 0.35} cy={s * 0.3} rx={s * 0.22} ry={s * 0.25} fill={C.plant.top} opacity="0.9" />
      <ellipse cx={s * 0.28} cy={s * 0.25} rx={s * 0.12} ry={s * 0.15} fill={C.plant.left} opacity="0.8" />
      <ellipse cx={s * 0.42} cy={s * 0.32} rx={s * 0.1} ry={s * 0.13} fill={C.plant.right} opacity="0.7" />
    </IsoBox>
  );
}

// === FLOOR LAMP ===
export function SvgFloorLamp({ size = 36 }: { size?: number }) {
  const s = size;
  return (
    <IsoBox w={s * 0.5} h={s * 1.3} shadow={false}>
      {/* Glow */}
      <ellipse cx={s * 0.25} cy={s * 0.15} rx={s * 0.35} ry={s * 0.25} fill="rgba(250,220,150,0.2)" />
      {/* Shade */}
      <ellipse cx={s * 0.25} cy={s * 0.12} rx={s * 0.12} ry={s * 0.08} fill={C.amber} />
      {/* Pole */}
      <rect x={s * 0.24} y={s * 0.15} width="2" height={s * 0.75} fill="#475569" rx="1" />
      {/* Base */}
      <ellipse cx={s * 0.25} cy={s * 0.95} rx={s * 0.14} ry={s * 0.06} fill="#334155" />
    </IsoBox>
  );
}

// === GLASS PARTITION ===
export function SvgGlassPartition({ size = 64, spanW = 1 }: { size?: number; spanW?: number }) {
  const s = size * Math.max(1, spanW);
  // Minimalist premium glass wall: thin frameless glass with a single vertical
  // mullion and soft tint. Inspired by modern office partitions (not industrial).
  const W = s * 1.2;
  const H = s * 1.05;
  const wallH = s * 0.72;       // height of the wall
  const baseY = s * 0.82;       // bottom on floor
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", filter: "drop-shadow(1px 3px 4px rgba(60,45,25,0.18))" }}>
      <defs>
        <linearGradient id={`glass-${spanW}-${size}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="rgba(190,220,240,0.34)" />
          <stop offset="50%" stopColor="rgba(170,205,230,0.22)" />
          <stop offset="100%" stopColor="rgba(185,215,240,0.30)" />
        </linearGradient>
      </defs>
      {/* Glass pane — the single visible face */}
      <polygon
        points={`${s * 0.12},${baseY - wallH} ${s * 0.6},${baseY - wallH + s * 0.17} ${s * 0.6},${baseY + s * 0.17} ${s * 0.12},${baseY}`}
        fill={`url(#glass-${spanW}-${size})`}
        stroke="rgba(140,175,205,0.5)"
        strokeWidth="0.6"
      />
      {/* Thin top edge (frameless premium look) */}
      <polygon
        points={`${s * 0.12},${baseY - wallH} ${s * 0.6},${baseY - wallH + s * 0.17} ${s * 1.02},${baseY - wallH} ${s * 0.54},${baseY - wallH - s * 0.17}`}
        fill="rgba(210,230,245,0.28)"
        stroke="rgba(150,180,210,0.4)"
        strokeWidth="0.5"
      />
      {/* Single central mullion (minimal — 1, not 4) */}
      <line x1={s * 0.36} y1={baseY - wallH + s * 0.085} x2={s * 0.36} y2={baseY + s * 0.085} stroke="rgba(110,125,145,0.55)" strokeWidth="0.9" />
      {/* Floor track — very thin */}
      <line x1={s * 0.12} y1={baseY} x2={s * 0.6} y2={baseY + s * 0.17} stroke="rgba(100,115,135,0.6)" strokeWidth="1.2" />
      {/* Soft specular streak — premium glass reflection */}
      <line x1={s * 0.2} y1={baseY - wallH + s * 0.08} x2={s * 0.32} y2={baseY - wallH * 0.4} stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      <line x1={s * 0.44} y1={baseY - wallH * 0.5 + s * 0.08} x2={s * 0.52} y2={baseY - wallH * 0.25 + s * 0.08} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}

// === RUG ===
export function SvgRug({ size = 96, spanW = 1, spanH = 1 }: { size?: number; spanW?: number; spanH?: number }) {
  const w = size * Math.max(1, spanW * 0.8);
  const h = size * 0.5 * Math.max(1, spanH * 0.8);
  return (
    <svg width={w * 1.3} height={h * 1.5} viewBox={`0 0 ${w * 1.3} ${h * 1.5}`} style={{ overflow: "visible", opacity: 0.5 }}>
      <ellipse cx={w * 0.65} cy={h * 0.75} rx={w * 0.55} ry={h * 0.6} fill="rgba(120,90,60,0.3)" />
      <ellipse cx={w * 0.65} cy={h * 0.75} rx={w * 0.4} ry={h * 0.42} fill="none" stroke="rgba(150,120,80,0.2)" strokeWidth="1" />
    </svg>
  );
}

// === WALL SIGN ===
export function SvgWallSign({ size = 80, label = "AGENT OFFICE" }: { size?: number; label?: string }) {
  const s = size;
  return (
    <IsoBox w={s} h={s * 0.5} shadow={false}>
      <rect x={s * 0.1} y={s * 0.05} width={s * 0.8} height={s * 0.2} rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
      <text x={s * 0.5} y={s * 0.19} textAnchor="middle" fontSize={s * 0.08} fill="#bfdbfe" fontWeight="bold" fontFamily="sans-serif">
        {label}
      </text>
    </IsoBox>
  );
}
