import { DisplayData } from "../lib/types";
import ParshaBanner from "./ParshaBanner";
import ShulHeader from "./ShulHeader";
import LiveClock from "./LiveClock";
import ShabbatTimes from "./ShabbatTimes";
import DailyZmanim from "./DailyZmanim";
import WeeklyDaf from "./WeeklyDaf";
import CalendarGrid from "./CalendarGrid";
import ShiurimPanel from "./ShiurimPanel";
import BottomTicker from "./BottomTicker";

interface DisplayBoardProps {
  data: DisplayData;
}

export default function DisplayBoard({ data }: DisplayBoardProps) {
  return (
    <div className="w-screen h-screen bg-black">
      <div className="board-frame w-full h-full">
        <div className="board-inner">
          {/*
            Tight 3-column grid. direction:ltr so columns don't RTL-flip.
            Each cell sets dir="rtl" for Hebrew content.
          */}
          <div
            style={{
              flex: 1,
              display: "grid",
              direction: "ltr",
              gridTemplateColumns: "26fr 48fr 26fr",
              gridTemplateRows: "auto 1fr 1fr",
              gap: "6px",
              padding: "6px",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* R1C1 — Parsha (top-left) */}
            <div dir="rtl">
              <ParshaBanner
                parshaName={data.parshaName}
                parshaSubtitle={data.parshaSubtitle}
              />
            </div>

            {/* R1C2 — Shul header + clock (top-center) */}
            <div dir="rtl" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ShulHeader shulName={data.shulName} shulSubtitle={data.shulSubtitle} />
              <LiveClock hebrewDate={data.hebrewDate} dayType={data.dayType} />
            </div>

            {/* R1C3 — empty spacer or date info (top-right) */}
            <div />

            {/* R2C1 — Shabbat Times */}
            <div dir="rtl" style={{ minHeight: 0 }}>
              <ShabbatTimes times={data.shabbatTimes} />
            </div>

            {/* R2C2 — Weekly Daf centerpiece (spans 2 rows) */}
            <div dir="rtl" style={{ gridRow: "span 2", minHeight: 0 }}>
              <WeeklyDaf title={data.weeklyDafTitle} content={data.weeklyDafContent} />
            </div>

            {/* R2C3 — Calendar */}
            <div dir="rtl" style={{ minHeight: 0 }}>
              <CalendarGrid />
            </div>

            {/* R3C1 — Daily Zmanim */}
            <div dir="rtl" style={{ minHeight: 0 }}>
              <DailyZmanim times={data.dailyZmanim} pirkeiAvot={data.pirkeiAvotChapter} />
            </div>

            {/* R3C3 — Shiurim */}
            <div dir="rtl" style={{ minHeight: 0 }}>
              <ShiurimPanel shiurim={data.shiurim} />
            </div>
          </div>

          {/* Bottom ticker */}
          <div dir="rtl">
            <BottomTicker
              announcements={data.announcements.map((a) => a.text)}
              moladInfo={data.moladInfo}
              liturgicalNotes={data.liturgicalNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
