/**
 * fetch-codex-pets.mjs
 *
 * Downloads real Codex Pets / Petdex sprites into the local project so the
 * office renders with real characters (no runtime external dependency).
 *
 * Sprites come from the public Petdex CDN (Cloudflare R2):
 *   curated pets  -> https://assets.petdex.dev/curated/<slug>/spritesheet.webp
 *                 -> https://assets.petdex.dev/curated/<slug>/pet.json
 *   community pets-> <spritesheetUrl>/<petJsonUrl> from the manifest
 *
 * Output layout (matches what the app expects):
 *   public/sprites/codex-pets/<slug>/pet.json
 *   public/sprites/codex-pets/<slug>/spritesheet.webp
 *
 * Usage:
 *   node scripts/fetch-codex-pets.mjs            # fetch the default curated set
 *   node scripts/fetch-codex-pets.mjs boba tabby  # fetch specific slugs
 *
 * License reminder: pet assets are owned by their submitters. These are for
 * demo/local use only until per-pet commercial licensing is validated.
 * See docs/codex-pets-usage.md.
 */
import { mkdir, writeFile, rm, access, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public", "sprites", "codex-pets");

const CURATED_BASE = "https://assets.petdex.dev/curated";
const MANIFEST_URL = "https://assets.petdex.dev/manifests/petdex-v1.json";

/**
 * Default set: distinct, recognizable character/creature pets so each agent
 * role can be visually differentiated. These are curated pets, which use the
 * stable `spritesheet.webp` + `pet.json` URL convention.
 */
const DEFAULT_SLUGS = [
  "boba", // otter w/ bubble tea — Coding
  "tabby", // cat — Support
  "belayer-cat", // creature — Security
  "glitchcat", // creature — QA
  "heimerdinger", // scientist char — Research
  "astro-ops", // ops char — Ops
  "chefito", // chef char — Design
  "bytechomp-v2", // creature — Data
  "ostrom", // character — Strategy
  "humboldt", // character — Legal
  "paperclip", // object/char — Documentation
  "dylan-harper", // character — Sales
  "guan-miao", // creature — Finance
  "maisenpai", // character — PMO
];

// ---------------------------------------------------------------------------
async function fetchJson(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Try curated URLs first; fall back to the manifest (community) URLs. */
async function resolvePetUrls(slug, manifestMap) {
  // Curated path (preferred: stable naming)
  const curatedSheet = `${CURATED_BASE}/${slug}/spritesheet.webp`;
  const curatedJson = `${CURATED_BASE}/${slug}/pet.json`;
  try {
    const j = await fetchJson(curatedJson);
    if (j && j.id) {
      return { sheetUrl: curatedSheet, petJson: j, source: "curated" };
    }
  } catch {
    /* fall through to manifest */
  }

  // Manifest (community) path
  const entry = manifestMap.get(slug);
  if (entry) {
    const petJson = await fetchJson(entry.petJsonUrl);
    return { sheetUrl: entry.spritesheetUrl, petJson, source: "manifest" };
  }
  throw new Error(`Pet '${slug}' not found in curated set or manifest.`);
}

async function downloadOne(slug, manifestMap) {
  const petDir = resolve(OUT_DIR, slug);
  const sheetPath = resolve(petDir, "spritesheet.webp");
  const jsonPath = resolve(petDir, "pet.json");

  // Skip if already present (idempotent)
  if ((await fileExists(sheetPath)) && (await fileExists(jsonPath))) {
    console.log(`  ✓ ${slug} (already present)`);
    return { slug, ok: true, skipped: true };
  }

  const { sheetUrl, petJson, source } = await resolvePetUrls(slug, manifestMap);
  await mkdir(petDir, { recursive: true });

  const buf = await fetchBuffer(sheetUrl);
  await writeFile(sheetPath, buf);

  // Normalize pet.json so the app always knows the local spritesheet name.
  const normalized = {
    ...petJson,
    id: petJson.id || slug,
    displayName: petJson.displayName || slug,
    spritesheetPath: "spritesheet.webp",
    source: `petdex (${source})`,
    originUrl: sheetUrl,
  };
  await writeFile(jsonPath, JSON.stringify(normalized, null, 2));

  const kb = Math.round(buf.length / 1024);
  console.log(`  ✓ ${slug} (${source}, ${kb} KB)`);
  return { slug, ok: true, kb };
}

async function main() {
  const slugs =
    process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_SLUGS;

  console.log(`Codex Pets fetcher`);
  console.log(`  output: ${OUT_DIR}`);
  console.log(`  target slugs (${slugs.length}): ${slugs.join(", ")}`);

  // Build a manifest map (slug -> entry) for fallback lookups.
  console.log(`  loading manifest...`);
  const manifestMap = new Map();
  try {
    const manifest = await fetchJson(MANIFEST_URL);
    for (const p of manifest.pets || []) {
      manifestMap.set(p.slug, p);
    }
    console.log(`  manifest loaded (${manifest.total} pets known).`);
  } catch (e) {
    console.warn(`  ! manifest unavailable (${e.message}); curated-only mode.`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const results = [];
  for (const slug of slugs) {
    try {
      results.push(await downloadOne(slug, manifestMap));
    } catch (e) {
      console.error(`  ✗ ${slug}: ${e.message}`);
      results.push({ slug, ok: false, error: e.message });
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);

  // Write a complete index by scanning the output directory, so the index
  // always reflects EVERY pet on disk (not just this run's results). This is
  // what the app imports to know which sprites are available.
  const dirs = (await readdir(OUT_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const index = {
    generatedAt: new Date().toISOString(),
    source: "petdex (https://petdex.dev)",
    licenseNote:
      "Pet assets are owned by their submitters. Demo/local use only until per-pet commercial licensing is validated.",
    pets: dirs.map((slug) => ({ slug })),
  };
  await writeFile(resolve(OUT_DIR, "index.json"), JSON.stringify(index, null, 2));

  console.log(`\nDone: ${ok}/${results.length} pets ready.`);
  if (fail.length) {
    console.log(`Failed: ${fail.map((f) => f.slug).join(", ")}`);
    process.exitCode = 1;
  }
}

// Allow `--clean` to wipe the output dir first.
if (process.argv.includes("--clean")) {
  rm(OUT_DIR, { recursive: true, force: true }).then(main);
} else if (existsSync(OUT_DIR) === false) {
  main();
} else {
  main();
}
