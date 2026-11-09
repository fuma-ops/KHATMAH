import { JUZ_LIST } from '../data/juzCondensedData';
import { SURAHS_LIST } from '../data/surahsData';
import { KHATMA_PLANS_CONFIG, KhatmaState } from './khatmaService';

export interface DayScheduleItem {
  dayNumber: number;
  startJuz: number;
  startPage: number;
  endJuz: number;
  endPage: number;
  pageCount: number;
  overallStartPage: number;
  overallEndPage: number;
  pageKeys: string[];
  juzLabelAr: string;
  juzLabelFr: string;
  surahRangeAr: string;
  surahRangeFr: string;
  startSurahNameAr: string;
  endSurahNameAr: string;
  startVerse: number;
  endVerse: number;
}

/**
 * Computes the exact day-by-day reading schedule for a given Khatma duration.
 * Accurately specifies the combined Juz and from which Surah to which Surah.
 */
export function getPlanScheduleBreakdown(durationDays: 3 | 5 | 7 | 9 | 15 | 30): DayScheduleItem[] {
  const plan = KHATMA_PLANS_CONFIG.find(p => p.durationDays === durationDays) || KHATMA_PLANS_CONFIG[5];
  const schedule = plan.schedule; // Array of page counts per day summing to 150
  const breakdown: DayScheduleItem[] = [];

  let currentOverallPage = 1;

  for (let d = 0; d < schedule.length; d++) {
    const dayNumber = d + 1;
    const pageCount = schedule[d];
    const overallStartPage = currentOverallPage;
    const overallEndPage = currentOverallPage + pageCount - 1;

    // Convert overall page index (1..150) to Juz (1..30) and Page within Juz (1..5)
    const startJuz = Math.floor((overallStartPage - 1) / 5) + 1;
    const startPage = ((overallStartPage - 1) % 5) + 1;
    const endJuz = Math.floor((overallEndPage - 1) / 5) + 1;
    const endPage = ((overallEndPage - 1) % 5) + 1;

    // Build list of page keys for this day e.g. ["1-1", "1-2", ...]
    const pageKeys: string[] = [];
    for (let p = overallStartPage; p <= overallEndPage; p++) {
      const j = Math.floor((p - 1) / 5) + 1;
      const pg = ((p - 1) % 5) + 1;
      pageKeys.push(`${j}-${pg}`);
    }

    // Lookup Juz metadata for authentic Surah boundaries
    const startJuzMeta = JUZ_LIST.find(j => j.juzNumber === startJuz) || JUZ_LIST[0];
    const endJuzMeta = JUZ_LIST.find(j => j.juzNumber === endJuz) || JUZ_LIST[JUZ_LIST.length - 1];

    const startSurah = SURAHS_LIST.find(s => s.number === startJuzMeta.startSurah);
    const endSurah = SURAHS_LIST.find(s => s.number === endJuzMeta.endSurah);

    const startSurahNameAr = startSurah ? startSurah.nameArabic : "الفاتحة";
    const endSurahNameAr = endSurah ? endSurah.nameArabic : "الناس";
    const startSurahNameFr = startSurah ? startSurah.nameTransliterated : "Al-Fatihah";
    const endSurahNameFr = endSurah ? endSurah.nameTransliterated : "An-Nas";

    // Juz label
    let juzLabelAr = "";
    let juzLabelFr = "";
    if (startJuz === endJuz) {
      juzLabelAr = `الجزء ${startJuz}`;
      juzLabelFr = `Juz ${startJuz}`;
    } else if (endJuz - startJuz === 1) {
      juzLabelAr = `الجزء ${startJuz} و ${endJuz}`;
      juzLabelFr = `Juz ${startJuz} & ${endJuz}`;
    } else {
      juzLabelAr = `الأجزاء ${startJuz} إلى ${endJuz}`;
      juzLabelFr = `Juz ${startJuz} à ${endJuz}`;
    }

    // Surah range label
    let surahRangeAr = "";
    let surahRangeFr = "";
    if (startSurahNameAr === endSurahNameAr) {
      surahRangeAr = `سورة ${startSurahNameAr} (${startJuzMeta.startVerse} - ${endJuzMeta.endVerse})`;
      surahRangeFr = `Sourate ${startSurahNameFr} (v.${startJuzMeta.startVerse} à ${endJuzMeta.endVerse})`;
    } else {
      surahRangeAr = `من سورة ${startSurahNameAr} إلى سورة ${endSurahNameAr}`;
      surahRangeFr = `De Sourate ${startSurahNameFr} à Sourate ${endSurahNameFr}`;
    }

    breakdown.push({
      dayNumber,
      startJuz,
      startPage,
      endJuz,
      endPage,
      pageCount,
      overallStartPage,
      overallEndPage,
      pageKeys,
      juzLabelAr,
      juzLabelFr,
      surahRangeAr,
      surahRangeFr,
      startSurahNameAr,
      endSurahNameAr,
      startVerse: startJuzMeta.startVerse,
      endVerse: endJuzMeta.endVerse
    });

    currentOverallPage += pageCount;
  }

  return breakdown;
}

/**
 * Returns the exact Surah and verse range for an individual page (1..5 of Juz 1..30).
 */
export function getPageSurahRange(juzNumber: number, pageIndex: number): { ar: string; fr: string } {
  const juz = JUZ_LIST.find(j => j.juzNumber === juzNumber) || JUZ_LIST[0];
  const startSurah = SURAHS_LIST.find(s => s.number === juz.startSurah);
  const endSurah = SURAHS_LIST.find(s => s.number === juz.endSurah);

  const startNameAr = startSurah ? startSurah.nameArabic : "الفاتحة";
  const endNameAr = endSurah ? endSurah.nameArabic : "الناس";
  const startNameFr = startSurah ? startSurah.nameTransliterated : "Al-Fatihah";
  const endNameFr = endSurah ? endSurah.nameTransliterated : "An-Nas";

  if (startNameAr === endNameAr) {
    return {
      ar: `سورة ${startNameAr} (الصفحة ${pageIndex}/5)`,
      fr: `Sourate ${startNameFr} (Page ${pageIndex}/5)`
    };
  }

  return {
    ar: `من سورة ${startNameAr} إلى ${endNameAr} (صفحة ${pageIndex}/5)`,
    fr: `De ${startNameFr} à ${endNameFr} (Page ${pageIndex}/5)`
  };
}

/**
 * Determines which day in the schedule the user is currently on.
 */
export function getCurrentDayInSchedule(khatma: KhatmaState): {
  currentDayNumber: number;
  currentDayItem: DayScheduleItem;
  schedule: DayScheduleItem[];
  completedDaysCount: number;
} {
  const schedule = getPlanScheduleBreakdown(khatma.durationDays);
  
  // Find first day with incomplete pages, or the last day if all completed
  let currentDayNumber = 1;
  let completedDaysCount = 0;

  for (let i = 0; i < schedule.length; i++) {
    const item = schedule[i];
    const isDayAllCompleted = item.pageKeys.every(k => khatma.completedPages.includes(k));
    if (isDayAllCompleted) {
      completedDaysCount++;
    } else if (currentDayNumber === 1 && !isDayAllCompleted) {
      currentDayNumber = item.dayNumber;
    }
  }

  if (completedDaysCount === schedule.length) {
    currentDayNumber = schedule.length;
  }

  const currentDayItem = schedule.find(d => d.dayNumber === currentDayNumber) || schedule[0];

  return {
    currentDayNumber,
    currentDayItem,
    schedule,
    completedDaysCount
  };
}
