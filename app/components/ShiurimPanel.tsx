import OrnateFrame from "./OrnateFrame";
import { ShiurEntry } from "../lib/types";

interface ShiurimPanelProps {
  shiurim: ShiurEntry[];
}

export default function ShiurimPanel({ shiurim }: ShiurimPanelProps) {
  return (
    <OrnateFrame ribbonText="שיעורים" className="h-full">
      <div className="flex flex-col gap-1 pt-1">
        {shiurim.map((shiur, i) => (
          <div
            key={i}
            className="flex items-start gap-2 py-1.5 px-2"
            style={{
              borderBottom:
                i < shiurim.length - 1
                  ? "1px solid rgba(212, 175, 55, 0.15)"
                  : "none",
            }}
          >
            {/* Book icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0">
              <rect x="2" y="1" width="12" height="14" rx="1"
                fill="none" stroke="#d4af37" strokeWidth="1" />
              <line x1="5" y1="1" x2="5" y2="15" stroke="#8b7225" strokeWidth="0.8" />
              <line x1="7" y1="4" x2="12" y2="4" stroke="#c9a84c" strokeWidth="0.5" />
              <line x1="7" y1="6" x2="11" y2="6" stroke="#c9a84c" strokeWidth="0.5" />
              <line x1="7" y1="8" x2="12" y2="8" stroke="#c9a84c" strokeWidth="0.5" />
            </svg>

            {/* Time */}
            <span
              className="text-sm font-bold tabular-nums shrink-0"
              style={{ color: "#f5e6a3", minWidth: "36px" }}
            >
              {shiur.time}
            </span>

            {/* Name + topic */}
            <div className="flex flex-col">
              <span className="text-sm font-bold" style={{ color: "#f0e6c8" }}>
                {shiur.name}
              </span>
              <span className="text-xs" style={{ color: "#c9a84c" }}>
                {shiur.topic}
              </span>
            </div>
          </div>
        ))}
      </div>
    </OrnateFrame>
  );
}
