/**
 * Agent Office World — application root.
 *
 * Wires together the simulation state, Live Mode interval, the office view,
 * the control bar, the side panel (legend + event timeline) and the
 * agent/zone inspectors.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Agent, AgentRole, AgentState, OfficeZone } from "./types";
import OfficeWorld from "./components/OfficeWorld";
import ControlBar from "./components/ControlBar";
import OfficeLegend from "./components/OfficeLegend";
import EventTimeline from "./components/EventTimeline";
import AgentInspector from "./components/AgentInspector";
import ZoneInspector from "./components/ZoneInspector";
import {
  initialSnapshot,
  simulateHour,
  tick,
  type SimulationSnapshot,
} from "./lib/simulation";
import { getZone } from "./data/officeZones";
import { EVENT_TEMPLATES } from "./data/events";
import { INITIAL_AGENTS } from "./data/agents";

let idc = 0;
function eid(): string {
  idc += 1;
  return `seed-${Date.now()}-${idc}`;
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
  const [liveMode, setLiveMode] = useState(false);
  const [hour, setHour] = useState(9);
  const [panelOpen, setPanelOpen] = useState(true);
  const liveRef = useRef<number | null>(null);

  const agents = snap.agents;
  const events = snap.events;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const selectedZone = selectedZoneId ? getZone(selectedZoneId) ?? null : null;

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
      setSnap((prev) => tick(prev, 2));
    }, 2200);
    return () => {
      if (liveRef.current !== null) {
        window.clearInterval(liveRef.current);
        liveRef.current = null;
      }
    };
  }, [liveMode]);

  const handleSimulateHour = useCallback(() => {
    setSnap((prev) => simulateHour(prev));
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
        hour={hour}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* The office dominates the screen */}
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <OfficeWorld
            agents={agents}
            selectedAgentId={selectedAgentId}
            selectedZoneId={selectedZoneId}
            roleFilter={roleFilter}
            stateFilter={stateFilter}
            showLabels={showLabels}
            onSelectAgent={handleSelectAgent}
            onSelectZone={handleSelectZone}
          />

          {/* Inspector overlays (agent takes priority over zone) */}
          {selectedAgent ? (
            <AgentInspector agent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
          ) : selectedZone ? (
            <ZoneInspector
              zone={selectedZone}
              agents={agents}
              onSelectAgent={handleSelectAgent}
              onClose={() => setSelectedZoneId(null)}
            />
          ) : null}

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

        {/* Discreet side panel */}
        {panelOpen && (
          <aside
            className="scroll-thin"
            style={{
              width: 280,
              flexShrink: 0,
              background: "rgba(10,14,26,0.6)",
              borderLeft: "1px solid var(--border-soft)",
              backdropFilter: "blur(8px)",
              padding: 12,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
