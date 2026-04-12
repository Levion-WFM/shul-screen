import React from "react";

interface OrnateFrameProps {
  children: React.ReactNode;
  variant?: "standard" | "grand";
  ribbonText?: string;
  className?: string;
}

export default function OrnateFrame({
  children,
  variant = "standard",
  ribbonText,
  className = "",
}: OrnateFrameProps) {
  const isGrand = variant === "grand";
  const frameClass = isGrand ? "panel-grand" : "panel";
  const sz = isGrand ? 60 : 48;

  return (
    <div className={`${frameClass} relative ${className}`}>
      {/* Heavy solid gold corner brackets */}
      <Corner pos="tl" size={sz} />
      <Corner pos="tr" size={sz} />
      <Corner pos="bl" size={sz} />
      <Corner pos="br" size={sz} />

      {/* Ribbon title */}
      {ribbonText && (
        <div className="flex justify-center" style={{ marginTop: -2, position: "relative", zIndex: 5 }}>
          <div className="ribbon">{ribbonText}</div>
        </div>
      )}

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: ribbonText ? "10px 18px 16px" : "18px",
      }}>
        {children}
      </div>
    </div>
  );
}

function Corner({ pos, size }: { pos: "tl" | "tr" | "bl" | "br"; size: number }) {
  const placement: Record<string, React.CSSProperties> = {
    tl: { top: -4, left: -4 },
    tr: { top: -4, right: -4 },
    bl: { bottom: -4, left: -4 },
    br: { bottom: -4, right: -4 },
  };
  const flip: Record<string, string> = {
    tl: "scale(1,1)",
    tr: "scale(-1,1)",
    bl: "scale(1,-1)",
    br: "scale(-1,-1)",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className="corner"
      style={{ ...placement[pos], transform: flip[pos] }}
    >
      <defs>
        <linearGradient id={`cg-${pos}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8d48a" />
          <stop offset="30%" stopColor="#c9a84c" />
          <stop offset="65%" stopColor="#a08530" />
          <stop offset="100%" stopColor="#6b5a20" />
        </linearGradient>
        <linearGradient id={`ch-${pos}`} x1="0%" y1="0%" x2="50%" y2="50%">
          <stop offset="0%" stopColor="#f0dfa0" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>

      {/* MAIN SCROLL BODY — thick, solid, heavy */}
      {/* Horizontal arm */}
      <path
        d="M0,0 L28,0 C24,1.5 18,5 14,10 C10,16 8,23 10,30
           C7,24 5,17 5,11 C5.5,5 8,2 14,0.5 Z"
        fill={`url(#cg-${pos})`}
      />
      {/* Vertical arm */}
      <path
        d="M0,0 L0,28 C1.5,24 5,18 10,14 C16,10 23,8 30,10
           C24,7 17,5 11,5 C5,5.5 2,8 0.5,14 Z"
        fill={`url(#cg-${pos})`}
      />

      {/* Highlight on top surface of scroll (3D lighting) */}
      <path
        d="M1,0.5 L24,0.5 C20,2 15,5 12,9"
        fill="none" stroke="#e8d48a" strokeWidth="1" opacity="0.5"
      />
      <path
        d="M0.5,1 L0.5,24 C2,20 5,15 9,12"
        fill="none" stroke="#e8d48a" strokeWidth="1" opacity="0.5"
      />

      {/* Curl center — solid, chunky */}
      <circle cx="12" cy="12" r="7" fill="#8b7225" />
      <circle cx="12" cy="12" r="5" fill="#a08530" />
      <circle cx="12" cy="12" r="3" fill={`url(#ch-${pos})`} />
      {/* Light catch on curl */}
      <circle cx="10.5" cy="10.5" r="1.5" fill="#e8d48a" opacity="0.6" />

      {/* Secondary scroll curves extending along frame */}
      <path
        d="M28,1.5 Q35,2 40,5 Q44,8 45,13"
        fill="none" stroke="#a08530" strokeWidth="2" opacity="0.35" strokeLinecap="round"
      />
      <path
        d="M1.5,28 Q2,35 5,40 Q8,44 13,45"
        fill="none" stroke="#a08530" strokeWidth="2" opacity="0.35" strokeLinecap="round"
      />

      {/* Leaf accents at curl */}
      <path
        d="M18,6 Q22,4 24,7 Q22,10 18,8 Z"
        fill="#9a8030" opacity="0.4"
      />
      <path
        d="M6,18 Q4,22 7,24 Q10,22 8,18 Z"
        fill="#9a8030" opacity="0.4"
      />
    </svg>
  );
}
