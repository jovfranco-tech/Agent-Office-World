/**
 * Agent Office World — application root.
 *
 * Wires together the simulation state, Live Mode interval, the office view,
 * the control bar, the side panel (legend + event timeline) and the
 * agent/zone inspectors.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Agent, AgentRole, AgentState, OfficeZone } from "./types";
import OfficeSceneV2 from "./components/OfficeSceneV2";
import ComposeTest from "./components/ComposeTest";
import ControlBar from "./components/ControlBar";
import OfficeLegend from "./components/OfficeLegend";
import EventTimeline from "./components/EventTimeline";
import AgentInspector from "./components/AgentInspector";
import ZoneInspector from "./components/ZoneInspector";
import AgentChat from "./components/AgentChat";
import {
  initialSnapshot,
  simulateHour,
  tick,
  type SimulationSnapshot,
} from "./lib/simulation";
import { getZone } from "./data/officeZones";
import { EVENT_TEMPLATES } from "./data/events";
import { INITIAL_AGENTS } from "./data/agents";
import { scheduleActivities } from "./lib/agentMovement";
import { generateChatter } from "./data/agentPersonalities";

let idc = 0;
function eid(): string {
  idc += 1;
  return `seed-${Date.now()}-${idc}`;
}
function nowStr(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function roleOf(agentId: string): Agent["role"] {
  return (
    INITIAL_AGENTS.find((a) => a.id === agentId)?.role ?? "Coding"
  );
}
function zoneName(zoneId: string): string {
  return getZone(zoneId)?.name ?? zoneId;
}

/** Build the very first snapshot, including seed events. */
function makeInitialSnapshot(): SimulationSnapshot {
  const snap = initialSnapshot();
  const seedRoles = ["Research", "QA", "Security", "Coding", "PMO"];
  const events = seedRoles
    .map((role) => {
      const agent = INITIAL_AGENTS.find((a) => a.role === role);
      if (!agent) return null;
      const tpl = EVENT_TEMPLATES.find((t) => t.role === role);
      if (!tpl) return null;
      return {
        id: eid(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        message: tpl.message,
        kind: tpl.kind,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  return { ...snap, events };
}

export default function App() {
  const [snap, setSnap] = useState<SimulationSnapshot>(() => makeInitialSnapshot());
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<AgentRole | null>(null);
  const [stateFilter, setStateFilter] = useState<AgentState | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showcase, setShowcase] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  // ?autoplay=1 starts Live Mode on load (also useful for headless verification).
  const [liveMode, setLiveMode] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("autoplay") === "1";
    } catch {
      return false;
    }
  });
  const [hour, setHour] = useState(9);
  const [panelOpen, setPanelOpen] = useState(true);
  const liveRef = useRef<number | null>(null);

  const agents = snap.agents;
  const events = snap.events;
  // In Showcase Mode: labels are hidden and sidebar collapses for a cleaner view.
  const effectiveShowLabels = showLabels && !showcase;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const selectedZone = selectedZoneId ? getZone(selectedZoneId) ?? null : null;
  const chatAgent = agents.find((a) => a.id === chatAgentId) ?? null;

  // ---- Live Mode: advance the simulation on an interval -------------------
  useEffect(() => {
    if (!liveMode) {
      if (liveRef.current !== null) {
        window.clearInterval(liveRef.current);
        liveRef.current = null;
      }
      return;
    }
    liveRef.current = window.setInterval(() => {
      setSnap((prev) => {
        // 1) Advance the business simulation (state/task/energy/events).
        let next = tick(prev, 2);
        // 2) Move ~28% of agents to role-logical anchors (visible motion).
        const moved = scheduleActivities(next.agents, 0.28);
        // 3) Emit movement events into the timeline so it reflects real motion.
        const moveEvents = moved.map((m) => ({
          id: eid(),
          time: nowStr(),
          agentId: m.agentId,
          agentName: m.agentName,
          role: roleOf(m.agentId),
          message: `walked to ${zoneName(m.toZone)}.`,
          kind: "info" as const,
        }));
        // 4) Autonomous chatter: 1-2 agents "say" something in-character.
        const chatterAgents = [...next.agents]
          .sort(() => Math.random() - 0.5)
          .slice(0, 1 + Math.floor(Math.random() * 2));
        const chatterEvents = chatterAgents.map((a) => ({
          id: eid(),
          time: nowStr(),
          agentId: a.id,
          agentName: a.name,
          role: a.role,
          message: generateChatter(a.id, a.state),
          kind: "info" as const,
        }));
        next = {
          ...next,
          events: [...moveEvents, ...chatterEvents, ...next.events].slice(0, 40),
        };
        return next;
      });
    }, 2200);
    return () => {
      if (liveRef.current !== null) {
        window.clearInterval(liveRef.current);
        liveRef.current = null;
      }
    };
  }, [liveMode]);

  const handleSimulateHour = useCallback(() => {
    setSnap((prev) => {
      let next = simulateHour(prev);
      // A burst of movement so "Simulate 1 Hour" produces visible change.
      const moved = scheduleActivities(next.agents, 0.5);
      if (moved.length) {
        const moveEvents = moved.map((m) => ({
          id: eid(),
          time: nowStr(),
          agentId: m.agentId,
          agentName: m.agentName,
          role: roleOf(m.agentId),
          message: `moved to ${zoneName(m.toZone)}.`,
          kind: "info" as const,
        }));
        next = { ...next, events: [...moveEvents, ...next.events].slice(0, 40) };
      }
      return next;
    });
    setHour((h) => (h >= 23 ? 0 : h + 1));
  }, []);

  const handleResetDay = useCallback(() => {
    setSnap(makeInitialSnapshot());
    setHour(9);
    setSelectedAgentId(null);
    setSelectedZoneId(null);
    setRoleFilter(null);
    setStateFilter(null);
  }, []);

  const handleSelectAgent = useCallback((a: Agent) => {
    setSelectedAgentId(a.id);
    setSelectedZoneId(null);
  }, []);

  const handleSelectZone = useCallback((z: OfficeZone | null) => {
    setSelectedZoneId(z?.id ?? null);
    if (z) setSelectedAgentId(null);
  }, []);

  // Temporary: ?compose=1 shows the character/furniture style-match test page
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("compose") === "1") {
    return <ComposeTest />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <ControlBar
        liveMode={liveMode}
        onSimulateHour={handleSimulateHour}
        onToggleLive={() => setLiveMode((v) => !v)}
        onResetDay={handleResetDay}
        roleFilter={roleFilter}
        stateFilter={stateFilter}
        onRoleFilter={setRoleFilter}
        onStateFilter={setStateFilter}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        showcase={showcase}
        onToggleShowcase={() => setShowcase((v) => !v)}
        hour={hour}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* The office dominates the screen */}
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <OfficeSceneV2
            agents={agents}
            selectedAgentId={selectedAgentId}
            selectedZoneId={selectedZoneId}
            roleFilter={roleFilter}
            stateFilter={stateFilter}
            showLabels={effectiveShowLabels}
            showcase={showcase}
            onSelectAgent={handleSelectAgent}
            onSelectZone={handleSelectZone}
          />

          {/* Inspector overlays (agent takes priority over zone) */}
          {selectedAgent ? (
            <AgentInspector
              agent={selectedAgent}
              onClose={() => setSelectedAgentId(null)}
              onChat={() => setChatAgentId(selectedAgent.id)}
            />
          ) : selectedZone ? (
            <ZoneInspector
              zone={selectedZone}
              agents={agents}
              onSelectAgent={handleSelectAgent}
              onClose={() => setSelectedZoneId(null)}
            />
          ) : null}

          {/* Agent chat panel */}
          {chatAgent && (
            <AgentChat
              agent={chatAgent}
              onClose={() => setChatAgentId(null)}
            />
          )}

          {/* Mobile panel toggle */}
          <button
            className="btn"
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              zIndex: 50,
              display: panelOpen ? "none" : "inline-flex",
            }}
          >
            ☰ Panel
          </button>
        </div>

        {/* Discreet side panel (hidden in Showcase Mode) */}
        {panelOpen && !showcase && (
          <aside
            className="scroll-thin"
            style={{
              width: 280,
              flexShrink: 0,
              background: "linear-gradient(180deg, rgba(18,22,34,0.95), rgba(14,18,28,0.92))",
              borderLeft: "1px solid rgba(96,165,250,0.15)",
              backdropFilter: "blur(12px)",
              padding: 14,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Office
              </span>
              <button className="btn btn-ghost" style={{ padding: "2px 8px" }} onClick={() => setPanelOpen(false)} aria-label="Hide panel">
                ✕
              </button>
            </div>
            <OfficeLegend agents={agents} onSelectZone={(zid) => handleSelectZone(getZone(zid) ?? null)} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Recent Activity
              </div>
              <EventTimeline events={events} />
            </div>
            <div style={{ marginTop: "auto", fontSize: 9.5, color: "var(--text-muted)", lineHeight: 1.5, borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
              Sprites: Codex Pets / Petdex · demo use only.
              <br />
              Validate per-pet licensing before commercial use.
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
