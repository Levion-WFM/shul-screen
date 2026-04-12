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
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#7a6a3a", fontSize: 11 }}>{hebrewDate}</span>

      <span
        dir="ltr"
        style={{
          color: "#f0dfa0",
          fontSize: 28,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 0 8px rgba(240,223,160,0.3)",
          lineHeight: 1,
          minWidth: "6ch",
        }}
      >
        {mounted ? time : "\u00A0"}
      </span>

      <span style={{
        background: "linear-gradient(180deg, #c9a84c 0%, #7a6520 100%)",
        color: "#080818",
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 10px",
        borderRadius: 1,
      }}>
        {dayType}
      </span>
    </div>
  );
}
