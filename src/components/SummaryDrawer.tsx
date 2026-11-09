import React from 'react';
import { X, Sparkles, BookOpen, Lightbulb, HelpCircle } from 'lucide-react';
import { CondensedPage, ReadingSettings } from '../types/quran';

interface SummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: CondensedPage;
  settings: ReadingSettings;
}

export const SummaryDrawer: React.FC<SummaryDrawerProps> = ({
  isOpen,
  onClose,
  pageData,
  settings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Tafsir & Résumé Thématique
              </h3>
              <p className="text-xs text-stone-500">
                Juz {pageData.juzNumber} · Page {pageData.pageIndex} sur 5 ({pageData.surahRange})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Theme Title */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
            <div className="font-arabic text-xl font-bold text-emerald-900 dark:text-emerald-300">
              {pageData.themeTitleArabic}
            </div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              {pageData.titleFrench}
            </div>
          </div>

          {/* Core Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Explication Essentielle
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {settings.translationLang === 'fr' ? pageData.summaryFrench : pageData.summaryEnglish}
            </p>
          </div>

          {/* Key Lessons */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Enseignements Majeurs & Règles d'Or</span>
            </h4>
            <div className="space-y-2">
              {pageData.keyLessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                >
                  <div className="font-bold text-xs text-emerald-900 dark:text-emerald-400">
                    {lesson.point}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {lesson.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary */}
          {pageData.vocabulary.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Mots Clés & Vocabulaire Remarquable</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pageData.vocabulary.map((voc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-300">
                        {voc.arabic}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {voc.transliteration}
                      </span>
                    </div>
                    <div className="text-xs text-stone-700 dark:text-stone-300 mt-1">
                      {voc.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tadabbur Action */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Action & Méditation Pratique (Tadabbur)</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-950 dark:text-amber-100">
              {pageData.tadabburReflection}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors"
          >
            Fermer le Résumé
          </button>
        </div>
      </div>
    </div>
  );
};
