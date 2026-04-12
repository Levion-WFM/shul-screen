import OrnateFrame from "./OrnateFrame";

interface WeeklyDafProps {
  title: string;
  content: string;
}

export default function WeeklyDaf({ title, content }: WeeklyDafProps) {
  return (
    <OrnateFrame variant="grand" className="h-full">
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        padding: "8px 12px",
      }}>
        {/* Luchot emblem */}
        <svg width="52" height="40" viewBox="0 0 52 40">
          <defs>
            <linearGradient id="eg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0dfa0" />
              <stop offset="100%" stopColor="#7a6520" />
            </linearGradient>
          </defs>
          <path d="M26,2 L46,9 L46,22 Q46,34 26,36 Q6,34 6,22 L6,9 Z"
            fill="none" stroke="url(#eg)" strokeWidth="1.5" />
          <rect x="15" y="11" width="9" height="13" rx="1.5" fill="none" stroke="#a08530" strokeWidth="0.8" />
          <rect x="28" y="11" width="9" height="13" rx="1.5" fill="none" stroke="#a08530" strokeWidth="0.8" />
          {[0,1,2,3,4].map(i => (
            <g key={i}>
              <line x1="17" y1={14+i*2.2} x2="22" y2={14+i*2.2} stroke="#7a6520" strokeWidth="0.5" />
              <line x1="30" y1={14+i*2.2} x2="35" y2={14+i*2.2} stroke="#7a6520" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        {/* Title */}
        <div style={{
          color: "#f0dfa0",
          fontSize: 24,
          fontWeight: 900,
          marginTop: 10,
          textShadow: "0 1px 6px rgba(240,223,160,0.25)",
          letterSpacing: "1px",
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{ color: "#a08530", fontSize: 13, marginTop: 4, fontWeight: 600 }}>
          שיעורי שבוע א׳ - אחרון
        </div>

        {/* Decorative divider */}
        <svg width="120" height="6" viewBox="0 0 120 6" style={{ margin: "10px 0" }}>
          <line x1="0" y1="3" x2="46" y2="3" stroke="#4a3e1a" strokeWidth="0.8" />
          <circle cx="50" cy="3" r="1.2" fill="#8b7225" />
          <circle cx="56" cy="3" r="1.8" fill="#c9a84c" />
          <circle cx="62" cy="3" r="1.2" fill="#8b7225" />
          <line x1="66" y1="3" x2="120" y2="3" stroke="#4a3e1a" strokeWidth="0.8" />
        </svg>

        {/* Sefarim — larger, more prominent bookshelf */}
        <div style={{
          background: "linear-gradient(180deg, rgba(20,18,10,0.4) 0%, rgba(10,10,14,0.6) 100%)",
          border: "1px solid rgba(160,133,48,0.15)",
          borderRadius: 2,
          padding: "10px 14px 6px",
          marginBottom: 8,
        }}>
          <svg width="220" height="72" viewBox="0 0 220 72">
            {/* Shelf */}
            <rect x="4" y="66" width="212" height="4" rx="0.5"
              fill="linear-gradient(180deg, #5a4a1a, #3a2e10)" opacity="0.6" />
            <line x1="4" y1="66" x2="216" y2="66" stroke="#6b5a20" strokeWidth="0.8" />

            {/* Books — 14 volumes with varied colors and heights */}
            {Array.from({ length: 14 }, (_, i) => {
              const x = 8 + i * 15;
              const h = 34 + ((i * 7 + 3) % 11);
              const hue = [
                "#2a1508", "#1a082a", "#08182a", "#2a0808",
                "#1a1808", "#0a1a2a", "#2a1a18", "#18082a",
                "#081a1a", "#2a1008", "#1a0a20", "#08202a",
                "#2a1a08", "#18082a"
              ];
              return (
                <g key={i}>
                  <rect x={x} y={66 - h} width="12" height={h} fill={hue[i]} rx="0.5"
                    stroke="#5a4a1a" strokeWidth="0.6" />
                  {/* Gold spine label */}
                  <rect x={x + 3} y={66 - h + 5} width="6" height="8" rx="0.5"
                    fill="none" stroke="#6b5a20" strokeWidth="0.4" />
                  {/* Spine line */}
                  <line x1={x + 6} y1={66 - h + 15} x2={x + 6} y2={62}
                    stroke="#3a2e10" strokeWidth="0.3" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Content text */}
        <div style={{ color: "#8a7a4a", fontSize: 13, fontWeight: 500 }}>
          {content}
        </div>
      </div>
    </OrnateFrame>
  );
}
