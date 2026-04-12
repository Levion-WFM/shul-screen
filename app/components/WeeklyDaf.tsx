import OrnateFrame from "./OrnateFrame";

interface WeeklyDafProps {
  title: string;
  content: string;
}

export default function WeeklyDaf({ title, content }: WeeklyDafProps) {
  return (
    <OrnateFrame variant="grand" className="h-full">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "center" }}>
        {/* Luchot emblem */}
        <svg width="48" height="36" viewBox="0 0 48 36">
          <defs>
            <linearGradient id="eg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0dfa0" />
              <stop offset="100%" stopColor="#7a6520" />
            </linearGradient>
          </defs>
          <path d="M24,1 L44,8 L44,20 Q44,32 24,34 Q4,32 4,20 L4,8 Z"
            fill="none" stroke="url(#eg)" strokeWidth="1.2" />
          <rect x="14" y="10" width="8" height="12" rx="1.5" fill="none" stroke="#a08530" strokeWidth="0.8" />
          <rect x="26" y="10" width="8" height="12" rx="1.5" fill="none" stroke="#a08530" strokeWidth="0.8" />
          {[0,1,2,3,4].map(i => (
            <g key={i}>
              <line x1="16" y1={13+i*2} x2="20" y2={13+i*2} stroke="#7a6520" strokeWidth="0.5" />
              <line x1="28" y1={13+i*2} x2="32" y2={13+i*2} stroke="#7a6520" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        <div style={{ color: "#f0dfa0", fontSize: 20, fontWeight: 900, marginTop: 8, textShadow: "0 0 6px rgba(240,223,160,0.3)" }}>
          {title}
        </div>

        {/* Divider */}
        <svg width="100" height="5" viewBox="0 0 100 5" style={{ margin: "6px 0" }}>
          <line x1="0" y1="2.5" x2="40" y2="2.5" stroke="#4a3e1a" strokeWidth="0.7" />
          <circle cx="45" cy="2.5" r="1.2" fill="#8b7225" />
          <circle cx="50" cy="2.5" r="1.8" fill="#c9a84c" />
          <circle cx="55" cy="2.5" r="1.2" fill="#8b7225" />
          <line x1="60" y1="2.5" x2="100" y2="2.5" stroke="#4a3e1a" strokeWidth="0.7" />
        </svg>

        {/* Sefarim row */}
        <svg width="180" height="60" viewBox="0 0 180 60" style={{ margin: "4px 0" }}>
          <rect x="8" y="54" width="164" height="3" rx="0.5" fill="#5a4a1a" opacity="0.5" />
          {Array.from({ length: 13 }, (_, i) => {
            const x = 12 + i * 12.5;
            const h = 30 + (i % 4) * 5;
            const colors = ["#2a1508", "#18082a", "#08182a", "#2a1018"];
            return (
              <g key={i}>
                <rect x={x} y={54 - h} width="10" height={h} fill={colors[i % 4]} rx="0.5"
                  stroke="#5a4a1a" strokeWidth="0.5" />
                <rect x={x + 2.5} y={54 - h + 4} width="5" height="6" rx="0.3"
                  fill="none" stroke="#4a3e1a" strokeWidth="0.3" />
                <line x1={x + 5} y1={54 - h + 12} x2={x + 5} y2={52}
                  stroke="#3a2e10" strokeWidth="0.3" />
              </g>
            );
          })}
        </svg>

        <div style={{ color: "#8a7a4a", fontSize: 13, marginTop: 4 }}>
          {content}
        </div>
      </div>
    </OrnateFrame>
  );
}
