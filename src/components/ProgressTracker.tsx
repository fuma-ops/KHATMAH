import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  Calendar, 
  Bookmark, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Trash2,
  Edit3
} from 'lucide-react';
import { UserProgress } from '../types/quran';

interface ProgressTrackerProps {
  progress: UserProgress;
  onSelectPage: (juz: number, page: number) => void;
  onOpenDua: () => void;
  onSaveNote: (juz: number, page: number, note: string) => void;
  onDeleteBookmark: (juz: number, page: number) => void;
  onResetProgress: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  onSelectPage,
  onOpenDua,
  onSaveNote,
  onDeleteBookmark,
  onResetProgress
}) => {
  const totalCompleted = progress.completedPages.length;
  const percentage = Math.round((totalCompleted / 150) * 100);

  // Completed Juz count (a Juz is completed if all 5 pages are in completedPages)
  const completedJuzCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(juzNum => {
    return [1, 2, 3, 4, 5].every(p => progress.completedPages.includes(`${juzNum}-${p}`));
  }).length;

  // Note editor state
  const [selectedNotePage, setSelectedNotePage] = useState<string>(`${progress.currentPage.juz}-${progress.currentPage.page}`);
  const [noteContent, setNoteContent] = useState<string>(progress.userNotes[selectedNotePage] || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveNote = () => {
    const [juzStr, pageStr] = selectedNotePage.split('-');
    onSaveNote(parseInt(juzStr, 10), parseInt(pageStr, 10), noteContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
          <span>Suivi & Statistiques de votre Khatma</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Mesurez vos progrès en temps réel et gardez une trace vivante de vos méditations coraniques.
        </p>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Pages */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pages Lues</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 dark:text-emerald-300 mt-1">
            {totalCompleted} <span className="text-sm font-normal text-stone-400">/ 150</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">{percentage}% de la Khatma achevée</div>
        </div>

        {/* KPI 2: Juz complétés */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Juz Terminés</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 dark:text-emerald-300 mt-1">
            {completedJuzCount} <span className="text-sm font-normal text-stone-400">/ 30</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">1 Juz = 5 pages condensées</div>
        </div>

        {/* KPI 3: Série de jours (Streak) */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Série de Récitation</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {progress.currentStreak} <span className="text-sm font-normal text-stone-400">jours</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">Assiduité continue</div>
        </div>

        {/* KPI 4: Objectif */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Objectif Fixé</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
            {progress.goalDays} <span className="text-sm font-normal text-stone-400">jours</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">Rythme : {Math.ceil(150 / progress.goalDays)} pages / jour</div>
        </div>
      </div>

      {/* Progress Bar & Visual Gauge */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Avancement Global vers la Clôture
          </span>
          <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-400">
            {percentage}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
          <div
            className="h-full bg-emerald-800 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2 pt-2">
          <span>Position actuelle : Juz {progress.currentPage.juz} · Page {progress.currentPage.page}/5</span>
          {percentage >= 100 ? (
            <button
              onClick={onOpenDua}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ouvrir le Du'a de Khatm Al-Quran</span>
            </button>
          ) : (
            <span>Il vous reste {150 - totalCompleted} pages pour terminer votre Khatma</span>
          )}
        </div>
      </div>

      {/* Two columns: Bookmarks list & Personal Reflection Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks */}
        <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>Signets Enregistrés</span>
          </h3>

          {progress.bookmarks.length === 0 ? (
            <p className="text-xs text-stone-400 italic">Aucun signet enregistré pour l'instant.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {progress.bookmarks.map((bm, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between gap-3"
                >
                  <button
                    onClick={() => onSelectPage(bm.juz, bm.page)}
                    className="text-left flex-1 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                  >
                    <div className="text-xs font-bold">
                      Juz {bm.juz} · Page {bm.page}/5
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">{bm.title}</div>
                  </button>

                  <button
                    onClick={() => onDeleteBookmark(bm.juz, bm.page)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer ce signet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reflection Notes (Tadabbur) */}
        <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-700" />
              <span>Carnet de Méditation (Tadabbur)</span>
            </h3>

            {/* Page selection dropdown */}
            <select
              value={selectedNotePage}
              onChange={(e) => {
                setSelectedNotePage(e.target.value);
                setNoteContent(progress.userNotes[e.target.value] || '');
              }}
              className="text-xs px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200"
            >
              {Array.from({ length: 30 }, (_, j) => j + 1).map(juz => 
                [1, 2, 3, 4, 5].map(p => (
                  <option key={`${juz}-${p}`} value={`${juz}-${p}`}>
                    Juz {juz} · Page {p}
                  </option>
                ))
              )}
            </select>
          </div>

          <p className="text-xs text-stone-500">
            Notez les leçons ou invocations personnelles inspirées par les versets de cette page :
          </p>

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
            placeholder="Écrivez vos pensées et résolutions spirituelles..."
            className="w-full p-3 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-700 font-medium">
              {isSaved ? 'Note enregistrée avec succès ✓' : ''}
            </span>
            <button
              onClick={handleSaveNote}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-700 transition-colors"
            >
              Enregistrer ma note
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="pt-6 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
            Réinitialiser ou Commencer une Nouvelle Khatma
          </div>
          <div className="text-[11px] text-stone-500">
            Remet à zéro les 150 pages cochées tout en conservant vos signets et vos notes.
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Êtes-vous sûr de vouloir réinitialiser vos pages lues pour entamer une nouvelle Khatma ?")) {
              onResetProgress();
            }
          }}
          className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-red-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Nouvelle Khatma</span>
        </button>
      </div>
    </div>
  );
};
