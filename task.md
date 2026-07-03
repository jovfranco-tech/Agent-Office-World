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
