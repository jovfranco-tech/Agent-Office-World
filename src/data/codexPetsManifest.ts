/**
 * Codex Pets manifest — v0.2: ONE unique pet per agent (no sprite sharing).
 *
 * There are 21 distinct agents. Each maps to a unique Codex Pet slug. No two
 * agents share a sprite. This is enforced by `detectDuplicatePets()` below,
 * which the app calls at startup to guarantee uniqueness.
 *
 * Pets are sourced from Petdex (https://petdex.dev). See
 * docs/codex-pets-usage.md for licensing caveats.
 */
import type { AgentRole } from "../types";
import { isPetAvailable } from "../lib/codexPetSprites";

export interface AgentPetMapping {
  /** Stable agent id (matches the agent in agents.ts). */
  agentId: string;
  /** Display name of the agent (for docs). */
  agentName: string;
  role: AgentRole;
  /** UNIQUE Codex Pet slug for this specific agent. */
  petSlug: string;
  /** Human-readable pet name. */
  petName: string;
  /** Why this pet fits this agent (documented in inspector). */
  rationale: string;
  /** Accent color for badges / rings / labels. */
  accent: string;
  emoji: string;
  /**
   * Optional visual variation applied on top of the base sprite so two agents
   * are NEVER identical even if their species reads similar. Variations tint
   * the sprite + add a distinct status ring / accessory.
   */
  variant?: {
    /** Hue-rotate (deg) applied to the sprite for strong differentiation. */
    hue: number;
    /** Brightness multiplier (1 = none). */
    brightness?: number;
    /** Saturate multiplier (1 = none). */
    saturate?: number;
    /** A small accessory glyph drawn beside the pet. */
    accessory?: string;
  };
  /** Size scale of this agent's sprite relative to default (1 = default). */
  scale?: number;
}

/**
 * The full mapping: 21 agents, 21 distinct pet slugs.
 *
 * Pet selection rationale: each agent gets a pet whose look/feel matches its
 * role personality, and no slug is reused.
 */
export const AGENT_PET_MAPPING: AgentPetMapping[] = [
  // --- Leadership & strategy ---
  {
    agentId: "agent-ceo",
    agentName: "Sol",
    role: "CEO",
    petSlug: "ostrom",
    petName: "Ostrom",
    rationale: "Composed, leader-like presence for the executive.",
    accent: "#f59e0b",
    emoji: "👑",
    variant: { hue: 0, accessory: "👑" },
    scale: 1.08,
  },
  {
    agentId: "agent-strategy",
    agentName: "Dario",
    role: "Strategy",
    petSlug: "wukong-5",
    petName: "Wukong",
    rationale: "Strategic, cunning character for long-term planning.",
    accent: "#d97706",
    emoji: "♟️",
    variant: { hue: -8, accessory: "♟️" },
    scale: 1.04,
  },
  {
    agentId: "agent-pmo",
    agentName: "Hana",
    role: "PMO",
    petSlug: "maisenpai",
    petName: "Mai Senpai",
    rationale: "Organized coordinator who keeps delivery on track.",
    accent: "#a855f7",
    emoji: "📋",
    variant: { hue: 0, accessory: "📋" },
  },

  // --- Engineering ---
  {
    agentId: "agent-coding-1",
    agentName: "Nova",
    role: "Coding",
    petSlug: "boba",
    petName: "Boba",
    rationale: "Friendly otter — the quintessential builder companion.",
    accent: "#3b82f6",
    emoji: "💻",
    variant: { hue: 0, accessory: "💻" },
  },
  {
    agentId: "agent-coding-2",
    agentName: "Kai",
    role: "Coding",
    petSlug: "xiao-moli",
    petName: "Xiao Moli",
    rationale: "Second builder with a distinct, technical look.",
    accent: "#2563eb",
    emoji: "⌨️",
    variant: { hue: 12, accessory: "⌨️" },
  },
  {
    agentId: "agent-infra",
    agentName: "Kano",
    role: "Infra",
    petSlug: "astro-ops",
    petName: "Astro Ops",
    rationale: "Operational, systems-minded — runs the platform.",
    accent: "#64748b",
    emoji: "🏗️",
    variant: { hue: 0, accessory: "🔧" },
  },
  {
    agentId: "agent-automation",
    agentName: "Jin",
    role: "Automation",
    petSlug: "meridian",
    petName: "Meridian",
    rationale: "Automated, mechanical feel for the automation agent.",
    accent: "#0ea5e9",
    emoji: "🤖",
    variant: { hue: 0, accessory: "🤖" },
  },

  // --- Quality & risk ---
  {
    agentId: "agent-qa",
    agentName: "Mira",
    role: "QA",
    petSlug: "glitchcat",
    petName: "Glitchcat",
    rationale: "Alert, glitch-aware — built to catch defects.",
    accent: "#f97316",
    emoji: "🐞",
    variant: { hue: 0, accessory: "🔍" },
  },
  {
    agentId: "agent-security",
    agentName: "Sage",
    role: "Security",
    petSlug: "belayer-cat",
    petName: "Belayer Cat",
    rationale: "Watchful guardian that anchors and protects.",
    accent: "#ef4444",
    emoji: "🛡️",
    variant: { hue: 0, accessory: "🛡️" },
  },
  {
    agentId: "agent-risk",
    agentName: "Rhea",
    role: "Risk",
    petSlug: "artoria-saber",
    petName: "Artoria",
    rationale: "Disciplined, decisive presence for risk assessment.",
    accent: "#dc2626",
    emoji: "⚠️",
    variant: { hue: 0, accessory: "⚠️" },
  },

  // --- Research & data ---
  {
    agentId: "agent-research",
    agentName: "Elara",
    role: "Research",
    petSlug: "heimerdinger",
    petName: "Heimerdinger",
    rationale: "Curious, analytical scientist character.",
    accent: "#22d3ee",
    emoji: "🔬",
    variant: { hue: 0, accessory: "🔬" },
  },
  {
    agentId: "agent-data",
    agentName: "Theo",
    role: "Data",
    petSlug: "bytechomp-v2",
    petName: "Bytechomp",
    rationale: "Data-hungry creature for analytics & pipelines.",
    accent: "#2dd4bf",
    emoji: "📊",
    variant: { hue: 0, accessory: "📊" },
  },

  // --- Product & design ---
  {
    agentId: "agent-product",
    agentName: "Orion",
    role: "Product",
    petSlug: "marcille-dungeon-meshi",
    petName: "Marcille",
    rationale: "Thoughtful character for product craft.",
    accent: "#8b5cf6",
    emoji: "📦",
    variant: { hue: 0, accessory: "📐" },
  },
  {
    agentId: "agent-design",
    agentName: "Vega",
    role: "Design",
    petSlug: "chefito",
    petName: "Chefito",
    rationale: "Creative, craft-oriented character.",
    accent: "#eab308",
    emoji: "🎨",
    variant: { hue: 0, accessory: "🎨" },
  },

  // --- Commercial & client ---
  {
    agentId: "agent-sales",
    agentName: "Pax",
    role: "Sales",
    petSlug: "dylan-harper",
    petName: "Dylan Harper",
    rationale: "Energetic, personable — drives commercial momentum.",
    accent: "#ec4899",
    emoji: "📈",
    variant: { hue: 0, accessory: "📈" },
  },
  {
    agentId: "agent-support",
    agentName: "Iris",
    role: "Support",
    petSlug: "tabby",
    petName: "Tabby",
    rationale: "Warm, approachable cat for customer support.",
    accent: "#14b8a6",
    emoji: "🎧",
    variant: { hue: 0, accessory: "🎧" },
  },
  {
    agentId: "agent-cs",
    agentName: "Lior",
    role: "Customer Success",
    petSlug: "lulu-capybara-2",
    petName: "Lulu",
    rationale: "Friendly, social character for success management.",
    accent: "#10b981",
    emoji: "🤝",
    variant: { hue: 0, accessory: "🤝" },
  },

  // --- Operations & finance ---
  {
    agentId: "agent-ops",
    agentName: "Atlas",
    role: "Ops",
    petSlug: "pelican-pedal",
    petName: "Pelican Pedal",
    rationale: "Steady, multitasking character keeping things moving.",
    accent: "#38bdf8",
    emoji: "⚙️",
    variant: { hue: 0, accessory: "⚙️" },
  },
  {
    agentId: "agent-finance",
    agentName: "Nadia",
    role: "Finance",
    petSlug: "guan-miao",
    petName: "Guan Miao",
    rationale: "Serene, serious character for financial stewardship.",
    accent: "#84cc16",
    emoji: "💰",
    variant: { hue: 0, accessory: "💰" },
  },

  // --- Compliance & docs ---
  {
    agentId: "agent-legal",
    agentName: "Cyrus",
    role: "Legal/Compliance",
    petSlug: "humboldt",
    petName: "Humboldt",
    rationale: "Formal, measured presence for compliance.",
    accent: "#94a3b8",
    emoji: "⚖️",
    variant: { hue: 0, accessory: "⚖️" },
  },
  {
    agentId: "agent-docs",
    agentName: "Wren",
    role: "Documentation",
    petSlug: "paperclip",
    petName: "Paperclip",
    rationale: "Stationery character — fitting for docs & writing.",
    accent: "#cad2dc",
    emoji: "📝",
    variant: { hue: 0, accessory: "📝" },
  },
];

const MAPPING_BY_AGENT_ID = new Map(
  AGENT_PET_MAPPING.map((m) => [m.agentId, m])
);

/** Get the pet mapping for a specific agent id. */
export function getAgentPet(agentId: string): AgentPetMapping | undefined {
  return MAPPING_BY_AGENT_ID.get(agentId);
}

/** Accent color for an agent id. */
export function accentForAgent(agentId: string): string {
  return MAPPING_BY_AGENT_ID.get(agentId)?.accent ?? "#3b82f6";
}

// ----------------------------------------------------------------------------
// Legacy role-based API (kept for components that filter/group by role).
// Returns the FIRST agent mapping for a role — used only for legend color keys.
// ----------------------------------------------------------------------------
const FIRST_BY_ROLE = new Map<string, AgentPetMapping>();
for (const m of AGENT_PET_MAPPING) {
  if (!FIRST_BY_ROLE.has(m.role)) FIRST_BY_ROLE.set(m.role, m);
}

export function accentFor(role: AgentRole): string {
  return FIRST_BY_ROLE.get(role)?.accent ?? "#3b82f6";
}

export function petSlugFor(role: AgentRole): string {
  return FIRST_BY_ROLE.get(role)?.petSlug ?? "boba";
}

// ----------------------------------------------------------------------------
// Duplicate detection — enforces the "no repeated sprites" guarantee.
// ----------------------------------------------------------------------------

export interface DuplicateReport {
  /** true if every agent has a distinct pet slug. */
  allUnique: boolean;
  /** Slugs that are assigned to more than one agent (should be empty). */
  duplicateSlugs: string[];
  /** Mappings whose pet is NOT available locally. */
  missingPets: AgentPetMapping[];
}

export function detectDuplicatePets(): DuplicateReport {
  const counts = new Map<string, AgentPetMapping[]>();
  for (const m of AGENT_PET_MAPPING) {
    const list = counts.get(m.petSlug) ?? [];
    list.push(m);
    counts.set(m.petSlug, list);
  }
  const duplicateSlugs: string[] = [];
  for (const [slug, list] of counts) {
    if (list.length > 1) duplicateSlugs.push(slug);
  }
  const missingPets = AGENT_PET_MAPPING.filter((m) => !isPetAvailable(m.petSlug));
  return {
    allUnique: duplicateSlugs.length === 0,
    duplicateSlugs,
    missingPets,
  };
}

/** Role filters used by the ControlBar role filter dropdown (unique roles). */
export const ROLE_FILTERS: {
  role: AgentRole;
  petSlug: string;
  accent: string;
  emoji: string;
}[] = Array.from(FIRST_BY_ROLE.values()).map((m) => ({
  role: m.role,
  petSlug: m.petSlug,
  accent: m.accent,
  emoji: m.emoji,
}));

/** Audit helper for the final validation report. */
export function auditPetAvailability(): {
  agentId: string;
  petSlug: string;
  available: boolean;
}[] {
  return AGENT_PET_MAPPING.map((m) => ({
    agentId: m.agentId,
    petSlug: m.petSlug,
    available: isPetAvailable(m.petSlug),
  }));
}
