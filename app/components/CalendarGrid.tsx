"use client";

import OrnateFrame from "./OrnateFrame";

// This shows the weekday schedule / zmanei chol times in a compact grid
// matching the reference image's top-right panel

interface ZmaneiCholProps {
  times?: { label: string; time: string }[];
}

export default function ZmaneiChol({ times }: ZmaneiCholProps) {
  // Placeholder weekday times matching reference display
  const cholTimes = times || [
    { label: "עלות השחר", time: "5:12" },
    { label: "נץ החמה", time: "6:28" },
    { label: "סוף זמן ק״ש", time: "9:18" },
    { label: "חצות", time: "12:48" },
    { label: "מנחה גדולה", time: "1:18" },
    { label: "שקיעה", time: "7:16" },
    { label: "צאת הכוכבים", time: "7:52" },
  ];

  return (
    <OrnateFrame ribbonText="זמני חול" className="h-full">
      <div>
        {cholTimes.map((e, i) => (
          <div key={i} className="trow" style={{ padding: "2px 8px" }}>
            <span style={{ color: "#d8c88a", fontSize: 12, fontWeight: 500 }}>
              {e.label}
            </span>
            <span dir="ltr" style={{ color: "#f0dfa0", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {e.time}
            </span>
          </div>
        ))}
      </div>
    </OrnateFrame>
  );
}
