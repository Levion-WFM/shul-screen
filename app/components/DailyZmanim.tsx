import OrnateFrame from "./OrnateFrame";
import { TimeEntry } from "../lib/types";

interface DailyZmanimProps {
  times: TimeEntry[];
  pirkeiAvot: string;
}

export default function DailyZmanim({ times, pirkeiAvot }: DailyZmanimProps) {
  return (
    <OrnateFrame ribbonText="זמני היום" className="h-full">
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

      {/* Bottom: Pirkei Avot + small icon */}
      <div className="flex items-center justify-between mt-2 pt-2"
        style={{ borderTop: "1px solid rgba(212, 175, 55, 0.2)" }}>
        {/* Small aron kodesh icon */}
        <svg width="24" height="24" viewBox="0 0 24 24">
          <rect x="4" y="8" width="16" height="14" fill="none" stroke="#8b7225" strokeWidth="1.2" rx="1" />
          <line x1="12" y1="8" x2="12" y2="22" stroke="#8b7225" strokeWidth="0.8" />
          <path d="M6,8 L12,3 L18,8" fill="none" stroke="#d4af37" strokeWidth="1.2" />
          <circle cx="12" cy="5" r="1.5" fill="#d4af37" opacity="0.6" />
        </svg>
        <span className="text-xs font-medium" style={{ color: "#c9a84c" }}>
          {pirkeiAvot}
        </span>
      </div>
    </OrnateFrame>
  );
}
