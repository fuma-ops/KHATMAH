export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameEnglish: string;
  nameFrench: string;
  revelationType: RevelationType;
  versesCount: number;
  startJuz: number;
}

export interface VerseItem {
  id: number;
  surahNumber: number;
  verseNumber: number;
  textArabic: string;
  textFrench: string;
  textEnglish: string;
  audioUrl?: string;
}

export interface CondensedPage {
  juzNumber: number;
  pageIndex: number; // 1 to 5
  overallPageNumber: number; // 1 to 150
  surahRange: string;
  verseRange: string;
  titleFrench: string;
  titleEnglish: string;
  themeTitleArabic: string;
  summaryFrench: string;
  summaryEnglish: string;
  keyLessons: {
    point: string;
    description: string;
  }[];
  vocabulary: {
    arabic: string;
    transliteration: string;
    meaning: string;
  }[];
  tadabburReflection: string;
  verses: VerseItem[];
  approxReadingTimeMinutes: number; // typically 3-4 min
}

export interface JuzInfo {
  juzNumber: number;
  nameArabic: string;
  surahRange: string;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
  totalCondensedPages: number; // always 5
  mainThemesFrench: string;
  mainThemesEnglish: string;
}

export type ReadingTheme = 'mushaf' | 'dark' | 'white';
export type ArabicFontFamily = 'amiri-quran' | 'scheherazade' | 'amiri';
export type TranslationLang = 'fr' | 'en';

export interface ReadingSettings {
  fontSize: number; // 24 to 46
  lineHeight: number; // 1.8 to 2.8
  fontFamily: ArabicFontFamily;
  theme: ReadingTheme;
  translationLang: TranslationLang;
  showTranslation: boolean;
  showTafsir: boolean;
  autoPlayNext: boolean;
  reciter: 'alafasy' | 'husary' | 'abdulbasit';
  thematicColors?: boolean;
}

export interface KhatmaGoal {
  id: string;
  title: string;
  targetDays: number;
  pagesPerDay: number; // e.g. 5 pages/day = 30 days
  juzPerDay: number;
  description: string;
  scheduleDescription: string;
}

export interface UserProgress {
  completedPages: string[]; // Set of "juz-page" e.g. "1-1", "1-2" (out of 150)
  currentPage: {
    juz: number;
    page: number; // 1 to 5
  };
  goalDays: number; // e.g. 30, 15, 10, 7
  startDate: string; // ISO
  lastReadDate: string; // ISO
  currentStreak: number;
  bookmarks: {
    juz: number;
    page: number;
    timestamp: string;
    title: string;
  }[];
  prayerChecklist: {
    date: string;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  userNotes: Record<string, string>; // "juz-page" -> personal reflection note
}
