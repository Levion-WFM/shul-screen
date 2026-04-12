"use client";

import OrnateFrame from "./OrnateFrame";

interface DaveningTime {
  label: string;
  times: string;
}

interface DaveningScheduleProps {
  schedule?: {
    shacharit: DaveningTime[];
    mincha: string;
    maariv: string;
    extras?: DaveningTime[];
  };
}

export default function DaveningSchedule({ schedule }: DaveningScheduleProps) {
  const s = schedule || {
    shacharit: [
      { label: "ימי חול", times: "7:00  8:00  9:30  10:00" },
    ],
    mincha: "8:10",
    maariv: "8:25",
    extras: [
      { label: "שבת", times: "10:00 - 9:15 - 8:15" },
    ],
  };

  return (
    <OrnateFrame ribbonText="זמני תפילות" className="h-full">
      <div>
        {/* Shacharit */}
        <div style={{ paddingBottom: 8, borderBottom: "1px dashed rgba(160,133,48,0.2)" }}>
          <div style={{ color: "#a08530", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>--- שחרית ---</div>
          {s.shacharit.map((item, i) => (
            <div key={i} className="trow">
              <span style={{ color: "#d8c88a", fontSize: 12 }}>{item.label}</span>
              <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {item.times}
              </span>
            </div>
          ))}
        </div>

        {/* Mincha */}
        <div className="trow" style={{ padding: "6px 12px" }}>
          <span style={{ color: "#d8c88a", fontSize: 13, fontWeight: 600 }}>מנחה</span>
          <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {s.mincha}
          </span>
        </div>

        {/* Maariv */}
        <div className="trow" style={{ padding: "6px 12px" }}>
          <span style={{ color: "#d8c88a", fontSize: 13, fontWeight: 600 }}>ערבית</span>
          <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {s.maariv}
          </span>
        </div>

        {/* Shabbat extras */}
        {s.extras && s.extras.length > 0 && (
          <div style={{ paddingTop: 8, borderTop: "1px dashed rgba(160,133,48,0.2)" }}>
            <div style={{ color: "#a08530", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>--- שבת ---</div>
            {s.extras.map((item, i) => (
              <div key={i} className="trow">
                <span style={{ color: "#d8c88a", fontSize: 12 }}>{item.label}</span>
                <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {item.times}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </OrnateFrame>
  );
}
