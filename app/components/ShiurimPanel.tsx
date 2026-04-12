import OrnateFrame from "./OrnateFrame";
import { ShiurEntry } from "../lib/types";

interface ShiurimPanelProps {
  shiurim: ShiurEntry[];
}

export default function ShiurimPanel({ shiurim }: ShiurimPanelProps) {
  const cholShiurim = shiurim.filter((_, i) => i < 2);
  const shabbatShiurim = shiurim.filter((_, i) => i >= 2);

  return (
    <OrnateFrame ribbonText="שיעורים" className="h-full">
      <div>
        {/* Weekday section */}
        <div style={{ paddingBottom: 8, borderBottom: "1px dashed rgba(160,133,48,0.2)" }}>
          <div style={{ color: "#a08530", fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
            --- חול ---
          </div>
          {cholShiurim.map((s, i) => (
            <ShiurRow key={i} shiur={s} isLast={i === cholShiurim.length - 1} />
          ))}
        </div>

        {/* Shabbat section */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ color: "#a08530", fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
            --- שבת קודש ---
          </div>
          {shabbatShiurim.map((s, i) => (
            <ShiurRow key={i} shiur={s} isLast={i === shabbatShiurim.length - 1} />
          ))}
        </div>
      </div>
    </OrnateFrame>
  );
}

function ShiurRow({ shiur, isLast }: { shiur: ShiurEntry; isLast: boolean }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      padding: "6px 4px",
      borderBottom: isLast ? "none" : "1px solid rgba(160,133,48,0.08)",
    }}>
      <svg width="10" height="12" viewBox="0 0 12 14" style={{ flexShrink: 0, position: "relative", top: 2 }}>
        <rect x="1" y="0" width="10" height="13" rx="0.5" fill="none" stroke="#4a3e1a" strokeWidth="0.8" />
        <line x1="3.5" y1="0" x2="3.5" y2="13" stroke="#3a2e10" strokeWidth="0.5" />
      </svg>
      <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {shiur.time}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#d8c88a", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{shiur.name}</div>
        <div style={{ color: "#6b5a30", fontSize: 11, lineHeight: 1.3 }}>{shiur.topic}</div>
      </div>
    </div>
  );
}
