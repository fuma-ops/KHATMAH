import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { AppLanguage } from '../utils/translations';
import { THEME_DEFINITIONS, VerseThemeCategory } from '../services/verseThematicService';

interface ThematicLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  language: AppLanguage;
}

export const ThematicLegendModal: React.FC<ThematicLegendModalProps> = ({
  isOpen,
  onClose,
  isEnabled,
  onToggle,
  language
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';
  const categories: VerseThemeCategory[] = ['mercy', 'tawhid', 'commandments', 'prophets', 'warning'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-[#FAF7EE] dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-amber-200 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{isAr ? 'المصحف الموضوعي الملون' : 'Mushaf Thématique'}</span>
                <span className="text-[10px] font-medium py-0.5 px-2 rounded-full bg-emerald-800/10 text-emerald-800 dark:text-emerald-300">
                  {isAr ? 'دلالات الألوان' : 'Signification'}
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                {isAr 
                  ? 'ألوان هادئة تسهل متابعة القراءة وتدبر معاني الآيات الكريمة' 
                  : 'Des repères visuels pour reposer le regard et mieux suivre le fil des versets.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Toggle Banner */}
        <div className="px-4 py-3 bg-white/40 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <span className="text-xs font-semibold">
              {isAr ? 'تفعيل تلوين الآيات حسب المعنى' : 'Activer les couleurs thématiques'}
            </span>
          </div>

          <button
            onClick={() => onToggle(!isEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isEnabled ? 'bg-emerald-800' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* The 5 Thematic Colors List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {categories.map((catKey) => {
            const def = THEME_DEFINITIONS[catKey];
            return (
              <div
                key={catKey}
                className={`p-3 rounded-xl border transition-all ${def.badgeBg} ${def.badgeBorder} flex items-start gap-3`}
              >
                <div 
                  className="w-4 h-4 rounded-full shrink-0 mt-0.5 shadow-xs ring-2 ring-white dark:ring-stone-900"
                  style={{ backgroundColor: def.dotColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: def.colorLight }}
                    >
                      {isAr ? def.labelAr : def.labelFr}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                    {isAr ? def.descriptionAr : def.descriptionFr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/80 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            {isEnabled 
              ? (isAr ? '✓ التلوين الموضوعي مفعل' : '✓ Couleurs actives sur le texte')
              : (isAr ? 'التلوين متوقف (نص عادي)' : 'Couleurs désactivées')}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            {isAr ? 'إغلاق ومتابعة القراءة' : 'Fermer & Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};
