import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  X, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { AppLanguage } from '../utils/translations';

interface StartWirdOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (targetJuz: number, targetPage: number) => void;
  language: AppLanguage;
  khatmaNumber: number;
  durationDays: number;
  wirdNumber: number;
  targetJuz: number;
  targetPage: number;
  surahRange: string;
  juzLabel: string;
}

export const StartWirdOverlayModal: React.FC<StartWirdOverlayModalProps> = ({
  isOpen,
  onClose,
  onConfirmStart,
  language,
  khatmaNumber,
  durationDays,
  wirdNumber,
  targetJuz,
  targetPage,
  surahRange,
  juzLabel
}) => {
  if (!isOpen) return null;
  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF9] dark:bg-[#1A1816] border border-amber-300/80 dark:border-amber-600/40 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Soft Golden Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.2)_0%,_rgba(6,78,59,0.12)_45%,_transparent_70%)] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-20"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emblem & Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {language === 'ar' ? `الختمة المباركة رقم ${khatmaNumber}` : `Khatma Bénie n° ${khatmaNumber}`}
          </span>
        </div>

        {/* Sacred Calligraphy Box: Isti'adhah & Basmalah */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-50/70 via-white to-amber-50/50 dark:from-stone-900/90 dark:via-stone-850 dark:to-stone-900/90 border border-amber-300/70 dark:border-stone-700/80 shadow-inner space-y-3">
          <p className="font-['Amiri_Quran','Amiri',serif] text-xl sm:text-2xl text-emerald-950 dark:text-amber-100 font-bold leading-relaxed tracking-wide">
            « أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ »
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="font-['Amiri_Quran','Amiri',serif] text-lg sm:text-xl text-stone-850 dark:text-amber-200 font-semibold leading-relaxed">
            « بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ »
          </p>
        </div>

        {/* Wird Target Information Card */}
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-start space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'ar' ? `الورد اليومي : الورد ${wirdNumber} (خطة ${durationDays} يوماً)` : `Wird ${wirdNumber} (Objectif ${durationDays} jours)`}</span>
            </span>
            <span className="font-mono text-stone-500">{juzLabel}</span>
          </div>

          <div className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span>{surahRange}</span>
          </div>

          <div className="text-[11px] text-stone-500 font-mono">
            {language === 'ar' 
              ? `بداية القراءة من : الجزء ${targetJuz} · الصفحة ${targetPage} من 5` 
              : `Départ de la lecture : Juz ${targetJuz} · Page ${targetPage} sur 5`}
          </div>
        </div>

        {/* Niyyah notice */}
        <p className="mt-3 text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed">
          {language === 'ar' 
            ? 'بالضغط على الزر أدناه، يتم توثيق تاريخ وساعة بداية هذه الختمة رسمياً والانطلاق في التلاوة.' 
            : 'En cliquant sur le bouton ci-dessous, la date et l\'heure de démarrage de cette Khatma seront enregistrées.'}
        </p>

        {/* Action Button: Start Reading */}
        <button
          onClick={() => onConfirmStart(targetJuz, targetPage)}
          className="w-full mt-5 py-4 px-6 rounded-2xl bg-[#064e3b] hover:bg-[#047857] active:bg-[#022c22] text-white font-bold text-base transition-all shadow-lg flex items-center justify-center gap-3 group hover:scale-[1.01]"
        >
          <BookOpen className="w-5 h-5 text-amber-300" />
          <span>{language === 'ar' ? 'ابْدَأِ القِرَاءَةَ مُسْتَعِيناً بِاللَّهِ' : 'Commencer la lecture (Bismillah)'}</span>
          <ArrowRight className={`w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </button>
      </div>
    </div>
  );
};
