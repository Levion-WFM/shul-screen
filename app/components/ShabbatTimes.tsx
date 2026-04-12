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
          <div key={i} className="trow" style={{ padding: "2px 8px" }}>
            <span style={{ color: "#d8c88a", fontSize: 13, fontWeight: 500 }}>
              {e.label}
            </span>
            <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {e.time}
            </span>
          </div>
        ))}
      </div>
    </OrnateFrame>
  );
}
