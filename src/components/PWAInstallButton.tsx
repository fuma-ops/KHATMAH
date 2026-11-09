import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface PWAInstallButtonProps {
  language: AppLanguage;
  variant?: 'header' | 'card' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language, variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = TRANSLATIONS[language];

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'settings') {
      return (
        <button
          onClick={install}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>{t.installApp}</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-xs"
        title={t.installApp}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.installApp}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.installAppIOS}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#FAF7EE] dark:bg-stone-900 p-6 shadow-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold">Installer sur iPhone / iPad</h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-1 text-stone-400 hover:text-stone-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                1. Appuyez sur le bouton <strong>Partager</strong> (icône avec une flèche vers le haut) dans la barre Safari.<br />
                2. Faites défiler et appuyez sur <strong>« Sur l'écran d'accueil »</strong>.<br />
                3. Profitez de KHATMAH comme une application native sans connexion !
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
