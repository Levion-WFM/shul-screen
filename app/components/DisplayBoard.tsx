import { DisplayData } from "../lib/types";
import ParshaBanner from "./ParshaBanner";
import ShulHeader from "./ShulHeader";
import LiveClock from "./LiveClock";
import ShabbatTimes from "./ShabbatTimes";
import DailyZmanim from "./DailyZmanim";
import WeeklyDaf from "./WeeklyDaf";
import DaveningSchedule from "./CalendarGrid";
import ShiurimPanel from "./ShiurimPanel";
import BottomTicker from "./BottomTicker";

interface DisplayBoardProps {
  data: DisplayData;
}

export default function DisplayBoard({ data }: DisplayBoardProps) {
  return (
    <div className="w-screen h-screen bg-black">
      {/* LAYER 1: Outer gold frame */}
      <div className="board-frame w-full h-full">
        {/* LAYER 2: Granite surface + vignette */}
        <div className="board-inner granite vignette">

          {/* TOP BAR — parsha | shul name + clock */}
          <div
            dir="rtl"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 14px",
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
            }}
          >
            <ParshaBanner parshaName={data.parshaName} parshaSubtitle={data.parshaSubtitle} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <ShulHeader shulName={data.shulName} shulSubtitle={data.shulSubtitle} />
              <LiveClock hebrewDate={data.hebrewDate} dayType={data.dayType} />
            </div>
            <div style={{ width: 180 }} />
          </div>

          {/* MAIN PANEL GRID — 12-14px gaps so granite shows through */}
          <div
            style={{
              flex: 1,
              display: "grid",
              direction: "ltr",
              gridTemplateColumns: "26% 1fr 26%",
              gridTemplateRows: "1fr 1fr",
              gap: 12,
              padding: "6px 12px 8px",
              minHeight: 0,
              overflow: "hidden",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* R1 LEFT: Shabbat Times */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <ShabbatTimes times={data.shabbatTimes} />
            </div>

            {/* R1+R2 CENTER: Weekly Daf hero panel */}
            <div dir="rtl" style={{ gridRow: "span 2", minHeight: 0 }}>
              <WeeklyDaf title={data.weeklyDafTitle} content={data.weeklyDafContent} />
            </div>

            {/* R1 RIGHT: Davening Schedule */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <DaveningSchedule />
            </div>

            {/* R2 LEFT: Daily Zmanim */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <DailyZmanim times={data.dailyZmanim} pirkeiAvot={data.pirkeiAvotChapter} />
            </div>

            {/* R2 RIGHT: Shiurim */}
            <div dir="rtl" style={{ minHeight: 0, overflow: "hidden" }}>
              <ShiurimPanel shiurim={data.shiurim} />
            </div>
          </div>

          {/* BOTTOM TICKER */}
          <div dir="rtl" style={{ flexShrink: 0, position: "relative", zIndex: 2 }}>
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
