import React, { useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Flame, 
  ArrowRight, 
  X,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import { AppLanguage } from '../utils/translations';
import { KhatmaState } from '../services/khatmaService';

interface DailyWirdCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueReading: () => void;
  onGoHome: () => void;
  language: AppLanguage;
  khatma: KhatmaState;
  pagesReadToday: number;
  wirdNumber?: number;
  onStartNextWird?: (nextWird: number) => void;
}

export const DailyWirdCelebrationModal: React.FC<DailyWirdCelebrationModalProps> = ({
  isOpen,
  onClose,
  onContinueReading,
  onGoHome,
  language,
  khatma,
  pagesReadToday,
  wirdNumber,
  onStartNextWird
}) => {
  const isRtl = language === 'ar';
  const totalCompleted = khatma.completedPages.length;
  const overallPercentage = Math.round((totalCompleted / 150) * 100);
  const currentWird = wirdNumber || 1;
  const nextWird = currentWird < khatma.durationDays ? currentWird + 1 : null;

  // Play gentle celebratory audio chime via Web Audio API (safe, self-contained, no network dependency)
  useEffect(() => {
    if (isOpen) {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          
          // Gentle warm pentatonic chime (F4, A4, C5, F5)
          const notes = [349.23, 440.0, 523.25, 698.46];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.001, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.12 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 1.0);
          });
        }
      } catch {
        // Audio synthesis fallback (silent)
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF9] dark:bg-[#1A1816] border border-amber-300/80 dark:border-amber-600/40 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Decorative Golden Rays / Starburst Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.25)_0%,_rgba(6,78,59,0.15)_45%,_transparent_70%)] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-20"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon & Badge */}
        <div className="relative inline-flex items-center justify-center mt-2 mb-4">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#064e3b] via-[#047857] to-amber-500 p-1 shadow-lg animate-bounce duration-1000">
            <div className="w-full h-full rounded-full bg-[#FFFDF9] dark:bg-[#1A1816] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-[#064e3b] flex items-center justify-center shadow-md border-2 border-white dark:border-stone-900 font-bold">
            ✓
          </span>
        </div>

        {/* Congratulatory Heading with Wird Number */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
          {language === 'ar' 
            ? `🎉 هنيئاً لك! أتممت الورد ${currentWird} بنجاح` 
            : `🎉 Félicitations ! Wird ${currentWird} accompli`}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-md mx-auto">
          {language === 'ar' 
            ? `ما شاء الله تبارك الله، تم إنجاز وتوثيق الورد رقم ${currentWird} من أصل ${khatma.durationDays} أوراد في الختمة رقم ${khatma.khatmaNumber}.` 
            : `Vous avez validé le Wird n° ${currentWird} sur ${khatma.durationDays} de votre Khatma n° ${khatma.khatmaNumber}. Qu'Allah accepte votre lecture !`}
        </p>

        {/* 3 Key Milestone Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-5">
          {/* 1. Pages Today */}
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-700 flex flex-col items-center justify-center">
            <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400 mb-1" />
            <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
              {pagesReadToday}
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              {language === 'ar' ? 'صفحات اليوم' : 'Pages lues'}
            </div>
          </div>

          {/* 2. Overall Khatma Progress */}
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-700 flex flex-col items-center justify-center">
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
            <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
              {overallPercentage}%
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              {language === 'ar' ? 'إنجاز الختمة' : 'Progression'}
            </div>
          </div>

          {/* 3. Current Position */}
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-700 flex flex-col items-center justify-center">
            <Calendar className="w-4 h-4 text-[#064e3b] dark:text-emerald-400 mb-1" />
            <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
              {khatma.currentPosition.juz}/30
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              {language === 'ar' ? 'الجزء الحالي' : 'Juz actuel'}
            </div>
          </div>
        </div>

        {/* Sacred Heartfelt Dua */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50/60 to-emerald-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border border-amber-200/80 dark:border-stone-700 my-4 text-center">
          <p className="font-['Amiri',serif] text-sm sm:text-base text-emerald-950 dark:text-amber-100 leading-relaxed font-bold">
            « اللَّهُمَّ اجْعَلِ القُرْآنَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا »
          </p>
          <div className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-serif">
            {language === 'ar' 
              ? 'تقبل الله طاعتكم وبارك في وقتكم وعملكم الصالح' 
              : 'Qu\'Allah accepte votre lecture, illumine votre cœur et vous accorde Sa bénédiction.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
          {nextWird && onStartNextWird ? (
            <button
              onClick={() => onStartNextWird(nextWird)}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>
                {language === 'ar' 
                  ? `الانطلاق في الورد ${nextWird}` 
                  : `Passer au Wird ${nextWird}`}
              </span>
              <ArrowRight className={`w-4 h-4 text-amber-300 group-hover:translate-x-0.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={onContinueReading}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{language === 'ar' ? 'متابعة القراءة الإضافية' : 'Continuer la lecture'}</span>
            </button>
          )}

          <button
            onClick={onGoHome}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-sm transition-all"
          >
            <span>{language === 'ar' ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
