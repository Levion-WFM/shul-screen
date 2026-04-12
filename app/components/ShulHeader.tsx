interface ShulHeaderProps {
  shulName: string;
  shulSubtitle: string;
}

export default function ShulHeader({ shulName, shulSubtitle }: ShulHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Small shul icon */}
      <svg width="28" height="24" viewBox="0 0 40 34" style={{ flexShrink: 0 }}>
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

      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#8a7a4a", fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
          {shulSubtitle}
        </div>
        <div style={{
          color: "#f0dfa0",
          fontSize: 22,
          fontWeight: 900,
          lineHeight: 1.1,
          textShadow: "0 1px 4px rgba(240,223,160,0.25)",
        }}>
          {shulName}
        </div>
      </div>
    </div>
  );
}
