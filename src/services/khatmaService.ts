import { todayISO } from '../utils/localDate';
export interface KhatmaPlanConfig {
  id: string;
  durationDays: 3 | 5 | 7 | 9 | 15 | 30;
  nameKey: string;
  dailyPages: number;
  juzPerDayDesc: string;
  schedule: number[]; // exact pages per day array (length === durationDays, sum === 150)
}

/**
 * Generates an exact, balanced distribution of 150 pages across N days.
 * The sum of all days strictly equals 150 pages.
 */
export function generateBalancedSchedule(durationDays: number): number[] {
  const base = Math.floor(150 / durationDays);
  const remainder = 150 % durationDays;
  const schedule: number[] = [];

  for (let day = 0; day < durationDays; day++) {
    // Distribute remainder across the initial days
    schedule.push(base + (day < remainder ? 1 : 0));
  }
  return schedule;
}

export const KHATMA_PLANS_CONFIG: KhatmaPlanConfig[] = [
  {
    id: 'plan-3-days',
    durationDays: 3,
    nameKey: '3 Days',
    dailyPages: 50,
    juzPerDayDesc: '10 Juz / jour (50 pages)',
    schedule: generateBalancedSchedule(3) // [50, 50, 50]
  },
  {
    id: 'plan-5-days',
    durationDays: 5,
    nameKey: '5 Days',
    dailyPages: 30,
    juzPerDayDesc: '6 Juz / jour (30 pages)',
    schedule: generateBalancedSchedule(5) // [30, 30, 30, 30, 30]
  },
  {
    id: 'plan-7-days',
    durationDays: 7,
    nameKey: '7 Days',
    dailyPages: 21,
    juzPerDayDesc: '4.3 Juz / jour (21–22 pages)',
    schedule: generateBalancedSchedule(7) // [22, 22, 22, 21, 21, 21, 21] sum = 150
  },
  {
    id: 'plan-9-days',
    durationDays: 9,
    nameKey: '9 Days',
    dailyPages: 17,
    juzPerDayDesc: '3.3 Juz / jour (16–17 pages)',
    schedule: generateBalancedSchedule(9) // [17, 17, 17, 17, 17, 17, 16, 16, 16] sum = 150
  },
  {
    id: 'plan-15-days',
    durationDays: 15,
    nameKey: '15 Days',
    dailyPages: 10,
    juzPerDayDesc: '2 Juz / jour (10 pages)',
    schedule: generateBalancedSchedule(15) // 15 * 10 = 150
  },
  {
    id: 'plan-30-days',
    durationDays: 30,
    nameKey: '30 Days',
    dailyPages: 5,
    juzPerDayDesc: '1 Juz / jour (5 pages)',
    schedule: generateBalancedSchedule(30) // 30 * 5 = 150
  }
];

export interface ReadingSessionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: string; // ISO
  juzNumber: number;
  pageNumber: number; // 1 to 5
  overallPage: number; // 1 to 150
  surahRangeArabic: string;
  surahRangeTranslit: string;
}

export interface CompletedWirdRecord {
  wirdNumber: number;
  planDuration: number;
  juzLabel: string;
  surahRange: string;
  completedAt: string; // ISO timestamp
  completedTime: string; // HH:MM
  completedDate: string; // YYYY-MM-DD
  pagesCount: number;
}

export interface PastKhatmaRecord {
  id: string;
  khatmaNumber: number;
  durationDays: 3 | 5 | 7 | 9 | 15 | 30;
  planId: string;
  startedAt: string; // ISO
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  completedAt: string; // ISO
  completedDate: string; // YYYY-MM-DD
  completedTime: string; // HH:MM
  monthYear: string; // e.g. "2026-11"
  year: number; // 2026
  wirds: CompletedWirdRecord[];
}

export interface KhatmaState {
  khatmaNumber: number; // 1, 2, 3...
  hasStarted: boolean; // true once user starts reading with Isti'adhah
  planId: string;
  durationDays: 3 | 5 | 7 | 9 | 15 | 30;
  startDate: string; // ISO date string YYYY-MM-DD
  startDateTime?: string; // ISO date & time string e.g. YYYY-MM-DDTHH:mm:ss
  status: 'active' | 'paused' | 'completed';
  completedPages: string[]; // ["1-1", "1-2", ...] STRICTLY EMPTY AT START
  currentPosition: {
    juz: number; // 1 to 30
    page: number; // 1 to 5
  };
  dailyLog: Record<string, number>; // dateString -> count of pages read that day
  readingSessions?: ReadingSessionEntry[];
  completedWirds?: CompletedWirdRecord[];
  pastKhatmas?: PastKhatmaRecord[];
  celebratedWirds?: string[]; // array of wird identifiers (e.g. "wird-1", "wird-2")
  // Signet de reprise : le verset où l'on s'est arrêté au milieu d'une page.
  resumeMarker?: { juz: number; page: number; verseKey: string; savedAt: string } | null;
  lastReadDate: string;
  bookmarks: {
    juz: number;
    page: number;
    verseKey?: string;
    timestamp: string;
    note?: string;
  }[];
}

/**
 * Calculates redistribution of remaining unread pages across remaining days
 * if the user has missed days or fallen behind, ensuring they complete on time!
 */
export function calculateRedistribution(
  khatma: KhatmaState
): {
  remainingPages: number;
  remainingDays: number;
  newDailyTarget: number;
  isBehind: boolean;
  isOnTrack: boolean;
} {
  const totalCompleted = khatma.completedPages.length;
  const remainingPages = Math.max(0, 150 - totalCompleted);

  const start = new Date(khatma.startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const remainingDays = Math.max(1, khatma.durationDays - daysElapsed);
  const newDailyTarget = Math.ceil(remainingPages / remainingDays);

  const plan = KHATMA_PLANS_CONFIG.find(p => p.durationDays === khatma.durationDays) || KHATMA_PLANS_CONFIG[5];
  // Cumul exact du programme (les jours n'ont pas tous le même nombre de pages, ex. 22/21 en 7 jours).
  const expectedCompletedByNow = Math.min(150, plan.schedule.slice(0, daysElapsed).reduce((t, n) => t + n, 0));

  return {
    remainingPages,
    remainingDays,
    newDailyTarget,
    isBehind: totalCompleted < expectedCompletedByNow,
    isOnTrack: totalCompleted >= expectedCompletedByNow
  };
}

/**
 * Calculates today's assigned quota of pages and completion progress for today.
 */
export function getTodaysAssignedTarget(khatma: KhatmaState): {
  targetPages: number;
  completedToday: number;
  progressPercent: number;
} {
  const todayStr = todayISO();
  const completedToday = khatma.dailyLog[todayStr] || 0;

  const redist = calculateRedistribution(khatma);
  const targetPages = Math.max(1, redist.newDailyTarget);
  const progressPercent = Math.min(100, Math.round((completedToday / targetPages) * 100));

  return {
    targetPages,
    completedToday,
    progressPercent
  };
}
