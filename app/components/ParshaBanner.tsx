interface ParshaBannerProps {
  parshaName: string;
  parshaSubtitle: string;
}

export default function ParshaBanner({ parshaName, parshaSubtitle }: ParshaBannerProps) {
  return (
    <div className="panel" style={{ padding: "6px 14px", textAlign: "center" }}>
      <div style={{ color: "#f0dfa0", fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
        {parshaName}
      </div>
      <div style={{ color: "#9a8a5a", fontSize: 11, marginTop: 2 }}>
        {parshaSubtitle}
      </div>
    </div>
  );
}
