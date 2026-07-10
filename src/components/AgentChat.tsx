/**
 * AgentChat — chat panel for talking directly with an agent.
 *
 * Uses the mock response engine (generateResponse) which is ready to be
 * swapped for a real LLM. Each agent responds in-character based on their
 * personality, role, and current state.
 */
import { useEffect, useRef, useState } from "react";
import type { Agent } from "../types";
import { getPersonality, generateResponse } from "../data/agentPersonalities";
import { getAgentPet } from "../data/codexPetsManifest";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

interface Props {
  agent: Agent;
  onClose: () => void;
}

let msgId = 0;

export default function AgentChat({ agent, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const personality = getPersonality(agent.id);
  const mapping = getAgentPet(agent.id);
  const accent = mapping?.accent ?? "#3b82f6";

  // Greeting when opening chat
  useEffect(() => {
    setMessages([
      {
        id: `m-${msgId++}`,
        role: "agent",
        text: personality.greeting,
        time: nowStr(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `m-${msgId++}`,
      role: "user",
      text,
      time: nowStr(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate "thinking" delay (real LLM would take ~1-2s too)
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = generateResponse(
        agent.id,
        agent.role,
        agent.state,
        text
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${msgId++}`,
          role: "agent",
          text: response,
          time: nowStr(),
        },
      ]);
      setIsTyping(false);
    }, delay);
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        bottom: 12,
        width: 320,
        maxWidth: "calc(100vw - 24px)",
        background: "rgba(14,19,34,0.96)",
        border: "1px solid var(--border-soft)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        zIndex: 60,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderBottom: "1px solid var(--border-soft)",
          background: `linear-gradient(135deg, ${accent}18, transparent)`,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {personality.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {agent.name}
            <span style={{ fontSize: 11, color: accent, marginLeft: 6, fontWeight: 600 }}>
              {agent.role}
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {personality.tagline}
          </div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ padding: "2px 8px", fontSize: 14 }}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Personality tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "8px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {personality.traits.map((t) => (
          <span
            key={t}
            className="chip"
            style={{ fontSize: 9.5, padding: "2px 7px", borderColor: `${accent}44`, color: accent }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scroll-thin"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "8px 12px",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user" ? "#2563eb" : "rgba(255,255,255,0.06)",
                border: m.role === "user" ? "none" : `1px solid ${accent}33`,
                fontSize: 13,
                lineHeight: 1.45,
                color: "var(--text-primary)",
              }}
            >
              {m.text}
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 3,
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "14px 14px 14px 4px",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${accent}33`,
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accent,
                    opacity: 0.6,
                    animation: `typingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: 10,
          borderTop: "1px solid var(--border-soft)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Message ${agent.name}...`}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-soft)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
          autoFocus
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim()}
          style={{ padding: "8px 14px" }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function nowStr(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
