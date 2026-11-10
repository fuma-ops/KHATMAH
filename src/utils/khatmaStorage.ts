import { KhatmaState } from '../services/khatmaService';
import { AppLanguage } from './translations';
import { todayISO } from './localDate';

const STORAGE_KEY_KHATMA = 'khatmati_user_state_v3';
// v4 : l'arabe devient la langue par défaut (la v3 enregistrait automatiquement le français par défaut).
const STORAGE_KEY_LANG = 'khatmah_user_lang_v4';

export const DEFAULT_KHATMA_STATE: KhatmaState = {
  khatmaNumber: 1,
  hasStarted: false,
  planId: 'plan-30-days',
  durationDays: 30,
  startDate: todayISO(),
  status: 'active',
  completedPages: [], // STRICTLY EMPTY: No progress until user validates!
  currentPosition: {
    juz: 1,
    page: 1 // ALWAYS starts at Al-Fatihah!
  },
  dailyLog: {},
  readingSessions: [],
  completedWirds: [],
  pastKhatmas: [],
  celebratedWirds: [],
  lastReadDate: todayISO(),
  bookmarks: []
};

export function loadKhatmaState(): KhatmaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KHATMA);
    if (!raw) return DEFAULT_KHATMA_STATE;
    const parsed = JSON.parse(raw);

    // Clean up any old mock milestone "1-1" that forced the reader to start at page 2
    if (parsed.completedPages && parsed.completedPages.length === 1 && parsed.completedPages[0] === '1-1' && !parsed.hasStarted) {
      parsed.completedPages = [];
      parsed.currentPosition = { juz: 1, page: 1 };
      parsed.dailyLog = {};
      parsed.readingSessions = [];
    }

    return { 
      ...DEFAULT_KHATMA_STATE, 
      ...parsed,
      currentPosition: parsed.currentPosition || { juz: 1, page: 1 }
    };
  } catch {
    return DEFAULT_KHATMA_STATE;
  }
}

export function saveKhatmaState(state: KhatmaState): void {
  try {
    localStorage.setItem(STORAGE_KEY_KHATMA, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving khatma state:', err);
  }
}

export function loadUserLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LANG);
    if (raw === 'ar' || raw === 'fr' || raw === 'en') {
      return raw;
    }
    return 'ar'; // langue par défaut : arabe
  } catch {
    return 'ar';
  }
}

export function saveUserLanguage(lang: AppLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  } catch (err) {
    console.error('Error saving user language:', err);
  }
}
