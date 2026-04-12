"use client";

import OrnateFrame from "./OrnateFrame";

export default function CalendarGrid() {
  const now = new Date();
  const month = now.getMonth();
  const date = now.getDate();
  const year = now.getFullYear();

  const days = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const months = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <OrnateFrame ribbonText={months[month] + " " + year} className="h-full">
      <div style={{ direction: "ltr" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 2 }}>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: "center", color: "#a08530", fontSize: 11, fontWeight: 700 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
          {cells.map((day, i) => {
            const isCurrent = day === date;
            return (
              <div key={i} style={{
                textAlign: "center",
                fontSize: 11,
                padding: "1px 0",
                color: isCurrent ? "#080818" : day ? "#8a7a4a" : "transparent",
                background: isCurrent ? "linear-gradient(180deg,#c9a84c,#7a6520)" : "transparent",
                borderRadius: isCurrent ? 2 : 0,
                fontWeight: isCurrent ? 700 : 400,
              }}>
                {day ?? ""}
              </div>
            );
          })}
        </div>
      </div>
    </OrnateFrame>
  );
}
