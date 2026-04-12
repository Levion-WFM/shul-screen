interface ShulHeaderProps {
  shulName: string;
  shulSubtitle: string;
}

export default function ShulHeader({ shulName, shulSubtitle }: ShulHeaderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0 0" }}>
      {/* Shul building icon — compact */}
      <svg width="40" height="34" viewBox="0 0 40 34">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0dfa0" />
            <stop offset="100%" stopColor="#a08530" />
          </linearGradient>
        </defs>
        <rect x="5" y="24" width="30" height="3" fill="url(#bg)" rx="0.5" />
        <rect x="8" y="12" width="3" height="12" fill="url(#bg)" />
        <rect x="17" y="12" width="3" height="12" fill="url(#bg)" />
        <rect x="22" y="12" width="3" height="12" fill="url(#bg)" />
        <rect x="29" y="12" width="3" height="12" fill="url(#bg)" />
        <polygon points="3,12 20,1 37,12" fill="none" stroke="url(#bg)" strokeWidth="1.8" />
        <path d="M18,24 Q18,18 20,17 Q22,18 22,24" fill="none" stroke="#c9a84c" strokeWidth="1" />
      </svg>

      <div style={{ color: "#9a8a5a", fontSize: 13, fontWeight: 500, marginTop: 1 }}>
        {shulSubtitle}
      </div>
      <div style={{
        color: "#f0dfa0",
        fontSize: 28,
        fontWeight: 900,
        lineHeight: 1.15,
        textShadow: "0 1px 6px rgba(240,223,160,0.3)",
      }}>
        {shulName}
      </div>

      {/* Thin gold divider */}
      <svg width="90" height="5" viewBox="0 0 90 5" style={{ marginTop: 2 }}>
        <line x1="0" y1="2.5" x2="35" y2="2.5" stroke="#6b5a20" strokeWidth="0.8" />
        <circle cx="40" cy="2.5" r="1.5" fill="#a08530" />
        <circle cx="45" cy="2.5" r="2" fill="#d4af37" />
        <circle cx="50" cy="2.5" r="1.5" fill="#a08530" />
        <line x1="55" y1="2.5" x2="90" y2="2.5" stroke="#6b5a20" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
