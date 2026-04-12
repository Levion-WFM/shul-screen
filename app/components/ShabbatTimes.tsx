import OrnateFrame from "./OrnateFrame";
import { TimeEntry } from "../lib/types";

interface ShabbatTimesProps {
  times: TimeEntry[];
}

export default function ShabbatTimes({ times }: ShabbatTimesProps) {
  return (
    <OrnateFrame ribbonText="זמני שבת" className="h-full">
      <div className="flex flex-col gap-0">
        {times.map((entry, i) => (
          <div key={i} className="time-row">
            <span
              className="text-sm font-medium"
              style={{ color: "#f0e6c8" }}
            >
              {entry.label}
            </span>
            <span
              className="text-sm font-bold tabular-nums mr-3"
              style={{ color: "#f5e6a3" }}
            >
              {entry.time}
            </span>
          </div>
        ))}
      </div>
    </OrnateFrame>
  );
}
