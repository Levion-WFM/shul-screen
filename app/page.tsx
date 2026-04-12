import DisplayBoard from "./components/DisplayBoard";
import DisplayGuardWrapper from "./components/DisplayGuardWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { DisplayData } from "./lib/types";

// Placeholder data mimicking the reference display board
const placeholderData: DisplayData = {
  shulName: "שערי אורח",
  shulSubtitle: "קהל",
  parshaName: "פרשת תזריע מצורע",
  parshaSubtitle: "מפטירין מלכים ב׳ ז:ג-כ׳",
  hebrewDate: "פורים • בית ניסן התשפ״ו",
  dayType: "זמני חול",
  pirkeiAvotChapter: "פרקי אבות א׳",

  shabbatTimes: [
    { label: "זמר הלכות שבת", time: "7:20" },
    { label: "מנחה ערב שבת", time: "6:58" },
    { label: "שקיעת החמה", time: "7:16" },
    { label: "הדלקת נרות", time: "6:25" },
    { label: "קבלת שבת", time: "6:45" },
    { label: "מנחה גדולה שבת", time: "8:32" },
    { label: "שקיעה שבת", time: "7:17" },
    { label: "צאת שבת", time: "8:05" },
  ],

  dailyZmanim: [
    { label: "עלות השחר", time: "5:12" },
    { label: "נץ החמה", time: "6:28" },
    { label: "סוף זמן ק״ש מג״א", time: "8:42" },
    { label: "סוף זמן ק״ש גר״א", time: "9:18" },
    { label: "סוף זמן תפילה", time: "10:22" },
    { label: "חצות", time: "12:48" },
    { label: "מנחה גדולה", time: "1:18" },
    { label: "מנחה קטנה", time: "4:30" },
    { label: "פלג המנחה", time: "5:46" },
    { label: "שקיעה", time: "7:16" },
    { label: "צאת הכוכבים", time: "7:52" },
  ],

  shiurim: [
    { time: "7:45", name: "שיעור בוקר", topic: "הלכות צניעות", icon: "book" },
    { time: "8:45", name: "שיעור משנה", topic: "מסכת ברכות פרק ג׳", icon: "book" },
    { time: "9:00", name: "שבת בוקר", topic: "הלכות שבת", icon: "book" },
    { time: "8:30", name: "דף היומי", topic: "מסכת בבא קמא דף ל״ב", icon: "book" },
  ],

  weeklyDafTitle: "דאלי השבוע",
  weeklyDafContent: "הדף היומי • מסכת בבא קמא • פרק שלישי",

  announcements: [
    { text: "שיעור מיוחד ביום שלישי בשעה 8:00" },
    { text: "קידוש גדול בשבת פרשת תזריע מצורע" },
  ],
  moladInfo: "מולד אייר על שישי 05:18",
  liturgicalNotes: "מורידי הטל — חזן ברכה",
};

export default function Home() {
  return (
    <ErrorBoundary>
      <DisplayGuardWrapper>
        <DisplayBoard data={placeholderData} />
      </DisplayGuardWrapper>
    </ErrorBoundary>
  );
}
