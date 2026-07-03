# task.md — Agent Office World

What was implemented, decisions taken, validations executed, risks, and
pending items.

## 1. What was implemented

A from-scratch isometric office simulation app (**Vite + React + TypeScript +
Tailwind v4**) where 20 AI agents — rendered as animated **Codex Pets** sprites
— work, move, meet and collaborate inside a single continuous office.

### Features
- **Continuous isometric office floor** (26×22 grid) with 12 recognizable
  zones, rendered as colored diamonds via CSS `clip-path`. Not boxes, not a
  node graph, not a dashboard.
- **20 mock agents**, each with name, role, state, zone, task, energy,
  animation and an assigned Codex Pet.
- **Real Codex Pets sprites**, auto-fetched from the Petdex CDN into
  `public/sprites/codex-pets/`. 14 distinct pets cover all 20 roles.
- **CodexPetSprite** component: renders the correct spritesheet frame via
  `background-position`, animated with `requestAnimationFrame` against each
  row's loop duration. Fixed 8×9 / 192×208 atlas.
- **Furniture**: desks, monitors, whiteboards, plants, sofas, meeting tables,
  bookshelves, a server rack with blinking LEDs, and a command-center wall of
  screens — all CSS, depth-sorted.
- **Agent grounding**: each pet has a soft ground shadow + selection ring so it
  feels anchored to the floor (not a floating sticker).
- **Simulation engine** (`src/lib/simulation.ts`): pure local mock with
  `tick()` (Live Mode), `simulateHour()` (burst), `resetDay()`. Agents change
  state/task, move within and between zones, drift energy, emit events.
- **Interactions**:
  - Click an agent → **AgentInspector** (name, role, pet, state, task, zone,
    energy, animation, sprite source, next action).
  - Click a zone → **ZoneInspector** (agents currently there).
  - **Simulate 1 Hour**, **Start/Pause Live Mode**, **Reset Day**.
  - Role filter + state filter (non-matching agents dim, matching zones
    highlight).
  - Toggle floating labels.
  - **EventTimeline** of recent mock activity.
  - **OfficeLegend** with stats, zone list, role color key.
- **Responsive**: scene auto-scales to viewport; side panel collapses on
  small screens.

### Architecture (files)
```
src/
  main.tsx, App.tsx, styles.css, types.ts
  data/        agents.ts, officeZones.ts, furniture.ts, events.ts, codexPetsManifest.ts
  components/  OfficeWorld, OfficeFloor, AgentSprite, CodexPetSprite,
               ZoneLayer, FurnitureLayer, AgentInspector, ZoneInspector,
               EventTimeline, ControlBar, OfficeLegend
  lib/         simulation.ts, isometric.ts, codexPetSprites.ts, agentStateAnimation.ts
  types/       codexPet.ts
public/sprites/codex-pets/<slug>/{pet.json, spritesheet.webp}  (14 pets)
scripts/fetch-codex-pets.mjs
README.md, task.md, docs/codex-pets-usage.md, LICENSE
```

---

## 2. Decisions taken

1. **Sprites: auto-download real pets** (it was possible — confirmed the Petdex
   CDN + manifest API work). A Node script pulls them locally so the app has
   zero runtime external dependency and is robust offline. ~24 MB committed to
   `public/` for a self-contained demo.
2. **14 distinct pets for 20 roles**: reused across related roles (e.g. Infra↔
   Ops, Risk↔Security, Product↔Coding). Differentiated every agent via accent
   color + role badge + status ring + zone, per spec.
3. **DOM + CSS isometric rendering**, not canvas. Classic 2:1 diamond
   projection with `clip-path` zones and `z-index`-based painter's-algorithm
   depth sorting. Most robust for hover/click/responsive and needs no deps.
4. **Fixed global atlas** (8×9, 192×208) baked into `codexPetSprites.ts`, with
   optional `pet.json` override. Verified against 4 live spritesheets — all
   1536×1872.
5. **State→animation mapping** uses the 9 real rows; spec-only states like
   `thinking/working/blocked` map onto existing rows (`review`/`idle`/
   `failed`).
6. **Missing sprites render an explicit "missing sprite" marker** — never a
   pretty fake placeholder. Honest fallback per spec.
7. **Tailwind v4** via `@tailwindcss/vite` for panels/badges/controls; custom
   CSS for iso transforms, sprite stepping, furniture shapes.

---

## 3. Validations executed

| Check | Result |
|---|---|
| `npm install` | ✅ 80 packages, 0 errors |
| Codex Pets manifest API reachable | ✅ 3,319 pets |
| 14 pets downloaded (curated + manifest) | ✅ all valid RIFF/WebP |
| Spritesheet dimensions = 1536×1872 (8×9 @ 192×208) | ✅ confirmed on 4 pets |
| Role→pet audit (20 roles) | ✅ all 20 covered, 14 distinct pets |
| `npm run dev` boots | ✅ Vite ready, HTTP 200 on index/sprites/main.tsx |
| `npx tsc --noEmit` | ✅ clean (0 errors) |
| `npm run build` | ✅ built in 441ms (187 kB JS / 13 kB CSS gzipped) |

### Role → pet mapping (final)
```
CEO→ostrom, PMO→maisenpai, Research→heimerdinger, Coding→boba, QA→glitchcat,
Security→belayer-cat, Finance→guan-miao, Sales→dylan-harper, Support→tabby,
Design→chefito, Ops→astro-ops, Legal/Compliance→humboldt, Data→bytechomp-v2,
Infra→astro-ops, Product→boba, Customer Success→tabby, Automation→glitchcat,
Risk→belayer-cat, Documentation→paperclip, Strategy→ostrom
```

---

## 4. Risks

1. **Pet licensing** ⚠️ (highest): Pet assets are owned by their Petdex
   submitters; there is **no blanket commercial grant**. The bundled pets are
   **demo/local use only**. Must validate each pet's license before any
   commercial/public use. Documented in README + `docs/codex-pets-usage.md`.
2. **Repo size**: ~24 MB of webp sprites in `public/`. Acceptable for a demo;
   strip or use a CDN/LFS for production.
3. **Petdex is community-run**, not an official OpenAI project. The CDN/manifest
   schema could change. The fetch script is defensive (curated → manifest
   fallback) and the app reads a local `index.json` so runtime is decoupled.
4. **Atlas assumption**: the renderer assumes the standard 8×9/192×208 grid.
   Non-standard spritesheets would need `pet.json` overrides (supported).
5. **No persistence**: simulation state resets on reload (intentional per spec).

---

## 5. Pending / not done (by design — out of scope per spec)

Login, database, multi-user, backend, real LLM, external APIs, persistence,
payments, deploy. These were explicitly deprioritized.

---

# v0.2 — Office Realism + Unique Agents Pass

This iteration resolved the two problems flagged in v0.1:
1. **It didn't look enough like an office** → rebuilt with real walls, glass
   partitions, denser furniture, and sensible agent placement.
2. **There were repeated characters** → every agent now has a UNIQUE pet.

## What changed (v0.2)

### Unique agents (Priority 2 — solved)
- Added 16 more Codex Pets (30 total on disk).
- Rewrote `codexPetsManifest.ts` as a per-AGENT mapping: **21 agents → 21
  distinct pet slugs** (verified: 0 duplicates).
- Added `detectDuplicatePets()` helper that enforces the no-repeats guarantee
  and reports any missing pets.
- Added per-agent **visual variants** (hue/brightness/saturate tints),
  **accessory glyphs**, **status rings**, and **scale** so agents are
  differentiated beyond just a label — even species-adjacent pets look distinct.

### Office realism (Priority 1 — major improvement)
- New `src/lib/officeLayout.ts`: defines **outer perimeter walls**, **glass
  partitions** between zones, and **desk/stand spots** (anchor points).
- Walls now render as **tall extruded isometric slabs** (not flat lines):
  opaque walls around the perimeter + translucent blue glass partitions with
  mullion lines between zones. The office reads as enclosed rooms, not tinted
  patches.
- Furniture is much denser and zone-appropriate: reception desk + sofa,
  paired engineering desks with monitors, meeting tables + chairs, bookshelves,
  server racks with blinking LEDs, a wall of command screens, sofas + coffee
  tables in the break/client areas, lamps with glows, plants everywhere.
- New furniture types: `lamp`, `coffee-table`, `rug`.
- Agents are placed at **sensible spots** (sit in front of their desk facing
  the monitor, or stand by a meeting table/screen) — never floating on top of
  furniture. The simulation moves them between these spots.

### Composition (Priority 4)
- Bigger sprites (64px), wider scale clamp (up to 2.2×) so the office fills
  the screen.
- Label restraint: floating labels only render when zoomed in enough to be
  readable (scale > 0.7), avoiding clutter.
- Agents removed from on top of desks (no more auto-chair overlapping the
  seated agent).

## Files modified (v0.2)
- `src/data/codexPetsManifest.ts` (rewritten: per-agent unique pets + variants)
- `src/data/agents.ts` (rewritten: 21 stable IDs, spot-based placement)
- `src/data/officeZones.ts` (denser 30×24 plan)
- `src/data/furniture.ts` (rewritten: denser, layout-aligned)
- `src/lib/officeLayout.ts` (NEW: walls, partitions, desk/stand spots)
- `src/lib/simulation.ts` (spot-based movement)
- `src/components/CodexPetSprite.tsx` (variant/accessory/statusRing/shadow/scale props)
- `src/components/AgentSprite.tsx` (passes per-agent variant)
- `src/components/AgentInspector.tsx` (uses per-agent mapping)
- `src/components/FurnitureLayer.tsx` (real walls + new furniture types)
- `src/components/OfficeWorld.tsx` (bigger sprites, scale clamp, label gating)
- `src/types.ts` (new furniture types)
- `scripts/fetch-codex-pets.mjs` (fixed index to scan whole dir)
- `public/sprites/codex-pets/` (16 new pets, 30 total)

## Validation (v0.2)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run build` | ✅ 52 modules, 827ms |
| Unique pets (21 agents) | ✅ 21/21 unique, 0 duplicates |
| All slugs available locally | ✅ 30/30 |
| Visual screenshot review | ✅ walls visible, agents at desks, dense, populated |

## Known limitations / v0.3 candidates
- At very zoomed-out views, individual sprite differences are less obvious
  (each pet IS unique at the data level; zoom in or open the inspector to see).
- Iso depth-sorting of walls vs. agents is approximate (a front wall may
  occasionally render over a far agent). A true BSP/height-based sort would
  fix this in v0.3.
- Furniture shapes are CSS — could be upgraded to real isometric sprites.
- Pet licensing still unvalidated for commercial use (demo only).

---

# v0.3 — Office Realism & Furniture Density Pass

Goal: make the world read unambiguously as an office, not a closed tactical map
with characters on top.

## What changed (v0.3)

### Walls (the #1 complaint: "dungeon barriers")
- Introduced a 3-tier wall system (`outer` / `glass` / `low`) and made ALL walls
  dramatically shorter and thinner. Walls are now a faint edge / subtle glass
  tint, not a barrier. Outer perimeter is a 2px×5px baseboard; glass partitions
  are 3px×12px at 40% opacity.
- Reduced internal partitions to a minimum: only Strategy Room + War Room get a
  light glass enclosure; everything else flows as one open floor.

### Floor
- Desaturated all zone colors to a near-uniform dark blue-grey (~#10141f) with
  only a tiny per-zone hue shift. The office no longer reads as a board of
  colored regions — zones are now distinguished by FURNITURE, not by paint.

### Furniture (the #2 complaint: "brown boxes")
- **Composite workstation desks**: a `desk` now renders as ONE unit = desk
  surface + glowing blue monitor on the back edge + chair in front. This is the
  key change that makes desks read as workstations.
- New desk variants: `dual-monitor-desk` (engineering), `laptop-desk`
  (research). Engineering/security get dual monitors; research gets laptops.
- New furniture types: `filing-cabinet`, `coffee-machine`, `wall-sign`,
  `small-divider`, `test-bench`, `floor-lamp`.
- Brighter, blue-glowing monitors so workstations are immediately recognizable.
- Denser zone detail: reception now has a branded wall-sign ("AGENT OFFICE"),
  finance has filing cabinets, break area has a coffee machine, QA has test
  benches + checklist whiteboard.

## Files modified (v0.3)
- `src/components/FurnitureLayer.tsx` (composite desks, new types, subtle walls)
- `src/lib/officeLayout.ts` (3-tier walls, minimal partitions)
- `src/data/furniture.ts` (zone desk types, new pieces)
- `src/data/officeZones.ts` (desaturated colors)
- `src/types.ts` (new furniture types)

## Validation (v0.3)
- `npx tsc --noEmit` ✅ 0 errors
- `npm run build` ✅ (CSS 13.5 KB / JS 200 KB gz 62 KB)
- 21 unique agents, 0 duplicates ✅ (no regression)
- 68 furniture pieces

## v0.4 candidates
- True iso depth-sort (walls/agents/furniture by height) instead of z-bands.
- Replace CSS furniture shapes with real isometric sprite assets.
- Zoom/pan controls; perimeter wall still slightly visible — could be a faint
  floor-edge highlight instead of a raised slab.
- Seated agent poses (z-index behind the desk front edge) for stronger
  "working at desk" reading.

---

# v0.4 — Floorplan Realism + Furniture Replacement

Goal: kill the "isometric map with blocks" feel; make it read as a real office.

## What changed (v0.4)

### Eliminated the big placeholder blocks (the #1 complaint)
- **Root cause found & fixed**: the Research Library `bookshelf` was laid out
  as a span-5 piece, which the (tall, narrow) bookshelf Shape scaled into a
  giant brown wall hiding half the floor. Replaced with proper 1-cell-wide
  bookshelf UNITS arranged as a row. This was the single biggest "brown box".
- **Composite conference tables**: `meeting-table` no longer renders as a
  solid brown rectangle. It now renders as a wood-grain tabletop with a
  lighter inlay + 4 chairs arranged around the perimeter. Meeting rooms now
  read as meeting rooms.

### Floor / zones
- Zone floor overlays dropped to ~40% opacity (was solid). Zones are now
  distinguished by FURNITURE, not by paint — much less "board of colored
  regions".

### Density
- Open Workspace expanded to **6 desks in 2 aligned rows** (was 4), so it
  clearly reads as "where the team works".
- Command Center: dense wall of 8 glowing screens + console table + rug +
  server rack + floor lamp — now a wow-zone.
- Rugs added under the Strategy, War Room, and Command Center tables.

## Files modified (v0.4)
- `src/components/FurnitureLayer.tsx` (composite meeting-table renderer)
- `src/components/OfficeFloor.tsx` (zone overlay opacity)
- `src/lib/officeLayout.ts` (6 open-workspace desks)
- `src/data/furniture.ts` (bookshelf units, rugs, console layouts)

## Validation (v0.4)
- `npx tsc --noEmit` ✅ 0 errors
- `npm run build` ✅ (CSS 13.5 KB / JS 201 KB gz 62 KB)
- 21 unique agents, 0 duplicates ✅ (no regression)
- 69 furniture pieces

## v0.5 candidates
- Real isometric furniture sprites (the next realism leap beyond CSS shapes).
- True height-based depth sort (walls/agents/furniture).
- Seated agent z-index so sprites sit visually behind desk front-edges.
- Lobby seats, side-tables, divider panels as distinct rendered units.
