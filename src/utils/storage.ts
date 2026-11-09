import { UserProgress, ReadingSettings } from '../types/quran';
import { todayISO } from './localDate';

const STORAGE_KEY_PROGRESS = 'alkhatma_user_progress_v2';
const STORAGE_KEY_SETTINGS = 'alkhatma_reading_settings_v2';

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 28,
  lineHeight: 2.2,
  fontFamily: 'amiri-quran',
  theme: 'mushaf', // classic mushaf cream parchment
  translationLang: 'fr',
  showTranslation: true,
  showTafsir: false,
  autoPlayNext: false,
  reciter: 'alafasy',
  thematicColors: true
};

const getTodayDateString = (): string => {
  return todayISO();
};

export const DEFAULT_PROGRESS: UserProgress = {
  completedPages: ['1-1'], // user starts with 1-1 completed as intro milestone
  currentPage: {
    juz: 1,
    page: 1
  },
  goalDays: 30,
  startDate: getTodayDateString(),
  lastReadDate: getTodayDateString(),
  currentStreak: 1,
  bookmarks: [
    {
      juz: 1,
      page: 1,
      timestamp: new Date().toISOString(),
      title: 'Début de la Khatma : Al-Fatihah'
    }
  ],
  prayerChecklist: {
    date: getTodayDateString(),
    fajr: true,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  },
  userNotes: {}
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    
    // Check if prayer checklist needs to be refreshed for a new day
    if (parsed.prayerChecklist && parsed.prayerChecklist.date !== today) {
      parsed.prayerChecklist = {
        date: today,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false
      };
    }
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function loadReadingSettings(): ReadingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReadingSettings(settings: ReadingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

// Chiffres « normaux » (0-9) partout dans l'app, y compris en arabe et dans les numéros de
// versets (choix du propriétaire, 09/11/2026). Le nom est gardé pour ne pas toucher aux appels.
export function toArabicNumerals(num: number): string {
  return String(num);
}
