"use client";

import { useState, useEffect } from "react";

interface LiveClockProps {
  hebrewDate: string;
  dayType: string;
}

export default function LiveClock({ hebrewDate, dayType }: LiveClockProps) {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const n = new Date();
      const h = n.getHours();
      const m = n.getMinutes().toString().padStart(2, "0");
      const s = n.getSeconds().toString().padStart(2, "0");
      const p = h >= 12 ? "pm" : "am";
      const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
      setTime(`${d}:${m}:${s} ${p}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
      <div style={{ color: "#9a8a5a", fontSize: 13, fontWeight: 500 }}>
        {hebrewDate}
      </div>

      <div
        dir="ltr"
        style={{
          color: "#f0dfa0",
          fontSize: "clamp(30px, 3.6vw, 52px)",
          fontWeight: 900,
          letterSpacing: "1px",
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 0 10px rgba(240,223,160,0.35)",
          lineHeight: 1.1,
          margin: "2px 0",
          minHeight: "1.1em",
        }}
      >
        {mounted ? time : "\u00A0"}
      </div>

      <div style={{
        background: "linear-gradient(180deg, #c9a84c 0%, #7a6520 100%)",
        color: "#080818",
        fontSize: 12,
        fontWeight: 700,
        padding: "2px 16px",
        borderRadius: 1,
      }}>
        {dayType}
      </div>
    </div>
  );
}
