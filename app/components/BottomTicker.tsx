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
      borderTop: "2px solid #a08530",
      background: "#080818",
      padding: "4px 0",
      overflow: "hidden",
    }}>
      <div className="ticker-move" style={{ color: "#8a7a4a", fontSize: 12, fontWeight: 500 }}>
        {text}
      </div>
    </div>
  );
}
