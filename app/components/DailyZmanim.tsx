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
            <span style={{ color: "#c9a84c", fontSize: 14, fontWeight: 500 }}>
              {e.label}
            </span>
            <span dir="ltr" style={{
              color: "#e8d48a",
              fontSize: 17,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 0 8px rgba(232,212,138,0.12)",
            }}>
              {e.time}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
        paddingTop: 6,
        borderTop: "1px solid rgba(160,133,48,0.1)",
      }}>
        <span style={{ color: "#5a4a2a", fontSize: 11 }}>{pirkeiAvot}</span>
        <svg width="16" height="16" viewBox="0 0 18 18">
          <rect x="3" y="6" width="12" height="10" fill="none" stroke="#4a3e1a" strokeWidth="0.8" rx="0.5" />
          <line x1="9" y1="6" x2="9" y2="16" stroke="#4a3e1a" strokeWidth="0.5" />
          <path d="M5,6 L9,2 L13,6" fill="none" stroke="#6b5a20" strokeWidth="0.8" />
        </svg>
      </div>
    </OrnateFrame>
  );
}
