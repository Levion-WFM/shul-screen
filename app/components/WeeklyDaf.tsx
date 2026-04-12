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
      }}>
        {/* Luchot emblem */}
        <svg width="56" height="44" viewBox="0 0 52 40">
          <defs>
            <linearGradient id="eg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8d48a" />
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
          color: "#e8d48a",
          fontSize: 26,
          fontWeight: 900,
          marginTop: 14,
          textShadow: "0 0 12px rgba(232,212,138,0.2), 0 2px 4px rgba(0,0,0,0.4)",
          letterSpacing: "1px",
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{ color: "#8a7a4a", fontSize: 14, marginTop: 6, fontWeight: 600 }}>
          שיעורי שבוע א׳ - אחרון
        </div>

        {/* Divider */}
        <svg width="120" height="6" viewBox="0 0 120 6" style={{ margin: "12px 0" }}>
          <line x1="0" y1="3" x2="46" y2="3" stroke="#3a3018" strokeWidth="0.8" />
          <circle cx="50" cy="3" r="1.2" fill="#7a6520" />
          <circle cx="56" cy="3" r="2" fill="#a08530" />
          <circle cx="62" cy="3" r="1.2" fill="#7a6520" />
          <line x1="66" y1="3" x2="120" y2="3" stroke="#3a3018" strokeWidth="0.8" />
        </svg>

        {/* Sefarim shelf — framed like a poster */}
        <div style={{
          background: "linear-gradient(180deg, rgba(16,14,10,0.5) 0%, rgba(10,10,12,0.7) 100%)",
          border: "1px solid rgba(140,120,60,0.12)",
          padding: "14px 20px 8px",
          marginBottom: 12,
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.3)",
        }}>
          <svg width="220" height="70" viewBox="0 0 220 70">
            <rect x="6" y="64" width="208" height="4" rx="0.5" fill="#3a3018" opacity="0.5" />
            <line x1="6" y1="64" x2="214" y2="64" stroke="#5a4a1a" strokeWidth="0.8" />
            {Array.from({ length: 14 }, (_, i) => {
              const x = 10 + i * 14.5;
              const h = 32 + ((i * 7 + 3) % 13);
              const hue = [
                "#2a1508","#1a082a","#08182a","#2a0808",
                "#1a1808","#0a1a2a","#2a1a18","#18082a",
                "#081a1a","#2a1008","#1a0a20","#08202a",
                "#2a1a08","#18082a"
              ];
              return (
                <g key={i}>
                  <rect x={x} y={64-h} width="11" height={h} fill={hue[i]} rx="0.5"
                    stroke="#5a4a1a" strokeWidth="0.6" />
                  <rect x={x+2.5} y={64-h+5} width="6" height="7" rx="0.5"
                    fill="none" stroke="#4a3e1a" strokeWidth="0.4" />
                  <line x1={x+5.5} y1={64-h+14} x2={x+5.5} y2={60}
                    stroke="#2a2010" strokeWidth="0.3" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Content text */}
        <div style={{
          color: "#8a7a4a",
          fontSize: 14,
          fontWeight: 500,
          textShadow: "0 0 6px rgba(138,122,74,0.1)",
        }}>
          {content}
        </div>
      </div>
    </OrnateFrame>
  );
}
