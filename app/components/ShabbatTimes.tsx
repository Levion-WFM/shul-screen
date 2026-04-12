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
    </OrnateFrame>
  );
}
