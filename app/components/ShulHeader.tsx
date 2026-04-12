interface ShulHeaderProps {
  shulName: string;
  shulSubtitle: string;
}

export default function ShulHeader({ shulName, shulSubtitle }: ShulHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center py-2">
      {/* Shul building icon */}
      <svg width="52" height="44" viewBox="0 0 52 44" className="mb-1">
        <defs>
          <linearGradient id="building-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5e6a3" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
        {/* Base */}
        <rect x="6" y="32" width="40" height="4" fill="url(#building-gold)" rx="1" />
        {/* Columns */}
        <rect x="10" y="16" width="4" height="16" fill="url(#building-gold)" rx="1" />
        <rect x="20" y="16" width="4" height="16" fill="url(#building-gold)" rx="1" />
        <rect x="28" y="16" width="4" height="16" fill="url(#building-gold)" rx="1" />
        <rect x="38" y="16" width="4" height="16" fill="url(#building-gold)" rx="1" />
        {/* Roof / pediment */}
        <polygon points="4,16 26,2 48,16" fill="none" stroke="url(#building-gold)" strokeWidth="2" />
        {/* Door arch */}
        <path d="M22,32 Q22,24 26,22 Q30,24 30,32" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        {/* Star of David */}
        <polygon points="26,6 28,10 32,10 29,13 30,17 26,14 22,17 23,13 20,10 24,10"
          fill="none" stroke="#f5e6a3" strokeWidth="0.8" opacity="0.8" />
      </svg>

      {/* Subtitle */}
      <div className="text-sm font-medium" style={{ color: "#c9a84c" }}>
        {shulSubtitle}
      </div>

      {/* Shul name */}
      <h1
        className="text-2xl font-black mt-0.5 tracking-wide"
        style={{
          color: "#f5e6a3",
          textShadow: "0 0 10px rgba(245, 230, 163, 0.4), 0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {shulName}
      </h1>

      {/* Decorative line under name */}
      <svg width="120" height="8" viewBox="0 0 120 8" className="mt-1">
        <line x1="0" y1="4" x2="45" y2="4" stroke="#8b7225" strokeWidth="1" />
        <circle cx="50" cy="4" r="2" fill="#d4af37" />
        <circle cx="60" cy="4" r="3" fill="#f5e6a3" />
        <circle cx="70" cy="4" r="2" fill="#d4af37" />
        <line x1="75" y1="4" x2="120" y2="4" stroke="#8b7225" strokeWidth="1" />
      </svg>
    </div>
  );
}
