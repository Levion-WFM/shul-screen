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
  const sz = isGrand ? 64 : 52;

  // Nested divs create the thick beveled frame:
  // [outer gold border] → [dark groove] → [inner gold border] → [dark edge] → [content]
  const outerClass = isGrand ? "frame-outer-grand" : "frame-outer";
  const innerClass = isGrand ? "frame-inner-grand" : "frame-inner";
  const contentClass = isGrand ? "frame-content-grand" : "frame-content";

  return (
    <div className={`${outerClass} ${className}`}>
      {/* Corner ornaments sit on the outermost frame */}
      <Corner pos="tl" size={sz} />
      <Corner pos="tr" size={sz} />
      <Corner pos="bl" size={sz} />
      <Corner pos="br" size={sz} />

      <div className={innerClass}>
        <div className={contentClass}>
          {/* Ribbon title overlaps the frame top */}
          {ribbonText && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: -2,
              position: "relative",
              zIndex: 5,
            }}>
              <div className="ribbon">{ribbonText}</div>
            </div>
          )}

          {/* Content with generous padding */}
          <div style={{
            position: "relative",
            zIndex: 2,
            padding: ribbonText ? "8px 14px 12px" : "14px",
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({ pos, size }: { pos: "tl" | "tr" | "bl" | "br"; size: number }) {
  const placement: Record<string, React.CSSProperties> = {
    tl: { top: -5, left: -5 },
    tr: { top: -5, right: -5 },
    bl: { bottom: -5, left: -5 },
    br: { bottom: -5, right: -5 },
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
      viewBox="0 0 70 70"
      className="corner"
      style={{ ...placement[pos], transform: flip[pos] }}
    >
      <defs>
        <linearGradient id={`cg-${pos}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a843" />
          <stop offset="25%" stopColor="#c9a84c" />
          <stop offset="55%" stopColor="#9a8030" />
          <stop offset="100%" stopColor="#6b5a20" />
        </linearGradient>
        <linearGradient id={`ch-${pos}`} x1="0%" y1="0%" x2="60%" y2="60%">
          <stop offset="0%" stopColor="#e0ca70" />
          <stop offset="100%" stopColor="#b89838" />
        </linearGradient>
      </defs>

      {/* MAIN SCROLL ARMS — thick, solid, heavy cast gold */}
      {/* Horizontal arm */}
      <path
        d="M0,0 L34,0 C28,2 22,6 17,12 C12,18 9,26 11,34
           C8,28 5,20 5.5,13 C6,6 10,2 16,0.5 Z"
        fill={`url(#cg-${pos})`}
      />
      {/* Vertical arm */}
      <path
        d="M0,0 L0,34 C2,28 6,22 12,17 C18,12 26,9 34,11
           C28,8 20,5 13,5.5 C6,6 2,10 0.5,16 Z"
        fill={`url(#cg-${pos})`}
      />

      {/* Highlight edge — light catching the top surface */}
      <path d="M1,1 L30,1 C25,3 19,7 15,12" fill="none"
        stroke="#d4a843" strokeWidth="1.2" opacity="0.6" />
      <path d="M1,1 L1,30 C3,25 7,19 12,15" fill="none"
        stroke="#d4a843" strokeWidth="1.2" opacity="0.6" />

      {/* Curl center — chunky solid gold disc */}
      <circle cx="14" cy="14" r="8" fill="#7a6520" />
      <circle cx="14" cy="14" r="6" fill="#9a8030" />
      <circle cx="14" cy="14" r="4" fill={`url(#ch-${pos})`} />
      <circle cx="12.5" cy="12.5" r="2" fill="#d4a843" opacity="0.5" />

      {/* Scroll tendrils extending along frame edges */}
      <path d="M34,2 Q42,3 48,7 Q53,11 55,17"
        fill="none" stroke="#9a8030" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />
      <path d="M2,34 Q3,42 7,48 Q11,53 17,55"
        fill="none" stroke="#9a8030" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />

      {/* Acanthus leaf accents */}
      <path d="M22,7 Q27,4 30,8 Q27,12 22,9 Z" fill="#8a7028" opacity="0.5" />
      <path d="M7,22 Q4,27 8,30 Q12,27 9,22 Z" fill="#8a7028" opacity="0.5" />

      {/* Secondary inner curl */}
      <path d="M20,14 Q24,10 26,14 Q24,18 20,16 Z" fill="#8a7028" opacity="0.3" />
      <path d="M14,20 Q10,24 14,26 Q18,24 16,20 Z" fill="#8a7028" opacity="0.3" />
    </svg>
  );
}
