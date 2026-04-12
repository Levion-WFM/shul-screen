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
            <span style={{ color: "#b89838", fontSize: 14, fontWeight: 500 }}>
              {e.label}
            </span>
            <span dir="ltr" style={{
              color: "#d4a843",
              fontSize: 18,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 0 10px rgba(212,168,67,0.15)",
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
        marginTop: 4,
        paddingTop: 4,
        borderTop: "1px solid rgba(140,112,40,0.08)",
      }}>
        <span style={{ color: "#5a4a20", fontSize: 11 }}>{pirkeiAvot}</span>
        <svg width="14" height="14" viewBox="0 0 18 18">
          <rect x="3" y="6" width="12" height="10" fill="none" stroke="#3a3010" strokeWidth="0.8" rx="0.5" />
          <line x1="9" y1="6" x2="9" y2="16" stroke="#3a3010" strokeWidth="0.5" />
          <path d="M5,6 L9,2 L13,6" fill="none" stroke="#5a4a20" strokeWidth="0.8" />
        </svg>
      </div>
    </OrnateFrame>
  );
}
