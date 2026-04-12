export interface TimeEntry {
  label: string;
  time: string;
}

export interface ShiurEntry {
  time: string;
  name: string;
  topic: string;
  icon?: string;
}

export interface AnnouncementEntry {
  text: string;
}

export interface DisplayData {
  shulName: string;
  shulSubtitle: string;
  parshaName: string;
  parshaSubtitle: string;
  hebrewDate: string;
  dayType: string;
  pirkeiAvotChapter: string;
  shabbatTimes: TimeEntry[];
  dailyZmanim: TimeEntry[];
  shiurim: ShiurEntry[];
  weeklyDafTitle: string;
  weeklyDafContent: string;
  announcements: AnnouncementEntry[];
  moladInfo: string;
  liturgicalNotes: string;
}
