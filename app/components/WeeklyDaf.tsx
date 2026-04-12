import OrnateFrame from "./OrnateFrame";

interface WeeklyDafProps {
  title: string;
  content: string;
}

export default function WeeklyDaf({ title, content }: WeeklyDafProps) {
  return (
    <OrnateFrame variant="grand" className="h-full flex flex-col">
      {/* Decorative emblem at top */}
      <div className="flex justify-center pt-3">
        <svg width="60" height="40" viewBox="0 0 60 40">
          <defs>
            <linearGradient id="emblem-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5e6a3" />
              <stop offset="100%" stopColor="#8b7225" />
            </linearGradient>
          </defs>
          {/* Shield shape */}
          <path
            d="M30,2 L50,10 L50,24 Q50,36 30,38 Q10,36 10,24 L10,10 Z"
            fill="none"
            stroke="url(#emblem-gold)"
            strokeWidth="1.5"
          />
          {/* Inner tablets */}
          <rect x="19" y="12" width="9" height="14" rx="2"
            fill="none" stroke="#d4af37" strokeWidth="1" />
          <rect x="32" y="12" width="9" height="14" rx="2"
            fill="none" stroke="#d4af37" strokeWidth="1" />
          {/* Lines on tablets */}
          <line x1="21" y1="16" x2="26" y2="16" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="21" y1="19" x2="26" y2="19" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="21" y1="22" x2="26" y2="22" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="34" y1="16" x2="39" y2="16" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="34" y1="19" x2="39" y2="19" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="34" y1="22" x2="39" y2="22" stroke="#c9a84c" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Title */}
      <h2
        className="text-xl font-black text-center mt-2 mb-3"
        style={{
          color: "#f5e6a3",
          textShadow: "0 0 8px rgba(245, 230, 163, 0.4)",
        }}
      >
        {title}
      </h2>

      {/* Decorative divider */}
      <div className="flex justify-center mb-3">
        <svg width="140" height="6" viewBox="0 0 140 6">
          <line x1="0" y1="3" x2="55" y2="3" stroke="#8b7225" strokeWidth="1" />
          <circle cx="60" cy="3" r="1.5" fill="#d4af37" />
          <circle cx="70" cy="3" r="2" fill="#f5e6a3" />
          <circle cx="80" cy="3" r="1.5" fill="#d4af37" />
          <line x1="85" y1="3" x2="140" y2="3" stroke="#8b7225" strokeWidth="1" />
        </svg>
      </div>

      {/* Books / Sefarim illustration */}
      <div className="flex justify-center mb-3">
        <svg width="200" height="70" viewBox="0 0 200 70">
          <defs>
            <linearGradient id="book1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2a1a0a" />
              <stop offset="50%" stopColor="#4a2a10" />
              <stop offset="100%" stopColor="#2a1a0a" />
            </linearGradient>
            <linearGradient id="book2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a0a2a" />
              <stop offset="50%" stopColor="#2a1040" />
              <stop offset="100%" stopColor="#1a0a2a" />
            </linearGradient>
            <linearGradient id="book3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0a1a2a" />
              <stop offset="50%" stopColor="#102a4a" />
              <stop offset="100%" stopColor="#0a1a2a" />
            </linearGradient>
            <linearGradient id="book-spine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8b7225" />
            </linearGradient>
          </defs>
          {/* Shelf */}
          <rect x="10" y="62" width="180" height="4" fill="url(#book-spine)" rx="1" opacity="0.6" />
          {/* Books - row of sefarim */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const x = 16 + i * 15;
            const h = 36 + (i % 3) * 6;
            const fills = ["url(#book1)", "url(#book2)", "url(#book3)"];
            return (
              <g key={i}>
                <rect x={x} y={62 - h} width="12" height={h} fill={fills[i % 3]} rx="1"
                  stroke="#d4af37" strokeWidth="0.5" />
                {/* Gold spine line */}
                <line x1={x + 6} y1={62 - h + 4} x2={x + 6} y2={58}
                  stroke="#d4af37" strokeWidth="0.4" opacity="0.6" />
                {/* Gold title area on spine */}
                <rect x={x + 2} y={62 - h + 6} width="8" height="8"
                  fill="none" stroke="#c9a84c" strokeWidth="0.4" opacity="0.4" rx="0.5" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content text */}
      <div className="text-center text-sm px-4" style={{ color: "#c9a84c" }}>
        {content}
      </div>
    </OrnateFrame>
  );
}
