import OrnateFrame from "./OrnateFrame";
import { ShiurEntry } from "../lib/types";

interface ShiurimPanelProps {
  shiurim: ShiurEntry[];
}

export default function ShiurimPanel({ shiurim }: ShiurimPanelProps) {
  return (
    <OrnateFrame ribbonText="שיעורים" className="h-full">
      <div>
        {shiurim.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "4px 6px",
              borderBottom: i < shiurim.length - 1 ? "1px solid rgba(160,133,48,0.12)" : "none",
            }}
          >
            <svg width="12" height="14" viewBox="0 0 12 14" style={{ flexShrink: 0, marginTop: 2 }}>
              <rect x="1" y="0" width="10" height="13" rx="0.5" fill="none" stroke="#6b5a20" strokeWidth="0.8" />
              <line x1="3.5" y1="0" x2="3.5" y2="13" stroke="#4a3e1a" strokeWidth="0.5" />
            </svg>
            <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {s.time}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#d8c88a", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: "#7a6a3a", fontSize: 11 }}>{s.topic}</div>
            </div>
          </div>
        ))}
      </div>
    </OrnateFrame>
  );
}
