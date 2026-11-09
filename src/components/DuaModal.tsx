import React, { useEffect } from 'react';
import { X, Sparkles, BookOpen, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DUA_KHATM_AL_QURAN } from '../data/duaKhatm';

interface DuaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuaModal: React.FC<DuaModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#fbbf24', '#f59e0b', '#ec4899']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#FBF7EE] to-[#F4ECD8] dark:from-stone-900 dark:to-stone-950 text-stone-900 dark:text-stone-100 border-2 border-amber-300 dark:border-amber-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-amber-200/60 dark:border-amber-900/30 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Félicitations pour l'achèvement du Coran</span>
          </div>

          <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-300">
            دُعَاءُ خَتْمِ القُرْآنِ الكَرِيمِ
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Invocation authentique de clôture du Saint Coran
          </p>
        </div>

        {/* Invocations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {DUA_KHATM_AL_QURAN.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white/70 dark:bg-stone-800/60 border border-amber-200/50 dark:border-amber-900/30 shadow-xs space-y-3"
            >
              <div
                dir="rtl"
                className="font-quran text-right text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-200 leading-loose"
              >
                {item.arabic}
              </div>

              <div className="text-xs text-amber-900 dark:text-amber-300 font-mono italic">
                {item.transliteration}
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                {item.french}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-200/60 dark:border-amber-900/30 bg-white/40 dark:bg-stone-900/80 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Âmîn, Qu'Allah accepte cette Khatma
          </button>
        </div>
      </div>
    </div>
  );
};
