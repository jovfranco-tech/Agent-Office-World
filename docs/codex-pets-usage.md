# Codex Pets — usage & integration notes

This document explains how Codex Pets / Petdex sprites are used in Agent Office
World, how to add/change them, and the licensing caveats.

## Source

- Project: [Petdex](https://petdex.dev) · repo: `crafter-station/petdex`
- Manifest API: `https://assets.petdex.dev/manifests/petdex-v1.json`
- Curated pet assets:
  - `https://assets.petdex.dev/curated/<slug>/spritesheet.webp`
  - `https://assets.petdex.dev/curated/<slug>/pet.json`
- Community pet assets (from the manifest):
  - `<spritesheetUrl>` → `sprite.webp`
  - `<petJsonUrl>` → `petjson.json`

## Sprite format (fixed global atlas)

Every Codex Pets spritesheet shares the **same** grid:

- **8 columns × 9 rows**
- **192 × 208 px** per frame
- full sheet: **1536 × 1872 px**
- each animation occupies exactly **one row**; trailing cells in a row are blank

| Row | Animation id | Frames | Loop (ms) |
|---|---|---|---|
| 0 | `idle` | 6 | 1100 |
| 1 | `running-right` | 8 | 1060 |
| 2 | `running-left` | 8 | 1060 |
| 3 | `waving` | 4 | 700 |
| 4 | `jumping` | 5 | 840 |
| 5 | `failed` | 8 | 1220 |
| 6 | `waiting` | 6 | 1010 |
| 7 | `running` | 6 | 820 |
| 8 | `review` | 6 | 1030 |

The contract is baked into `src/lib/codexPetSprites.ts` (`DEFAULT_ATLAS`). A
pet's own `pet.json` may override `columns`/`rows`/`cellWidth`/`cellHeight`,
but in practice none of the live pets do.

---

## 1. How to add a new Codex Pet

### Automatically (recommended)

```bash
npm run fetch-pets <new-slug>
# e.g.
npm run fetch-pets maotuan
```

The script (`scripts/fetch-codex-pets.mjs`) tries the curated URL first, then
falls back to the manifest (community) URL. It writes:

```
public/sprites/codex-pets/<slug>/pet.json
public/sprites/codex-pets/<slug>/spritesheet.webp
```

and updates `public/sprites/codex-pets/index.json`.

Then **rebuild** so the new slug is picked up by the imported `index.json`:

```bash
npm run build      # or just restart `npm run dev`
```

### Manually

If the script can't reach the CDN (CORS, network, etc.):

1. Download the pet's spritesheet (e.g. from the Petdex gallery / GitHub).
2. Create the folder `public/sprites/codex-pets/<slug>/`.
3. Copy the spritesheet there as `spritesheet.webp` (or `.png`).
4. Create `pet.json`:
   ```json
   {
     "id": "<slug>",
     "displayName": "<Human Name>",
     "description": "...",
     "spritesheetPath": "spritesheet.webp"
   }
   ```
5. Add `{"slug": "<slug>"}` to the `pets` array in
   `public/sprites/codex-pets/index.json`.
6. Rebuild.

---

## 2. Where to copy `pet.json` and `spritesheet.webp`

```
public/sprites/codex-pets/<slug>/pet.json
public/sprites/codex-pets/<slug>/spritesheet.webp
```

The renderer resolves the spritesheet URL as
`/sprites/codex-pets/<slug>/spritesheet.webp`, so the filename **must** be
`spritesheet.webp` (or adjust `spritesheetPath` in `pet.json` and update the
renderer if you use a different extension).

---

## 3. How to map a pet to an agent role

Edit `src/data/codexPetsManifest.ts`. Each entry in `ROLE_PET_MAPPING` maps a
role to a pet:

```ts
{
  role: "Coding",
  petSlug: "boba",
  petName: "Boba",
  rationale: "Friendly otter — the builder companion.",
  accent: "#3b82f6",
  emoji: "💻",
}
```

- `petSlug` must match a folder under `public/sprites/codex-pets/`.
- `accent` is the role's color (badges, rings, labels).
- Multiple roles can share a pet — they're differentiated by accent + zone.

To assign a pet to a specific **agent** (rather than a whole role), set
`petSlug` directly on that agent in `src/data/agents.ts`.

---

## 4. How to change animations

The mapping from **agent state** → **animation alias** lives in
`src/lib/agentStateAnimation.ts`:

```ts
const STATE_TO_ANIM = {
  Focused: "working",
  Shipping: "jump",
  Blocked: "failed",
  // ...
};
```

Aliases (`idle`, `wave`, `run`, `failed`, `review`, `jump`, `thinking`,
`working`, `blocked`) map to canonical atlas rows in
`src/lib/codexPetSprites.ts` (`aliasToAnimation`).

To **override** the animation for a single agent, set its `animationOverride`
field (e.g. in `src/data/agents.ts`).

---

## 5. License risks ⚠️

- **Petdex source code**: MIT.
- **Pet assets**: owned by their **submitters**. Petdex holds no rights to the
  underlying IP and runs a takedown process. **There is no blanket commercial
  grant.**
- The pets included in this repo are for **demo/local use only**. Before any
  commercial use, you **must** check each pet's individual license and get
  permission from its author. Many pets are fan art of copyrighted characters.

Action: keep the demo local, or replace the pets with assets you have the
rights to, before shipping publicly/commercially.

---

## 6. Limitations if automatic download fails

If `npm run fetch-pets` can't download a pet:

- It prints `✗ <slug>: <reason>` and exits with code 1.
- The app still runs — any role mapped to that slug renders an explicit
  **"missing sprite"** marker (a dashed red box labeled `missing sprite`). It
  does **not** hide the problem behind a pretty placeholder.
- Resolution: add the pet manually (see §1) or remap the role to a pet you
  already have.

---

## 7. What to do if a sprite doesn't load

Symptoms & fixes:

- **All sprites show "missing sprite"**: `index.json` is missing or empty.
  Re-run `npm run fetch-pets` and rebuild.
- **One sprite shows "missing sprite"**: that slug isn't in `index.json` or its
  folder is incomplete. Add the pet (see §1) and rebuild.
- **Sprite box is blank / wrong frame**: the atlas is fixed (8×9, 192×208). If
  you're using a non-standard spritesheet, put `columns`, `rows`,
  `cellWidth`, `cellHeight` overrides in that pet's `pet.json`.
- **404 in the network tab**: the path must be exactly
  `/sprites/codex-pets/<slug>/spritesheet.webp`.
- **CORS errors at runtime**: you should never see these — sprites are served
  locally by Vite. If you do, you've pointed `spritesheetUrlFor()` at an
  external host; keep assets local.

---

## Origin of each bundled pet

Each `pet.json` records its `source` and `originUrl`. You can inspect them:

```bash
cat public/sprites/codex-pets/<slug>/pet.json
```
