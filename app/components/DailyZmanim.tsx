import OrnateFrame from "./OrnateFrame";
import { TimeEntry } from "../lib/types";

interface DailyZmanimProps {
  times: TimeEntry[];
  pirkeiAvot: string;
}

export default function DailyZmanim({ times, pirkeiAvot }: DailyZmanimProps) {
  return (
    <OrnateFrame ribbonText="זמני היום" className="h-full">
      <div>
        {times.map((e, i) => (
          <div key={i} className="trow">
            <span style={{ color: "#d8c88a", fontSize: 13, fontWeight: 500 }}>
              {e.label}
            </span>
            <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {e.time}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        paddingTop: 4,
        borderTop: "1px solid rgba(160,133,48,0.15)",
      }}>
        <span style={{ color: "#7a6a3a", fontSize: 11 }}>{pirkeiAvot}</span>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <rect x="3" y="6" width="12" height="10" fill="none" stroke="#6b5a20" strokeWidth="1" rx="0.5" />
          <line x1="9" y1="6" x2="9" y2="16" stroke="#6b5a20" strokeWidth="0.6" />
          <path d="M5,6 L9,2 L13,6" fill="none" stroke="#8b7225" strokeWidth="1" />
        </svg>
      </div>
    </OrnateFrame>
  );
}
