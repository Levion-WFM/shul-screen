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
          {/* Main grid */}
          <div
            className="flex-1 grid gap-2 p-3"
            style={{
              gridTemplateColumns: "28% 1fr 28%",
              gridTemplateRows: "auto auto 1fr auto",
              minHeight: 0,
            }}
          >
            {/* Row 1: Parsha (left) | Shul Header (center) | Calendar top area (right) */}
            <div className="flex flex-col">
              <ParshaBanner
                parshaName={data.parshaName}
                parshaSubtitle={data.parshaSubtitle}
              />
            </div>

            <div className="flex flex-col items-center row-span-1">
              <ShulHeader
                shulName={data.shulName}
                shulSubtitle={data.shulSubtitle}
              />
            </div>

            <div className="row-span-2">
              <CalendarGrid />
            </div>

            {/* Row 2: Shabbat Times (left) | Clock (center) */}
            <div className="row-span-2">
              <ShabbatTimes times={data.shabbatTimes} />
            </div>

            <div className="flex flex-col">
              <LiveClock
                hebrewDate={data.hebrewDate}
                dayType={data.dayType}
              />
            </div>

            {/* Row 3: Daily Zmanim (left) | Weekly Daf (center) | Shiurim (right) */}
            <div>
              <DailyZmanim
                times={data.dailyZmanim}
                pirkeiAvot={data.pirkeiAvotChapter}
              />
            </div>

            <div>
              <WeeklyDaf
                title={data.weeklyDafTitle}
                content={data.weeklyDafContent}
              />
            </div>

            <div>
              <ShiurimPanel shiurim={data.shiurim} />
            </div>
          </div>

          {/* Bottom ticker bar */}
          <BottomTicker
            announcements={data.announcements.map((a) => a.text)}
            moladInfo={data.moladInfo}
            liturgicalNotes={data.liturgicalNotes}
          />
        </div>
      </div>
    </div>
  );
}
