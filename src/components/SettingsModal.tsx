import React from 'react';
import { X, Type, Palette, Globe, Volume2, Check, Download, RotateCcw } from 'lucide-react';
import { ReadingSettings, ArabicFontFamily, ReadingTheme } from '../types/quran';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  language: AppLanguage;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onUpdateLanguage: (lang: AppLanguage) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  language,
  onUpdateSettings,
  onUpdateLanguage,
  onResetSettings
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const fontOptions: { id: ArabicFontFamily; name: string }[] = [
    { id: 'amiri-quran', name: 'KFGQPC Uthmani / Amiri Quran (Classique)' },
    { id: 'scheherazade', name: 'Scheherazade New (Naskh Fluide)' },
    { id: 'amiri', name: 'Amiri Standard' }
  ];

  const themeOptions: { id: ReadingTheme; name: string; previewClass: string }[] = [
    { id: 'mushaf', name: t.themeParchment, previewClass: 'bg-[#FAF7EE] text-[#1C1917] border-[#E8DFC9]' },
    { id: 'dark', name: t.themeDark, previewClass: 'bg-stone-900 text-stone-100 border-stone-700' },
    { id: 'white', name: t.themeWhite, previewClass: 'bg-white text-stone-900 border-stone-200' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-200 flex items-center justify-center font-bold">
              ق
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.navSettings}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Langue de l'interface */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Langue de l'Interface (Language)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateLanguage('ar')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  language === 'ar'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => onUpdateLanguage('fr')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  language === 'fr'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => onUpdateLanguage('en')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Section 2: Thème de lecture */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Thème & Papier</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {themeOptions.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    onUpdateSettings({ theme: th.id });
                    if (th.id === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${th.previewClass} ${
                    settings.theme === th.id ? 'ring-2 ring-emerald-700 font-bold shadow-xs' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{th.name}</span>
                    {settings.theme === th.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Taille du texte coranique */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-stone-500">
                {t.fontSize}
              </label>
              <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold">
                {settings.fontSize} px
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="42"
              step="2"
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

          {/* Section 4: Installation PWA */}
          <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Installation Progressive Web App (PWA)
            </label>
            <PWAInstallButton language={language} variant="settings" />
          </div>

          {/* Section 5: Reset preferences */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <button
              onClick={onResetSettings}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les préférences d'affichage</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
