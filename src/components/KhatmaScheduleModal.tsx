import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AppLanguage } from '../utils/translations';
import { KhatmaState, KHATMA_PLANS_CONFIG } from '../services/khatmaService';
import { getPlanScheduleBreakdown, DayScheduleItem } from '../services/khatmaScheduleHelper';

interface KhatmaScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  khatma: KhatmaState;
  onSelectPlan: (durationDays: 3 | 5 | 7 | 9 | 15 | 30) => void;
  onStartDayReading: (juz: number, page: number) => void;
}

export const KhatmaScheduleModal: React.FC<KhatmaScheduleModalProps> = ({
  isOpen,
  onClose,
  language,
  khatma,
  onSelectPlan,
  onStartDayReading
}) => {
  const isRtl = language === 'ar';
  const [selectedDuration, setSelectedDuration] = useState<3 | 5 | 7 | 9 | 15 | 30>(khatma.durationDays);

  if (!isOpen) return null;

  const schedule = getPlanScheduleBreakdown(selectedDuration);
  const activePlanConfig = KHATMA_PLANS_CONFIG.find(p => p.durationDays === selectedDuration) || KHATMA_PLANS_CONFIG[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FFFDF9] dark:bg-[#1A1816] border border-amber-300/80 dark:border-amber-600/40 shadow-2xl overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-amber-200/60 dark:border-stone-800 bg-amber-50/50 dark:bg-stone-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#064e3b] text-amber-300 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {language === 'ar' ? 'جدول ختم القرآن الكريم' : 'Programme détaillé de la Khatma'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'ar' 
                  ? `توزيع الأجزاء والسور اليومية لخطة الـ ${selectedDuration} يوماً` 
                  : `Répartition quotidienne des Juz et Sourates pour l'objectif de ${selectedDuration} jours`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duration Tabs (3, 5, 7, 9, 15, 30 days) */}
        <div className="p-3 sm:p-4 border-b border-amber-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/40 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {KHATMA_PLANS_CONFIG.map((plan) => {
              const isCurrentSelected = selectedDuration === plan.durationDays;
              const isUserActivePlan = khatma.durationDays === plan.durationDays;
              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedDuration(plan.durationDays);
                    onSelectPlan(plan.durationDays);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isCurrentSelected
                      ? 'bg-[#064e3b] text-white shadow-sm ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                  }`}
                >
                  <span>{plan.durationDays} {language === 'ar' ? (plan.durationDays <= 10 ? 'أيام' : 'يوماً') : 'jours'}</span>
                  {isUserActivePlan && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold">
                      {language === 'ar' ? 'خطتك' : 'Actif'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Pill for the Plan */}
        <div className="px-5 py-3 bg-amber-100/40 dark:bg-stone-850/60 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="font-semibold">{activePlanConfig.juzPerDayDesc}</span>
          </div>
          <div className="font-mono text-emerald-900 dark:text-emerald-300 font-bold">
            {schedule.length} {language === 'ar' ? 'يوماً' : 'jours'} · 150 {language === 'ar' ? 'صفحة' : 'pages'}
          </div>
        </div>

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-amber-100/50 dark:divide-stone-800">
          {schedule.map((day) => {
            const completedCount = day.pageKeys.filter(k => khatma.completedPages.includes(k)).length;
            const isDayFinished = completedCount === day.pageCount;
            const isPartiallyDone = completedCount > 0 && !isDayFinished;

            // Find first incomplete page of the day to jump directly to it
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
                className={`pt-3 first:pt-0 p-3 sm:p-4 rounded-2xl transition-all border ${
                  isDayFinished
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-700/40'
                    : isPartiallyDone
                    ? 'bg-amber-50/50 dark:bg-stone-900/60 border-amber-300/70 dark:border-amber-600/40'
                    : 'bg-white/80 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left (or Right in RTL): Day number, Juz range, and Surah range */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#064e3b] text-amber-200 text-xs font-bold font-mono">
                        {language === 'ar' ? `اليوم ${day.dayNumber}` : `Jour ${day.dayNumber}`}
                      </span>

                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        {language === 'ar' ? day.juzLabelAr : day.juzLabelFr}
                      </span>

                      <span className="text-[11px] text-stone-400 font-mono">
                        ({day.pageCount} {language === 'ar' ? (day.pageCount <= 10 ? 'صفحات' : 'صفحة') : 'pages'})
                      </span>

                      {/* Status Badge */}
                      {isDayFinished && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تم الورد ✓' : 'Terminé ✓'}</span>
                        </span>
                      )}
                    </div>

                    {/* From Which Surah to Which Surah */}
                    <div className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? day.surahRangeAr : day.surahRangeFr}</span>
                    </div>

                    <div className="text-[11px] text-stone-500 font-mono">
                      {language === 'ar' 
                        ? `صفحات المصحف الرقمي: ${day.overallStartPage} إلى ${day.overallEndPage} (من 150)` 
                        : `Pages digitales: ${day.overallStartPage} à ${day.overallEndPage} (sur 150)`}
                    </div>
                  </div>

                  {/* Right: Action CTA */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onStartDayReading(targetJuz, targetPage);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDayFinished
                          ? 'border border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-xs'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {isDayFinished
                          ? (language === 'ar' ? 'مراجعة ورد اليوم' : 'Relire ce jour')
                          : (language === 'ar' ? 'اقرأ ورد هذا اليوم' : 'Lire ce jour')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-amber-200/60 dark:border-stone-800 bg-amber-50/40 dark:bg-stone-900/40 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <span>{language === 'ar' ? 'القرآن الكريم 100% كامل دون حذف' : 'Coran 100% intégral sans omission'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold"
          >
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
