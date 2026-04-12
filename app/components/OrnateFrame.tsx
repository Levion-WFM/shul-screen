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
  const cornerSize = isGrand ? 40 : 30;

  return (
    <div className={`${frameClass} relative ${className}`}>
      <Corner pos="tl" size={cornerSize} />
      <Corner pos="tr" size={cornerSize} />
      <Corner pos="bl" size={cornerSize} />
      <Corner pos="br" size={cornerSize} />

      {ribbonText && (
        <div className="flex justify-center" style={{ marginTop: -1 }}>
          <div className="ribbon">{ribbonText}</div>
        </div>
      )}

      <div className={`relative z-[1] ${ribbonText ? "pt-1 px-2 pb-2" : "p-2"}`}>
        {children}
      </div>
    </div>
  );
}

function Corner({ pos, size }: { pos: "tl" | "tr" | "bl" | "br"; size: number }) {
  const placement: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1 },
    tr: { top: -1, right: -1 },
    bl: { bottom: -1, left: -1 },
    br: { bottom: -1, right: -1 },
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
      viewBox="0 0 50 50"
      className="corner"
      style={{ ...placement[pos], transform: flip[pos] }}
    >
      <defs>
        <linearGradient id={`cg-${pos}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6a3" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8b7225" />
        </linearGradient>
      </defs>
      {/* Main scroll body — solid filled shape */}
      <path
        d="M0,0 L18,0 C14,2 10,6 8,12 C6,18 7,24 10,28 C6,24 4,18 4,12 C4,6 6,2 10,0 L0,0 Z"
        fill={`url(#cg-${pos})`}
        opacity="0.9"
      />
      <path
        d="M0,0 L0,18 C2,14 6,10 12,8 C18,6 24,7 28,10 C24,6 18,4 12,4 C6,4 2,6 0,10 L0,0 Z"
        fill={`url(#cg-${pos})`}
        opacity="0.9"
      />
      {/* Curl tip */}
      <circle cx="12" cy="12" r="4" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="1.5" fill="#f5e6a3" opacity="0.8" />
      {/* Outer flick */}
      <path
        d="M18,2 C22,2 26,4 28,8"
        fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.5"
      />
      <path
        d="M2,18 C2,22 4,26 8,28"
        fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.5"
      />
    </svg>
  );
}
