import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share, MoreVertical, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLanguage } from '../utils/translations';

interface PWAInstallButtonProps {
  language: AppLanguage;
  variant?: 'header' | 'hero' | 'settings';
}

const TXT = {
  fr: {
    label: "Télécharger l'app",
    title: 'Installer KHATMAH sur votre téléphone',
    ios: [
      'Ouvrez ce site dans Safari.',
      'Touchez le bouton Partager (carré avec une flèche vers le haut).',
      "Choisissez « Sur l'écran d'accueil », puis « Ajouter ».",
    ],
    other: [
      'Ouvrez le menu du navigateur (⋮ en haut à droite).',
      "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
      "KHATMAH s'ouvre ensuite comme une application, même sans connexion pour les pages déjà lues.",
    ],
    ok: 'Compris',
  },
  ar: {
    label: 'تحميل التطبيق',
    title: 'ثبّت تطبيق ختمة على هاتفك',
    ios: [
      'افتح هذا الموقع في متصفح سفاري.',
      'اضغط على زر المشاركة (مربع بسهم إلى الأعلى).',
      'اختر «إضافة إلى الشاشة الرئيسية» ثم «إضافة».',
    ],
    other: [
      'افتح قائمة المتصفح (⋮ في الأعلى).',
      'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».',
      'سيفتح ختمة بعدها كتطبيق، حتى دون اتصال للصفحات التي قرأتها.',
    ],
    ok: 'حسناً',
  },
  en: {
    label: 'Download the app',
    title: 'Install KHATMAH on your phone',
    ios: [
      'Open this site in Safari.',
      'Tap the Share button (square with an up arrow).',
      'Choose “Add to Home Screen”, then “Add”.',
    ],
    other: [
      'Open the browser menu (⋮ at the top right).',
      'Choose “Install app” or “Add to Home screen”.',
      'KHATMAH then opens like an app, even offline for pages already read.',
    ],
    ok: 'Got it',
  },
};

/**
 * Bouton « Télécharger l'app » (PWA) : installation native quand le navigateur la propose
 * (Android / Chrome / Edge), sinon un guide pas à pas (iPhone / autres navigateurs).
 * Caché quand l'app est déjà installée.
 */
export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language, variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const t = TXT[language] || TXT.fr;

  if (isInstalled) return null;

  const onClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  const steps = isIOS ? t.ios : t.other;
  const icons = isIOS ? [Share, Share, PlusSquare] : [MoreVertical, PlusSquare, Download];

  const button =
    variant === 'settings' ? (
      <button
        onClick={onClick}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 active:scale-95 transition-colors flex items-center justify-center gap-2 shadow-xs"
      >
        <Download className="w-4 h-4" />
        <span>{t.label}</span>
      </button>
    ) : (
      <button
        onClick={onClick}
        className="px-3 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-colors flex items-center gap-1.5 shadow-sm border border-amber-500/40"
        title={t.label}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t.label}</span>
      </button>
    );

  return (
    <>
      {button}
      {showGuide && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => setShowGuide(false)}>
          <div
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#FAF7EE] dark:bg-stone-900 p-6 shadow-2xl border border-amber-200/70 dark:border-stone-800 text-stone-900 dark:text-stone-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{t.title}</h3>
              <button onClick={() => setShowGuide(false)} className="p-1 text-stone-400 hover:text-stone-900" aria-label="Fermer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-3 mb-5">
              {steps.map((s, i) => {
                const Icon = icons[i];
                return (
                  <li key={i} className="flex items-start gap-3 text-sm leading-snug">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-800 text-amber-200 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="pt-1 flex-1">{s}</span>
                    <Icon className="shrink-0 w-4 h-4 mt-1.5 text-emerald-800 dark:text-emerald-300" />
                  </li>
                );
              })}
            </ol>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-700 active:scale-95"
            >
              {t.ok}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
