"use client";

interface BottomTickerProps {
  announcements: string[];
  moladInfo: string;
  liturgicalNotes: string;
}

export default function BottomTicker({
  announcements,
  moladInfo,
  liturgicalNotes,
}: BottomTickerProps) {
  const allText = [liturgicalNotes, moladInfo, ...announcements]
    .filter(Boolean)
    .join("  ◆  ");

  return (
    <div
      className="w-full overflow-hidden py-1.5 px-4"
      style={{
        background: "linear-gradient(180deg, rgba(17,17,40,0.9) 0%, rgba(10,10,26,1) 100%)",
        borderTop: "1px solid rgba(212, 175, 55, 0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap ticker-scroll text-xs font-medium"
            style={{ color: "#c9a84c" }}
          >
            {allText}
          </div>
        </div>
      </div>
    </div>
  );
}
