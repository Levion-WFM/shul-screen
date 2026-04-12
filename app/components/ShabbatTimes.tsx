import OrnateFrame from "./OrnateFrame";
import { TimeEntry } from "../lib/types";

interface ShabbatTimesProps {
  times: TimeEntry[];
}

export default function ShabbatTimes({ times }: ShabbatTimesProps) {
  return (
    <OrnateFrame ribbonText="זמני שבת" className="h-full">
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
    </OrnateFrame>
  );
}
