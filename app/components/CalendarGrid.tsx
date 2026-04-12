"use client";

import OrnateFrame from "./OrnateFrame";

export default function CalendarGrid() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentYear = now.getFullYear();

  // Hebrew day names (short)
  const dayNames = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  // Generate days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Hebrew month names
  const hebrewMonths = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <OrnateFrame ribbonText={hebrewMonths[currentMonth] + " " + currentYear} className="h-full">
      <div className="px-1 pt-1">
        {/* Day name headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {dayNames.map((d, i) => (
            <div key={i} className="text-center text-xs font-bold py-0.5"
              style={{ color: "#d4af37" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">
          {cells.map((day, i) => (
            <div
              key={i}
              className="text-center py-0.5"
              style={{
                fontSize: "10px",
                color: day === currentDate ? "#0a0a1a" : day ? "#c9a84c" : "transparent",
                background:
                  day === currentDate
                    ? "linear-gradient(180deg, #d4af37 0%, #8b7225 100%)"
                    : "transparent",
                borderRadius: day === currentDate ? "3px" : "0",
                fontWeight: day === currentDate ? 700 : 400,
              }}
            >
              {day ?? ""}
            </div>
          ))}
        </div>

        {/* Mini yearly calendar below - compact 4x3 grid of months */}
        <div className="mt-2 pt-1" style={{ borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, m) => {
              const isCurrentMonth = m === currentMonth;
              return (
                <div
                  key={m}
                  className="text-center rounded-sm px-0.5 py-0.5"
                  style={{
                    fontSize: "8px",
                    color: isCurrentMonth ? "#0a0a1a" : "#8b7225",
                    background: isCurrentMonth
                      ? "linear-gradient(180deg, #d4af37, #8b7225)"
                      : "transparent",
                    fontWeight: isCurrentMonth ? 700 : 400,
                  }}
                >
                  {(m + 1).toString()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </OrnateFrame>
  );
}
