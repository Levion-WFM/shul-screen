import React from "react";

interface OrnateFrameProps {
  children: React.ReactNode;
  variant?: "standard" | "grand" | "small";
  ribbonText?: string;
  className?: string;
}

export default function OrnateFrame({
  children,
  variant = "standard",
  ribbonText,
  className = "",
}: OrnateFrameProps) {
  const frameClass =
    variant === "grand" ? "ornate-frame-grand" : "ornate-frame";

  return (
    <div className={`${frameClass} relative ${className}`}>
      {/* Corner ornaments */}
      <CornerPiece position="top-right" size={variant === "grand" ? 44 : 32} />
      <CornerPiece position="top-left" size={variant === "grand" ? 44 : 32} />
      <CornerPiece position="bottom-right" size={variant === "grand" ? 44 : 32} />
      <CornerPiece position="bottom-left" size={variant === "grand" ? 44 : 32} />

      {/* Side ornaments for grand variant */}
      {variant === "grand" && (
        <>
          <SideOrnament position="top" />
          <SideOrnament position="bottom" />
        </>
      )}

      {/* Ribbon title */}
      {ribbonText && (
        <div className="flex justify-center -mt-[1px] relative z-10">
          <div className="ribbon-title">{ribbonText}</div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-[1] ${ribbonText ? "pt-1" : "p-3"} px-3 pb-3`}>
        {children}
      </div>
    </div>
  );
}

function CornerPiece({
  position,
  size = 32,
}: {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: number;
}) {
  const posStyles: Record<string, React.CSSProperties> = {
    "top-right": { top: -2, right: -2 },
    "top-left": { top: -2, left: -2 },
    "bottom-right": { bottom: -2, right: -2 },
    "bottom-left": { bottom: -2, left: -2 },
  };

  const rotations: Record<string, string> = {
    "top-right": "rotate(0deg)",
    "top-left": "rotate(90deg)",
    "bottom-right": "rotate(-90deg)",
    "bottom-left": "rotate(180deg)",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      style={{
        position: "absolute",
        ...posStyles[position],
        transform: rotations[position],
        zIndex: 5,
      }}
    >
      {/* Ornate corner scrollwork */}
      <defs>
        <linearGradient id={`gold-grad-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6a3" />
          <stop offset="30%" stopColor="#d4af37" />
          <stop offset="60%" stopColor="#f5e6a3" />
          <stop offset="100%" stopColor="#8b7225" />
        </linearGradient>
      </defs>
      {/* Main scroll curve */}
      <path
        d="M2,2 Q2,20 12,28 Q6,22 6,12 Q6,6 12,4 L28,2 Q20,2 12,6 Q6,12 8,22 Q12,30 20,32 Q14,28 12,22 Q10,16 14,10 Q18,6 24,6 L30,4"
        fill="none"
        stroke={`url(#gold-grad-${position})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Inner spiral */}
      <path
        d="M4,4 Q4,14 10,20 Q8,14 10,10 Q12,6 18,5"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.5"
        opacity="0.7"
      />
      {/* Leaf accent */}
      <ellipse cx="8" cy="8" rx="4" ry="6" transform="rotate(-45, 8, 8)"
        fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.5" />
      {/* Dot accent */}
      <circle cx="5" cy="5" r="2" fill="#f5e6a3" opacity="0.6" />
    </svg>
  );
}

function SideOrnament({ position }: { position: "top" | "bottom" }) {
  const style: React.CSSProperties =
    position === "top"
      ? { top: -3, left: "50%", transform: "translateX(-50%)" }
      : { bottom: -3, left: "50%", transform: "translateX(-50%) rotate(180deg)" };

  return (
    <svg
      width="80"
      height="16"
      viewBox="0 0 80 16"
      style={{ position: "absolute", ...style, zIndex: 5 }}
    >
      <defs>
        <linearGradient id="side-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b7225" />
          <stop offset="50%" stopColor="#f5e6a3" />
          <stop offset="100%" stopColor="#8b7225" />
        </linearGradient>
      </defs>
      <path
        d="M0,8 Q10,0 20,4 Q30,8 40,2 Q50,8 60,4 Q70,0 80,8"
        fill="none"
        stroke="url(#side-gold)"
        strokeWidth="2"
      />
      <circle cx="40" cy="4" r="3" fill="#d4af37" />
    </svg>
  );
}
