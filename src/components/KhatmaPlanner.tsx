import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Flame, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Target
} from 'lucide-react';
import { KHATMA_PLANS, PRAYER_SCHEDULE_NAMES } from '../data/khatmaPlans';
import { UserProgress, ReadingSettings } from '../types/quran';

interface KhatmaPlannerProps {
  progress: UserProgress;
  onUpdateGoal: (days: number) => void;
  onTogglePrayerCheck: (prayerId: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onSelectPage: (juz: number, page: number) => void;
}

export const KhatmaPlanner: React.FC<KhatmaPlannerProps> = ({
  progress,
  onUpdateGoal,
  onTogglePrayerCheck,
  onSelectPage
}) => {
  const totalCompleted = progress.completedPages.length;
  const percentage = Math.round((totalCompleted / 150) * 100);

  // Selected plan calculation
  const currentPlan = KHATMA_PLANS.find(p => p.targetDays === progress.goalDays) || KHATMA_PLANS[0];

  // Estimated days remaining
  const pagesRemaining = 150 - totalCompleted;
  const daysRemaining = Math.max(1, Math.ceil(pagesRemaining / currentPlan.pagesPerDay));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Explainer of the 5-Page-Per-Juz Method */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-amber-50 p-6 sm:p-10 border border-emerald-800 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Coran 100% Intégral · Aucun verset omis</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Comment chaque Juz est condensé en 5 pages sans rien enlever ?
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Le Coran compte <strong>6 236 versets répartis sur 604 pages</strong> dans le Mushaf standard de Médine (environ 20 pages par Juz). 
            <strong className="text-amber-300 font-semibold"> Aucun verset n'est supprimé</strong> : chaque page de cette application regroupe exactement <strong>4 pages standard du Mushaf</strong> en un format condensé et lisible.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-emerald-300 font-medium">Structure Mathématique</div>
              <div className="text-sm font-bold text-white mt-0.5">4 pages standard = 1 page condensée</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-emerald-300 font-medium">Règle par Juz</div>
              <div className="text-sm font-bold text-white mt-0.5">5 pages condensées = 1 Juz complet</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-emerald-300 font-medium">Total du Coran</div>
              <div className="text-sm font-bold text-white mt-0.5">150 pages = 100% du Coran</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Khatma Speed Plans */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Choisissez votre Rythme d'Achèvement
          </h3>
          <p className="text-xs text-stone-500">
            Sélectionnez votre objectif pour calibrer vos pages quotidiennes et votre calendrier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KHATMA_PLANS.map((plan) => {
            const isSelected = progress.goalDays === plan.targetDays;
            return (
              <div
                key={plan.id}
                onClick={() => onUpdateGoal(plan.targetDays)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-700 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-emerald-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {plan.targetDays} Jours
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                </div>

                <div className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {plan.title.split('(')[0]}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                  {plan.description}
                </p>

                <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 p-2 rounded-lg">
                  {plan.pagesPerDay} pages / jour · {plan.juzPerDay} Juz / jour
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Prayer Routine Checklist for Today */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Routine Quotidienne : 1 Page après chaque Prière</span>
            </h3>
            <p className="text-xs text-stone-500">
              Cochez votre page lue après chaque prière pour maintenir votre régularité aujourd'hui.
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400">
            {Object.values(progress.prayerChecklist).filter(Boolean).length - 1} / 5 prières validées
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PRAYER_SCHEDULE_NAMES.map((prayer) => {
            const isChecked = progress.prayerChecklist[prayer.id as keyof typeof progress.prayerChecklist] as boolean;
            return (
              <button
                key={prayer.id}
                onClick={() => onTogglePrayerCheck(prayer.id as any)}
                className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  isChecked
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">{prayer.nameFr}</span>
                  <span className="font-arabic text-xs opacity-75">{prayer.nameAr}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                  <span className="text-[11px] font-mono">{prayer.pageSlot}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-amber-200' : 'text-stone-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 150-Page Visual Completion Matrix */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Matrice Complète des 150 Pages (30 Juz × 5 Pages)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Cliquez sur n'importe quelle case pour ouvrir instantanément cette page du Coran.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-3 h-3 rounded-xs bg-emerald-800 inline-block" />
              <span>Lue</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-3 h-3 rounded-xs ring-2 ring-emerald-600 bg-amber-400 inline-block" />
              <span>Actuelle</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-3 h-3 rounded-xs bg-stone-200 dark:bg-stone-700 inline-block" />
              <span>À lire</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid (30 Juz rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const completedInThisJuz = [1, 2, 3, 4, 5].filter(p => 
              progress.completedPages.includes(`${juzNum}-${p}`)
            ).length;
            const isJuzComplete = completedInThisJuz === 5;

            return (
              <div 
                key={juzNum}
                className={`p-3 rounded-xl border transition-colors ${
                  isJuzComplete 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                    : 'bg-stone-50/80 dark:bg-stone-900/40 border-stone-200 dark:border-stone-700/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Juz {juzNum}
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    {completedInThisJuz}/5
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((pageNum) => {
                    const key = `${juzNum}-${pageNum}`;
                    const isRead = progress.completedPages.includes(key);
                    const isCurrent = progress.currentPage.juz === juzNum && progress.currentPage.page === pageNum;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onSelectPage(juzNum, pageNum)}
                        className={`flex-1 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-stone-950 ring-2 ring-emerald-700 shadow-xs scale-105'
                            : isRead
                            ? 'bg-emerald-800 text-amber-200'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                        }`}
                        title={`Juz ${juzNum} · Page ${pageNum}/5 (${isRead ? 'Terminée' : 'À lire'})`}
                      >
                        P{pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
