"use client";

import { useState, useEffect } from "react";

interface LiveClockProps {
  hebrewDate: string;
  dayType: string;
}

export default function LiveClock({ hebrewDate, dayType }: LiveClockProps) {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const period = hours >= 12 ? "pm" : "am";
      const display = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      setTime(`${display}:${minutes}:${seconds} ${period}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-1">
      {/* Hebrew date + holiday info */}
      <div className="text-sm font-medium" style={{ color: "#c9a84c" }}>
        {hebrewDate}
      </div>

      {/* Large clock display */}
      <div
        className="font-black tracking-wider my-1"
        style={{
          fontSize: "clamp(32px, 4vw, 56px)",
          color: "#f5e6a3",
          textShadow:
            "0 0 12px rgba(245, 230, 163, 0.5), 0 0 24px rgba(212, 175, 55, 0.3), 0 2px 4px rgba(0,0,0,0.6)",
          fontVariantNumeric: "tabular-nums",
          minHeight: "1.2em",
        }}
      >
        {mounted ? time : "\u00A0"}
      </div>

      {/* Day type label */}
      <div
        className="text-sm font-bold px-4 py-0.5 rounded-sm"
        style={{
          color: "#0a0a1a",
          background: "linear-gradient(180deg, #d4af37 0%, #8b7225 100%)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        {dayType}
      </div>
    </div>
  );
}
