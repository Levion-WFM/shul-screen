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
          {/* TOP BAR — compact: parsha | shul name + clock | hebrew date */}
          <div
            dir="rtl"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 10px",
              borderBottom: "1px solid rgba(160,133,48,0.2)",
              flexShrink: 0,
            }}
          >
            {/* Right: Parsha */}
            <ParshaBanner
              parshaName={data.parshaName}
              parshaSubtitle={data.parshaSubtitle}
            />

            {/* Center: Shul name + clock */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <ShulHeader shulName={data.shulName} shulSubtitle={data.shulSubtitle} />
              <LiveClock hebrewDate={data.hebrewDate} dayType={data.dayType} />
            </div>

            {/* Left: spacer for balance */}
            <div style={{ width: 180 }} />
          </div>

          {/* MAIN PANELS — 3 columns, fill remaining height */}
          <div
            style={{
              flex: 1,
              display: "grid",
              direction: "ltr",
              gridTemplateColumns: "27% 1fr 27%",
              gridTemplateRows: "1fr 1fr",
              gap: 5,
              padding: "5px",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* LEFT top: Shabbat Times */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <ShabbatTimes times={data.shabbatTimes} />
            </div>

            {/* CENTER: Weekly Daf — spans both rows */}
            <div dir="rtl" style={{ gridRow: "span 2", minHeight: 0 }}>
              <WeeklyDaf title={data.weeklyDafTitle} content={data.weeklyDafContent} />
            </div>

            {/* RIGHT top: Calendar */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <CalendarGrid />
            </div>

            {/* LEFT bottom: Daily Zmanim */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <DailyZmanim times={data.dailyZmanim} pirkeiAvot={data.pirkeiAvotChapter} />
            </div>

            {/* RIGHT bottom: Shiurim */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <ShiurimPanel shiurim={data.shiurim} />
            </div>
          </div>

          {/* BOTTOM TICKER */}
          <div dir="rtl" style={{ flexShrink: 0 }}>
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
