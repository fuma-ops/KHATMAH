import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  RotateCcw, 
  Pause, 
  Play, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  KHATMA_PLANS_CONFIG, 
  KhatmaPlanConfig, 
  KhatmaState, 
  calculateRedistribution,
  juzPerDayLabel
} from '../services/khatmaService';
import { getPlanScheduleBreakdown } from '../services/khatmaScheduleHelper';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface KhatmaSelectorProps {
  khatma: KhatmaState;
  language: AppLanguage;
  onSelectPlan: (durationDays: 3 | 5 | 7 | 9 | 15 | 30) => void;
  onTogglePause: () => void;
  onRestartKhatma: () => void;
  onStartDayReading?: (juz: number, page: number) => void;
}

export const KhatmaSelector: React.FC<KhatmaSelectorProps> = ({
  khatma,
  language,
  onSelectPlan,
  onTogglePause,
  onRestartKhatma,
  onStartDayReading
}) => {
  const t = TRANSLATIONS[language];
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const redist = calculateRedistribution(khatma);
  const scheduleBreakdown = getPlanScheduleBreakdown(khatma.durationDays);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          {t.appName} · {t.navMyKhatma}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
          {t.selectPlanTitle}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
          {t.selectPlanSubtitle}
        </p>
      </div>

      {/* Redistribution banner if user is behind or days elapsed */}
      {redist.isBehind && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Redistribution automatique active :</span> Pour vous permettre de terminer votre Khatma en {khatma.durationDays} jours, vos {redist.remainingPages} pages restantes sont réparties sur les {redist.remainingDays} jours restants, soit environ <strong>{redist.newDailyTarget} pages par jour</strong>. Aucun progrès n'est perdu !
          </div>
        </div>
      )}

      {/* 6 Elegant Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KHATMA_PLANS_CONFIG.map((plan) => {
          const isSelected = khatma.durationDays === plan.durationDays;
          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.durationDays)}
              className={`cursor-pointer p-5 rounded-3xl border transition-all text-left flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-700 dark:border-emerald-500 ring-2 ring-emerald-700/20 shadow-sm'
                  : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-emerald-600'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {plan.durationDays} {t.planDaysUnit}
                  </span>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-emerald-800 text-amber-200">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {plan.nameKey}
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  {juzPerDayLabel(plan, language)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-900 dark:text-emerald-300 font-semibold">
                  {plan.dailyPages} {t.planDailyPages}
                </span>
                <span className="text-[11px] text-stone-400">
                  Total : 150 pages
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED DAY-BY-DAY SCHEDULE BREAKDOWN (Juz combined + Surah to Surah) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
              <span>{language === 'ar' ? `الجدول اليومي لخطة الـ ${khatma.durationDays} يوماً` : `Planning quotidien détaillé (${khatma.durationDays} jours)`}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'ar' 
                ? 'توزيع الأجزاء والسور بدقة لكل يوم مع إمكانية البدء المباشر' 
                : 'Détail exact des Juz et Sourates jour après jour avec accès direct à la lecture'}
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-[#064e3b] dark:text-emerald-400">
            {scheduleBreakdown.filter(d => d.pageKeys.every(k => khatma.completedPages.includes(k))).length} / {scheduleBreakdown.length} {language === 'ar' ? 'أيام منجزة' : 'jours terminés'}
          </div>
        </div>

        {/* Schedule Items Grid / List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {scheduleBreakdown.map((day) => {
            const completedCount = day.pageKeys.filter(k => khatma.completedPages.includes(k)).length;
            const isDayFinished = completedCount === day.pageCount;
            const isPartiallyDone = completedCount > 0 && !isDayFinished;

            let targetJuz = day.startJuz;
            let targetPage = day.startPage;
            for (const key of day.pageKeys) {
              if (!khatma.completedPages.includes(key)) {
                const [j, p] = key.split('-').map(Number);
                targetJuz = j;
                targetPage = p;
                break;
              }
            }

            return (
              <div
                key={day.dayNumber}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDayFinished
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50'
                    : isPartiallyDone
                    ? 'bg-amber-50/60 dark:bg-stone-850 border-amber-300/80 dark:border-amber-600/40'
                    : 'bg-[#FFFDF9] dark:bg-stone-850/60 border-stone-200 dark:border-stone-700/70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#064e3b] text-amber-200 text-xs font-bold font-mono">
                      {language === 'ar' ? `اليوم ${day.dayNumber}` : `Jour ${day.dayNumber}`}
                    </span>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      {language === 'ar' ? day.juzLabelAr : day.juzLabelFr}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      ({day.pageCount} {language === 'ar' ? 'صفحات' : 'pages'})
                    </span>

                    {isDayFinished && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'مكتمل ✓' : 'Terminé ✓'}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400">✦</span>
                    <span>{language === 'ar' ? day.surahRangeAr : day.surahRangeFr}</span>
                  </div>

                  <div className="text-[11px] text-stone-500 font-mono">
                    {language === 'ar' 
                      ? `الصفحات: ${day.overallStartPage} إلى ${day.overallEndPage} (من 150)` 
                      : `Pages: ${day.overallStartPage} à ${day.overallEndPage} (sur 150)`}
                  </div>
                </div>

                {onStartDayReading && (
                  <div className="flex items-center justify-end shrink-0">
                    <button
                      onClick={() => onStartDayReading(targetJuz, targetPage)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDayFinished
                          ? 'border border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-xs'
                      }`}
                    >
                      <span>
                        {isDayFinished
                          ? (language === 'ar' ? 'مراجعة ورد اليوم' : 'Relire ce jour')
                          : (language === 'ar' ? 'اقرأ ورد هذا اليوم' : 'Lire ce jour')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Management Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Gestion de votre Khatma
          </div>
          <div className="text-[11px] text-stone-500">
            Statut actuel : {khatma.status === 'active' ? t.statusActive : t.statusPaused} · Commencée le {khatma.startDate}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5"
          >
            {khatma.status === 'active' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t.pauseKhatma}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t.resumeKhatma}</span>
              </>
            )}
          </button>

          {/* Restart */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-red-600 hover:border-red-300 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.restartKhatma}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Restart */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.confirmRestartTitle}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {t.confirmRestartMsg}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={() => {
                  onRestartKhatma();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
              >
                {t.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
