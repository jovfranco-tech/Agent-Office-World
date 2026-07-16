import { useState, useEffect } from "react";

const FRAMES: Record<string, number> = { idle: 6, walk: 8 };

export default function ComposeTest() {
  const [frame, setFrame] = useState(1);
  const [anim, setAnim] = useState<"idle" | "walk">("idle");

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f % FRAMES[anim]) + 1);
    }, 120);
    return () => clearInterval(interval);
  }, [anim]);

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "radial-gradient(ellipse at 55% 35%, #ece5d8 0%, #ddd5c6 25%, #ccc3b2 55%, #b5ac9a 85%, #a39a88 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 40, padding: 40, fontFamily: "system-ui",
    }}>
      <div style={{ display: "flex", gap: 30, alignItems: "flex-end" }}>
        <img src="/sprites/office/desk_NE.png" style={{ height: 160, imageRendering: "auto" as const, filter: "drop-shadow(0 3px 5px rgba(50,38,18,0.28)) brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)" }} />
        <img src="/sprites/office/chairDesk_NE.png" style={{ height: 130, imageRendering: "auto" as const, filter: "drop-shadow(0 3px 5px rgba(50,38,18,0.28)) brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)" }} />
        <img src={`/sprites/agents3d/ceo_${anim}_${String(frame).padStart(2, "0")}.png`} style={{ height: 160, imageRendering: "auto" as const }} />
        <img src="/sprites/office/pottedPlant_NE.png" style={{ height: 110, imageRendering: "auto" as const, filter: "drop-shadow(0 3px 5px rgba(50,38,18,0.28)) brightness(1.05) contrast(1.06) sepia(0.04) saturate(0.96)" }} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={() => setAnim("idle")} style={{ padding: "8px 16px", background: anim === "idle" ? "#3b82f6" : "#fff", color: anim === "idle" ? "#fff" : "#000", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }}>Idle</button>
        <button onClick={() => setAnim("walk")} style={{ padding: "8px 16px", background: anim === "walk" ? "#3b82f6" : "#fff", color: anim === "walk" ? "#fff" : "#000", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }}>Walk</button>
      </div>
      <p style={{ color: "#666", fontSize: 14 }}>desk · chair · 3D character · plant</p>
    </div>
  );
}
