# Agent Office World

A visual, **isometric office simulation** where AI agents work, walk, meet,
review boards and collaborate. Each agent is rendered as an animated
**[Codex Pets / Petdex](https://petdex.dev)** sprite, grounded in a continuous
office floor with desks, monitors, meeting tables, plants, a server rack and a
command-center wall of screens.

This is intentionally **not** a dashboard, node graph, mind map, org chart, or
set of isolated houses. It is a single, living open office.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

The repo already ships with real Codex Pets sprites in
`public/sprites/codex-pets/`, so the office renders with real characters on
first load — no extra steps required.

### Other commands

```bash
npm run build        # type-check + production build (outputs to dist/)
npm run typecheck    # tsc --noEmit
npm run fetch-pets   # re-fetch / add pets (see "Sprites" below)
```

---

## What you see

- A continuous isometric office floor (26×22 grid) with **12 zones**:
  Reception, Open Workspace, Engineering Pods, Strategy Room, War Room, QA Lab,
  Research Library, Finance Desk, Client Success, Break Area, Security Desk,
  and the Command Center Wall.
- **20 mock agents**, each with a name, role, state, zone, task, energy level,
  and an assigned Codex Pet sprite.
- Recognizable furniture: desks, monitors, whiteboards, plants, sofas, meeting
  tables, bookshelves, a server rack with blinking LEDs, and a wall of command
  screens.
- Agents sit at desks, gather in meeting rooms, and move around as the
  simulation runs.

### Roles & their pets

Each of the 20 roles is mapped to a Codex Pet in
`src/data/codexPetsManifest.ts`. Some pets are reused across related roles
(e.g. Infra shares the Ops sprite, Risk shares the Security sprite); agents are
always differentiated by a **role badge + accent color + status ring + assigned
zone**, so no two agents look truly identical in context.

| Role | Pet slug | Accent |
|---|---|---|
| CEO | `ostrom` | 👑 amber |
| PMO | `maisenpai` | 📋 purple |
| Research | `heimerdinger` | 🔬 cyan |
| Coding | `boba` | 💻 blue |
| QA | `glitchcat` | 🐞 orange |
| Security | `belayer-cat` | 🛡️ red |
| Finance | `guan-miao` | 💰 lime |
| Sales | `dylan-harper` | 📈 pink |
| Support | `tabby` | 🎧 teal |
| Design | `chefito` | 🎨 yellow |
| Ops | `astro-ops` | ⚙️ sky |
| Legal/Compliance | `humboldt` | ⚖️ slate |
| Data | `bytechomp-v2` | 📊 teal |
| Infra | `astro-ops` | 🏗️ slate |
| Product | `boba` | 📦 violet |
| Customer Success | `tabby` | 🤝 green |
| Automation | `glitchcat` | 🤖 sky |
| Risk | `belayer-cat` | ⚠️ red |
| Documentation | `paperclip` | 📝 light |
| Strategy | `ostrom` | ♟️ amber |

---

## How the simulation works

The simulation is a **pure local mock** (`src/lib/simulation.ts`) — no backend,
no LLM, no external API. It exposes three operations:

- **`tick(prev, intensity)`** — one small step: a few agents change state,
  change task, move within their zone, drift energy, and occasionally emit an
  event. Called every ~2.2s by **Live Mode**.
- **`simulateHour(prev)`** — a burst of 6 steps at once (the **Simulate 1
  Hour** button). Also advances the on-screen "day hour".
- **`resetDay()`** — restores the start-of-day agent roster.

Agents in `In Meeting` / `Collaborating` states are pulled toward the War Room,
Strategy Room, or Client Success area, and drift back to their home zone
afterward — so the office visibly breathes.

### State → animation mapping

Agent states map to Codex Pet animation rows (see
`src/lib/agentStateAnimation.ts`):

| Agent state | Animation |
|---|---|
| Focused | working (idle row) |
| Thinking | thinking (review row) |
| In Meeting | wave |
| Reviewing | review |
| Blocked | failed |
| Shipping | jump |
| Idle | idle |
| Escalating | failed |
| Learning | review |
| Collaborating | wave |

---

## How sprites are integrated

1. `scripts/fetch-codex-pets.mjs` downloads real Codex Pets from the public
   Petdex CDN into `public/sprites/codex-pets/<slug>/`. It writes a
   `pet.json` + `spritesheet.webp` per pet, plus an `index.json` manifest of
   what's available.
2. The Codex Pets spritesheet is a **fixed global atlas**: **8 columns × 9
   rows**, each frame **192 × 208 px** (full sheet 1536 × 1872). Each animation
   occupies one row. This contract lives in `src/lib/codexPetSprites.ts`.
3. `CodexPetSprite` (`src/components/CodexPetSprite.tsx`) renders the correct
   frame by computing a CSS `background-position` against the scaled
   `background-size`, advanced by `requestAnimationFrame` against each row's
   loop duration.
4. At build time, `index.json` is imported so the renderer knows which pets are
   present. If a pet is missing, it renders an explicit **"missing sprite"**
   marker — never a pretty fake.

> See `docs/codex-pets-usage.md` for how to add/remove/map pets and the
> licensing caveats.

---

## Architecture

```
src/
  main.tsx, App.tsx, styles.css, types.ts
  data/        agents.ts, officeZones.ts, furniture.ts, events.ts,
               codexPetsManifest.ts
  components/  OfficeWorld, OfficeFloor, AgentSprite, CodexPetSprite,
               ZoneLayer, FurnitureLayer, AgentInspector, ZoneInspector,
               EventTimeline, ControlBar, OfficeLegend
  lib/         simulation.ts, isometric.ts, codexPetSprites.ts,
               agentStateAnimation.ts
  types/       codexPet.ts
public/sprites/codex-pets/<slug>/{pet.json, spritesheet.webp}
scripts/fetch-codex-pets.mjs
```

### Isometric rendering

A classic 2:1 diamond projection (`src/lib/isometric.ts`):

```
screen.x = (gridX - gridY) * tileW/2
screen.y = (gridX + gridY) * tileH/2
```

Zones are rendered as colored diamonds via CSS `clip-path`. Furniture and
agents are absolutely positioned and **depth-sorted** by `z-index = gridX +
gridY` (painter's algorithm) so sprites never overlap incorrectly. The whole
scene auto-scales to fit the viewport (responsive down to mobile).

---

## License & attribution

- **Source code of this app**: see `LICENSE` (MIT).
- **Pet sprites**: owned by their respective submitters on Petdex. They are
  included here for **demo/local use only**. Validate each pet's license
  before any commercial use. See `docs/codex-pets-usage.md`.
