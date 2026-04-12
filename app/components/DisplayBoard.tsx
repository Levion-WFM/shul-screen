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
    <div className="w-screen h-screen flex items-center justify-center bg-[#050510]">
      {/* Outer gold frame border */}
      <div className="board-outer-frame w-full h-full max-w-[1920px] max-h-[1080px]">
        <div className="board-inner flex flex-col h-full">
          {/*
            Main 3-column layout — force LTR on grid so columns don't flip,
            but each cell's content stays RTL via dir="rtl"
          */}
          <div
            className="flex-1 grid gap-2 p-3 overflow-hidden"
            style={{
              direction: "ltr",
              gridTemplateColumns: "27% 1fr 27%",
              gridTemplateRows: "auto 1fr 1fr",
              minHeight: 0,
            }}
          >
            {/* ===== LEFT COLUMN ===== */}
            {/* Top-left: Parsha Banner */}
            <div dir="rtl" className="self-start">
              <ParshaBanner
                parshaName={data.parshaName}
                parshaSubtitle={data.parshaSubtitle}
              />
            </div>

            {/* ===== CENTER COLUMN ===== */}
            {/* Top-center: Shul Header + Clock */}
            <div dir="rtl" className="flex flex-col items-center">
              <ShulHeader
                shulName={data.shulName}
                shulSubtitle={data.shulSubtitle}
              />
              <LiveClock
                hebrewDate={data.hebrewDate}
                dayType={data.dayType}
              />
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            {/* Top-right: Calendar */}
            <div dir="rtl" className="row-span-1">
              <CalendarGrid />
            </div>

            {/* Left row 2: Shabbat Times */}
            <div dir="rtl">
              <ShabbatTimes times={data.shabbatTimes} />
            </div>

            {/* Center row 2: Weekly Daf (centerpiece) — spans 2 rows */}
            <div dir="rtl" className="row-span-2">
              <WeeklyDaf
                title={data.weeklyDafTitle}
                content={data.weeklyDafContent}
              />
            </div>

            {/* Right row 2: Shiurim */}
            <div dir="rtl">
              <ShiurimPanel shiurim={data.shiurim} />
            </div>

            {/* Left row 3: Daily Zmanim */}
            <div dir="rtl">
              <DailyZmanim
                times={data.dailyZmanim}
                pirkeiAvot={data.pirkeiAvotChapter}
              />
            </div>

            {/* Right row 3: empty or additional content */}
            <div />
          </div>

          {/* Bottom ticker bar */}
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
