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
  const sz = isGrand ? 38 : 30;

  return (
    <div className={`${frameClass} relative ${className}`}>
      {/* LAYER 6: Corner ornaments — solid gold, sitting on frame */}
      <Corner pos="tl" size={sz} />
      <Corner pos="tr" size={sz} />
      <Corner pos="bl" size={sz} />
      <Corner pos="br" size={sz} />

      {/* Ribbon title — brass nameplate */}
      {ribbonText && (
        <div className="flex justify-center" style={{ marginTop: -2, position: "relative", zIndex: 3 }}>
          <div className="ribbon">{ribbonText}</div>
        </div>
      )}

      {/* LAYER 5: Content with generous padding */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: ribbonText ? "8px 16px 14px" : "16px",
      }}>
        {children}
      </div>
    </div>
  );
}

function Corner({ pos, size }: { pos: "tl" | "tr" | "bl" | "br"; size: number }) {
  const placement: Record<string, React.CSSProperties> = {
    tl: { top: -3, left: -3 },
    tr: { top: -3, right: -3 },
    bl: { bottom: -3, left: -3 },
    br: { bottom: -3, right: -3 },
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
          <stop offset="0%" stopColor="#e8d48a" />
          <stop offset="35%" stopColor="#c9a84c" />
          <stop offset="70%" stopColor="#a08530" />
          <stop offset="100%" stopColor="#7a6520" />
        </linearGradient>
      </defs>
      {/* Solid filled scroll arms — heavy, gilded feel */}
      <path
        d="M2,0 L22,0 C18,1 13,4 10,9 C7,14 6,20 8,26 C5,20 3,14 4,9 C5,5 8,2 12,0 Z"
        fill={`url(#cg-${pos})`}
      />
      <path
        d="M0,2 L0,22 C1,18 4,13 9,10 C14,7 20,6 26,8 C20,5 14,3 9,4 C5,5 2,8 0,12 Z"
        fill={`url(#cg-${pos})`}
      />
      {/* Curl center — solid dot */}
      <circle cx="10" cy="10" r="4.5" fill="#a08530" />
      <circle cx="10" cy="10" r="2.5" fill="#c9a84c" />
      <circle cx="9" cy="9" r="1" fill="#e8d48a" opacity="0.7" />
      {/* Decorative flicks extending along frame */}
      <path d="M22,1 C26,1.5 30,4 32,8" fill="none" stroke="#a08530" strokeWidth="1.5" opacity="0.4" />
      <path d="M1,22 C1.5,26 4,30 8,32" fill="none" stroke="#a08530" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
