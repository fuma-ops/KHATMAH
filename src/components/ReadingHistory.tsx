import React from 'react';
import { 
  Bookmark, 
  Calendar, 
  Clock, 
  Trash2, 
  BookOpen, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  CalendarCheck,
  Trophy,
  Award
} from 'lucide-react';
import { KhatmaState, ReadingSessionEntry, PastKhatmaRecord, CompletedWirdRecord } from '../services/khatmaService';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { getPageSurahRange, getPlanScheduleBreakdown } from '../services/khatmaScheduleHelper';

interface ReadingHistoryProps {
  khatma: KhatmaState;
  language: AppLanguage;
  onSelectBookmark: (juz: number, page: number) => void;
  onDeleteBookmark: (juz: number, page: number) => void;
  onOpenQuranPage: (juz: number, page: number) => void;
}

export const ReadingHistory: React.FC<ReadingHistoryProps> = ({
  khatma,
  language,
  onSelectBookmark,
  onDeleteBookmark,
  onOpenQuranPage
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const totalCompleted = khatma.completedPages.length;
  const overallPercentage = Math.round((totalCompleted / 150) * 100);

  // Current month & year for stats
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = now.getFullYear();

  const pastKhatmas = khatma.pastKhatmas || [];
  const khatmasThisMonth = pastKhatmas.filter(k => k.monthYear === currentMonthKey).length;
  const khatmasThisYear = pastKhatmas.filter(k => k.year === currentYear).length;

  // Format start date and time
  const startDateTimeFormatted = () => {
    if (!khatma.hasStarted || !khatma.startDateTime) {
      return {
        dateStr: language === 'ar' ? 'في انتظار الانطلاق' : 'En attente du démarrage',
        timeStr: '--:--'
      };
    }
    try {
      const dt = new Date(khatma.startDateTime);
      const dateStr = dt.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = dt.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return { dateStr, timeStr };
    } catch {
      return { dateStr: khatma.startDate, timeStr: '10:00' };
    }
  };

  const { dateStr: startDateFormatted, timeStr: startTimeFormatted } = startDateTimeFormatted();

  // Schedule breakdown of the active plan
  const activeSchedule = getPlanScheduleBreakdown(khatma.durationDays);
  const completedWirdsList = khatma.completedWirds || [];

  // Group reading sessions by date (descending order)
  const sessions = khatma.readingSessions || [];
  const sessionsByDate: Record<string, ReadingSessionEntry[]> = {};

  sessions.forEach(session => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          {t.appName} · {t.navHistory}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-1">
          {language === 'ar' ? 'سجل الختمات وتتبع الأوراد اليومية' : 'Historique des Khatmas & Suivi des Wirds'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {language === 'ar' 
            ? 'تتبع دقيق لتاريخ وساعة بداية كل ختمة، وأوقات إتمام الأوراد، وعدد الختمات المنجزة شهرياً وسنوياً.' 
            : 'Traçabilité complète : heure exacte de démarrage, validation de chaque wird, et nombre de Khatmas accomplies par mois et par an.'}
        </p>
      </div>

      {/* 1. MONTHLY & YEARLY KHATMAS COUNTER CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Active Khatma Number */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-white shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'الختمة الجارية' : 'Khatma en cours'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif mt-1">
              {language === 'ar' ? `الختمة رقم ${khatma.khatmaNumber}` : `Khatma n° ${khatma.khatmaNumber}`}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              {khatma.hasStarted ? (language === 'ar' ? 'جارية وموثقة' : 'Active & documentée') : (language === 'ar' ? 'في انتظار البدء' : 'Non démarrée')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-amber-300" />
          </div>
        </div>

        {/* Khatmas Completed This Month */}
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'ختمات هذا الشهر' : 'Ce mois-ci'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#064e3b] dark:text-emerald-400 mt-1">
              {khatmasThisMonth} {language === 'ar' ? (khatmasThisMonth === 1 ? 'ختمة' : 'ختمات') : 'Khatma(s)'}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
              {currentMonthKey}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Khatmas Completed This Year */}
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'ختمات هذا العام' : 'Cette année'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
              {khatmasThisYear} {language === 'ar' ? (khatmasThisYear === 1 ? 'ختمة' : 'ختمات') : 'Khatma(s)'}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
              {currentYear}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* 2. ACTIVE KHATMA START & WIRDS PROGRESS CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-amber-50/40 to-[#FAF7EE] dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border border-amber-300/80 dark:border-stone-700 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#064e3b] text-amber-300 flex items-center justify-center shadow-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                {language === 'ar' ? `توثيق بداية الختمة رقم ${khatma.khatmaNumber}` : `Démarrage de la Khatma n° ${khatma.khatmaNumber}`}
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                {startDateFormatted}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-[#064e3b] dark:text-emerald-300 text-xs font-bold font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{startTimeFormatted}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-200/70 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-xs font-bold font-mono">
              {khatma.durationDays} {language === 'ar' ? 'يوماً' : 'jours'}
            </span>
          </div>
        </div>

        {/* Breakdown of each Wird in the active Khatma */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <span>{language === 'ar' ? 'حالة الأوراد اليومية في هذه الختمة :' : 'Suivi des Wirds de cette Khatma :'}</span>
            <span className="font-mono text-emerald-800 dark:text-emerald-400">
              {activeSchedule.filter(d => d.pageKeys.every(k => khatma.completedPages.includes(k))).length} / {activeSchedule.length} {language === 'ar' ? 'أوراد منجزة' : 'wirds terminés'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {activeSchedule.map((day) => {
              const isDayDone = day.pageKeys.every(k => khatma.completedPages.includes(k));
              const pagesDoneCount = day.pageKeys.filter(k => khatma.completedPages.includes(k)).length;
              const isPartiallyDone = pagesDoneCount > 0 && !isDayDone;

              // Find completed record if exists
              const finishedWirdRecord = completedWirdsList.find(w => w.wirdNumber === day.dayNumber);

              return (
                <div 
                  key={day.dayNumber}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isDayDone
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50'
                      : isPartiallyDone
                      ? 'bg-amber-50/80 dark:bg-stone-850 border-amber-300 dark:border-amber-600/50'
                      : 'bg-white/80 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-[#064e3b] text-amber-200 text-xs font-bold font-mono">
                        {language === 'ar' ? `الورد ${day.dayNumber}` : `Wird ${day.dayNumber}`}
                      </span>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {language === 'ar' ? day.juzLabelAr : day.juzLabelFr}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        ({day.pageCount} {language === 'ar' ? 'صفحات' : 'pages'})
                      </span>

                      {isDayDone && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تم الإنجاز ✓' : 'Terminé ✓'}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? day.surahRangeAr : day.surahRangeFr}</span>
                    </div>

                    {finishedWirdRecord && (
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {language === 'ar' 
                            ? `تم في: ${finishedWirdRecord.completedDate} الساعة ${finishedWirdRecord.completedTime}` 
                            : `Validé le : ${finishedWirdRecord.completedDate} à ${finishedWirdRecord.completedTime}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => onOpenQuranPage(day.startJuz, day.startPage)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:border-emerald-600 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      <span>{language === 'ar' ? 'عرض الورد' : 'Voir le wird'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. PAST COMPLETED KHATMAS ARCHIVE (If any completed) */}
      {pastKhatmas.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>{language === 'ar' ? 'أرشيف الختمات السابقة المكتملة' : 'Archives des Khatmas passées'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
              {pastKhatmas.length} {language === 'ar' ? 'ختمات مكتملة' : 'Khatmas accomplies'}
            </span>
          </div>

          <div className="space-y-3">
            {pastKhatmas.map((past, idx) => (
              <div 
                key={past.id || idx}
                className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-850/60 border border-amber-200/80 dark:border-stone-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                    {language === 'ar' ? `الختمة المباركة رقم ${past.khatmaNumber}` : `Khatma n° ${past.khatmaNumber}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-mono text-xs font-bold">
                    {past.durationDays} {language === 'ar' ? 'يوماً' : 'jours'}
                  </span>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-300 flex flex-wrap gap-4 pt-1 font-mono">
                  <span>
                    {language === 'ar' ? `البداية : ${past.startDate} (${past.startTime})` : `Début : ${past.startDate} (${past.startTime})`}
                  </span>
                  <span>
                    {language === 'ar' ? `الختام : ${past.completedDate} (${past.completedTime})` : `Fin : ${past.completedDate} (${past.completedTime})`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DETAILED DAILY SESSIONS LOG (Minute by minute) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <span>{language === 'ar' ? 'سجل القراءة اللحظي (الصفحات وتوقيتها)' : 'Journal des pages lues & horodatages'}</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {sortedDates.length} {language === 'ar' ? 'أيام مسجلة' : 'jours enregistrés'}
          </span>
        </div>

        {sortedDates.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-4 text-center">
            {language === 'ar' 
              ? 'لا توجد جلسات قراءة موثقة بعد. اختر مدة الختمة وابدأ الورد الأول لتوثيق قراءتك.' 
              : 'Aucune session enregistrée pour l\'instant. Choisissez un objectif et lancez votre wird.'}
          </p>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((dateStr) => {
              const daySessions = sessionsByDate[dateStr] || [];
              const dayPagesCount = daySessions.length;

              const dateObj = new Date(dateStr);
              const formattedDay = dateObj.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div 
                  key={dateStr}
                  className="rounded-2xl border border-amber-200/70 dark:border-stone-800 bg-[#FFFDF9]/60 dark:bg-stone-850/50 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-stone-800">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {formattedDay}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 font-mono font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                      {dayPagesCount} {language === 'ar' ? 'صفحات' : 'pages'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {daySessions.map((session, idx) => (
                      <div 
                        key={session.id || idx}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-100 dark:border-stone-800"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
                            {session.time}
                          </span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-300 shrink-0 font-mono">
                            Juz {session.juzNumber} · P.{session.pageNumber}
                          </span>
                          <span className="text-stone-700 dark:text-stone-300 font-serif truncate">
                            {language === 'ar' ? session.surahRangeArabic : session.surahRangeTranslit}
                          </span>
                        </div>

                        <button
                          onClick={() => onOpenQuranPage(session.juzNumber, session.pageNumber)}
                          className="p-1 text-emerald-800 dark:text-emerald-400 hover:underline text-[11px] font-bold shrink-0"
                        >
                          {language === 'ar' ? 'عرض' : 'Voir'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. BOOKMARKS SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>{t.bookmarksTitle}</span>
        </h3>

        {khatma.bookmarks.length === 0 ? (
          <p className="text-xs text-stone-400 italic">
            Aucun signet enregistré pour l'instant. Utilisez l'icône de signet pendant votre lecture.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {khatma.bookmarks.map((bm, idx) => {
              const surahInfo = getPageSurahRange(bm.juz, bm.page);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between gap-3"
                >
                  <button
                    onClick={() => onSelectBookmark(bm.juz, bm.page)}
                    className="text-start flex-1 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                  >
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Juz {bm.juz} · Page {bm.page} / 5
                    </div>
                    <div className="text-[11px] text-emerald-850 dark:text-emerald-400 font-serif mt-0.5 truncate">
                      {language === 'ar' ? surahInfo.ar : surahInfo.fr}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                      {new Date(bm.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}
                    </div>
                  </button>

                  <button
                    onClick={() => onDeleteBookmark(bm.juz, bm.page)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer ce signet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
