interface ParshaBannerProps {
  parshaName: string;
  parshaSubtitle: string;
}

export default function ParshaBanner({ parshaName, parshaSubtitle }: ParshaBannerProps) {
  return (
    <div style={{
      border: "1px solid rgba(160,133,48,0.4)",
      background: "#0c0c22",
      padding: "4px 14px",
      textAlign: "center",
      flexShrink: 0,
      minWidth: 160,
    }}>
      <div style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
        {parshaName}
      </div>
      <div style={{ color: "#6b5a20", fontSize: 10, marginTop: 1 }}>
        {parshaSubtitle}
      </div>
    </div>
  );
}
