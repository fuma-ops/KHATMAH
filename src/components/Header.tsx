import React from 'react';
import { BookOpen, Settings, Sparkles, Moon, Sun, Globe } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { ReadingSettings } from '../types/quran';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'home' | 'khatma' | 'quran' | 'history' | 'settings';
  setCurrentTab: (tab: 'home' | 'khatma' | 'quran' | 'history' | 'settings') => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onOpenSettings: () => void;
  onContinueReading: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onContinueReading
}) => {
  const t = TRANSLATIONS[language];
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    if (settings.theme === 'mushaf') {
      onUpdateSettings({ theme: 'dark' });
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'dark') {
      onUpdateSettings({ theme: 'white' });
      document.documentElement.classList.remove('dark');
    } else {
      onUpdateSettings({ theme: 'mushaf' });
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-[#FAF7EE]/95 dark:bg-stone-900/95 border-stone-200 dark:border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#064e3b] text-amber-300 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              <span className="font-arabic">خ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
                KHATMAH <span className="text-xs font-arabic text-emerald-800 dark:text-emerald-400 font-bold">ختمة</span>
              </span>
              <span className="text-[10px] text-stone-500 font-sans -mt-0.5 hidden sm:inline">
                Your Quran. Your Pace. Your Khatma.
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line links) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => setCurrentTab('home')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-800 dark:hover:text-emerald-400 ${
              currentTab === 'home'
                ? 'text-emerald-900 dark:text-emerald-300 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700'
                : ''
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => setCurrentTab('khatma')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-800 dark:hover:text-emerald-400 ${
              currentTab === 'khatma'
                ? 'text-emerald-900 dark:text-emerald-300 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700'
                : ''
            }`}
          >
            {t.navMyKhatma}
          </button>
          <button
            onClick={() => setCurrentTab('quran')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-800 dark:hover:text-emerald-400 ${
              currentTab === 'quran'
                ? 'text-emerald-900 dark:text-emerald-300 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700'
                : ''
            }`}
          >
            {t.navQuran} (150 Pages)
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-800 dark:hover:text-emerald-400 ${
              currentTab === 'history'
                ? 'text-emerald-900 dark:text-emerald-300 font-bold underline underline-offset-8 decoration-2 decoration-emerald-700'
                : ''
            }`}
          >
            {t.navHistory}
          </button>
        </nav>

        {/* Zone 3: Language Toggle, PWA Install, Theme & Primary Continue Reading Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton language={language} variant="header" />

          {/* Language Switcher */}
          <div className="flex items-center p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ar' ? 'bg-emerald-800 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'fr' ? 'bg-emerald-800 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'en' ? 'bg-emerald-800 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Quick theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Thème"
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors border border-stone-200 dark:border-stone-800"
            title="Basculer le thème"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Paramètres"
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors border border-stone-200 dark:border-stone-800"
            title={t.navSettings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 dark:border-stone-800 py-2 px-2 bg-[#FAF7EE] dark:bg-stone-900 text-xs font-semibold">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-2 py-1 rounded transition-colors ${
            currentTab === 'home' ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          Accueil
        </button>
        <button
          onClick={() => setCurrentTab('khatma')}
          className={`px-2 py-1 rounded transition-colors ${
            currentTab === 'khatma' ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          {t.navMyKhatma}
        </button>
        <button
          onClick={() => setCurrentTab('quran')}
          className={`px-2 py-1 rounded transition-colors ${
            currentTab === 'quran' ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          {t.navQuran}
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`px-2 py-1 rounded transition-colors ${
            currentTab === 'history' ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          {t.navHistory}
        </button>
      </div>
    </header>
  );
};
