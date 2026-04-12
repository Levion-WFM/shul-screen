interface ParshaBannerProps {
  parshaName: string;
  parshaSubtitle: string;
}

export default function ParshaBanner({ parshaName, parshaSubtitle }: ParshaBannerProps) {
  return (
    <div className="text-center py-2 px-3">
      <div
        className="inline-block px-5 py-2 rounded-sm"
        style={{
          background: "linear-gradient(180deg, #1a1a3a 0%, #0d0d24 100%)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 0 8px rgba(212, 175, 55, 0.15)",
        }}
      >
        <h2
          className="text-lg font-bold leading-tight"
          style={{ color: "#f5e6a3", textShadow: "0 0 6px rgba(245, 230, 163, 0.3)" }}
        >
          {parshaName}
        </h2>
        <p className="text-xs mt-1" style={{ color: "#c9a84c" }}>
          {parshaSubtitle}
        </p>
      </div>
    </div>
  );
}
