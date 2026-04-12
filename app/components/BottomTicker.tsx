"use client";

interface BottomTickerProps {
  announcements: string[];
  moladInfo: string;
  liturgicalNotes: string;
}

export default function BottomTicker({ announcements, moladInfo, liturgicalNotes }: BottomTickerProps) {
  const text = [liturgicalNotes, moladInfo, ...announcements].filter(Boolean).join("  ◆  ");

  return (
    <div style={{
      borderTop: "2px solid",
      borderImage: "linear-gradient(90deg, #7a6520, #c9a84c, #e8d48a, #c9a84c, #7a6520) 1",
      background: "linear-gradient(180deg, rgba(10,10,16,0.95) 0%, #050505 100%)",
      padding: "5px 16px",
      overflow: "hidden",
    }}>
      <div className="ticker-move" style={{ color: "#8a7a4a", fontSize: 12, fontWeight: 500, letterSpacing: "0.3px" }}>
        {text}
      </div>
    </div>
  );
}
