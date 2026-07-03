/**
 * Codex Pets manifest — maps each agent role to a pet sprite.
 *
 * We have 14 distinct pets fetched locally (see public/sprites/codex-pets/).
 * There are 20 roles, so some pets are reused across related roles. Each role
 * carries its own accent color + emoji so agents are always visually
 * distinguishable even when they share a pet (per spec: differentiate via
 * badge, label, status ring, zone, etc.).
 */
import type { AgentRole, RoleFilter } from "../types";
import { isPetAvailable } from "../lib/codexPetSprites";

export interface RolePetMapping {
  role: AgentRole;
  /** Codex Pet slug used to render agents of this role. */
  petSlug: string;
  /** Human-readable pet name (for docs / inspector). */
  petName: string;
  /** Why this pet fits the role (documented in inspector). */
  rationale: string;
  accent: string;
  emoji: string;
}

export const ROLE_PET_MAPPING: RolePetMapping[] = [
  {
    role: "CEO",
    petSlug: "ostrom",
    petName: "Ostrom",
    rationale: "Leader-like, composed presence for the executive role.",
    accent: "#f59e0b",
    emoji: "👑",
  },
  {
    role: "PMO",
    petSlug: "maisenpai",
    petName: "Mai Senpai",
    rationale: "Organized coordinator vibe.",
    accent: "#a855f7",
    emoji: "📋",
  },
  {
    role: "Research",
    petSlug: "heimerdinger",
    petName: "Heimerdinger",
    rationale: "Curious, analytical scientist character.",
    accent: "#22d3ee",
    emoji: "🔬",
  },
  {
    role: "Coding",
    petSlug: "boba",
    petName: "Boba",
    rationale: "Friendly otter — the quintessential builder companion.",
    accent: "#3b82f6",
    emoji: "💻",
  },
  {
    role: "QA",
    petSlug: "glitchcat",
    petName: "Glitchcat",
    rationale: "Alert, glitch-aware — perfect for catching defects.",
    accent: "#f97316",
    emoji: "🐞",
  },
  {
    role: "Security",
    petSlug: "belayer-cat",
    petName: "Belayer Cat",
    rationale: "Guardian, watchful — keeps things anchored and safe.",
    accent: "#ef4444",
    emoji: "🛡️",
  },
  {
    role: "Finance",
    petSlug: "guan-miao",
    petName: "Guan Miao",
    rationale: "Serene, serious character for financial stewardship.",
    accent: "#84cc16",
    emoji: "💰",
  },
  {
    role: "Sales",
    petSlug: "dylan-harper",
    petName: "Dylan Harper",
    rationale: "Energetic, personable — drives commercial momentum.",
    accent: "#ec4899",
    emoji: "📈",
  },
  {
    role: "Support",
    petSlug: "tabby",
    petName: "Tabby",
    rationale: "Warm, approachable cat for customer support.",
    accent: "#14b8a6",
    emoji: "🎧",
  },
  {
    role: "Design",
    petSlug: "chefito",
    petName: "Chefito",
    rationale: "Creative, craft-oriented character.",
    accent: "#eab308",
    emoji: "🎨",
  },
  {
    role: "Ops",
    petSlug: "astro-ops",
    petName: "Astro Ops",
    rationale: "Operational, multitasking — keeps the engine running.",
    accent: "#38bdf8",
    emoji: "⚙️",
  },
  {
    role: "Legal/Compliance",
    petSlug: "humboldt",
    petName: "Humboldt",
    rationale: "Formal, measured presence for compliance.",
    accent: "#94a3b8",
    emoji: "⚖️",
  },
  {
    role: "Data",
    petSlug: "bytechomp-v2",
    petName: "Bytechomp",
    rationale: "Data-hungry creature for analytics & pipelines.",
    accent: "#2dd4bf",
    emoji: "📊",
  },
  {
    role: "Infra",
    petSlug: "astro-ops",
    petName: "Astro Ops",
    rationale: "Same operational sprite — infra shares the ops persona.",
    accent: "#64748b",
    emoji: "🏗️",
  },
  {
    role: "Product",
    petSlug: "boba",
    petName: "Boba",
    rationale: "Reuses the builder sprite; product works beside engineering.",
    accent: "#8b5cf6",
    emoji: "📦",
  },
  {
    role: "Customer Success",
    petSlug: "tabby",
    petName: "Tabby",
    rationale: "Reuses the warm support sprite for success management.",
    accent: "#10b981",
    emoji: "🤝",
  },
  {
    role: "Automation",
    petSlug: "glitchcat",
    petName: "Glitchcat",
    rationale: "Reuses the alert sprite — automation watches for friction.",
    accent: "#0ea5e9",
    emoji: "🤖",
  },
  {
    role: "Risk",
    petSlug: "belayer-cat",
    petName: "Belayer Cat",
    rationale: "Reuses the guardian sprite — risk is a watchman role.",
    accent: "#dc2626",
    emoji: "⚠️",
  },
  {
    role: "Documentation",
    petSlug: "paperclip",
    petName: "Paperclip",
    rationale: "Stationery character — fitting for docs & writing.",
    accent: "#cad2dc",
    emoji: "📝",
  },
  {
    role: "Strategy",
    petSlug: "ostrom",
    petName: "Ostrom",
    rationale: "Reuses the leader sprite — strategy is an executive function.",
    accent: "#d97706",
    emoji: "♟️",
  },
];

const MAPPING_BY_ROLE = new Map<AgentRole, RolePetMapping>(
  ROLE_PET_MAPPING.map((m) => [m.role, m])
);

export function getRoleMapping(role: AgentRole): RolePetMapping {
  return (
    MAPPING_BY_ROLE.get(role) ?? {
      role,
      petSlug: "boba",
      petName: "Boba",
      rationale: "Default fallback pet.",
      accent: "#3b82f6",
      emoji: "•",
    }
  );
}

export function petSlugFor(role: AgentRole): string {
  return getRoleMapping(role).petSlug;
}

export function accentFor(role: AgentRole): string {
  return getRoleMapping(role).accent;
}

/** Role filters used by the ControlBar role filter dropdown. */
export const ROLE_FILTERS: RoleFilter[] = ROLE_PET_MAPPING.map((m) => ({
  role: m.role,
  petSlug: m.petSlug,
  accent: m.accent,
  emoji: m.emoji,
}));

/**
 * Audit helper: which mapped pets are actually present locally?
 * Used for the final validation report.
 */
export function auditPetAvailability(): {
  role: AgentRole;
  petSlug: string;
  available: boolean;
}[] {
  return ROLE_PET_MAPPING.map((m) => ({
    role: m.role,
    petSlug: m.petSlug,
    available: isPetAvailable(m.petSlug),
  }));
}
