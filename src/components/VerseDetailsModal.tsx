import React, { useState, useEffect } from 'react';
import { X, BookOpen, Lightbulb, HelpCircle, Layers, Volume2, ShieldCheck, Loader2 } from 'lucide-react';
import { getVerseDetails, VerseTafsirDetails } from '../services/tafsirService';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { toArabicNumerals } from '../utils/storage';
import { getSurahByNumber } from '../data/surahsData';
import { getVerseTheme } from '../services/verseThematicService';

interface VerseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string | null;
  arabicText: string;
  surahNumber: number;
  verseNumber: number;
  language: AppLanguage;
  audioUrl?: string;
  onPlayAudio?: (url: string) => void;
  isResumeMarker?: boolean;
  onToggleResumeMarker?: () => void;
}

export const VerseDetailsModal: React.FC<VerseDetailsModalProps> = ({
  isOpen,
  onClose,
  verseKey,
  arabicText,
  surahNumber,
  verseNumber,
  language,
  audioUrl,
  onPlayAudio,
  isResumeMarker,
  onToggleResumeMarker
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'tafsir' | 'asbab'>('tafsir');
  const [details, setDetails] = useState<VerseTafsirDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !verseKey) return;
    let cancelled = false;
    setLoading(true);
    getVerseDetails(verseKey, arabicText, surahNumber, verseNumber, language)
      .then(res => {
        if (!cancelled) {
          setDetails(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, verseKey, language, arabicText, surahNumber, verseNumber]);

  // Après les hooks (règle de React) : rien à afficher quand la fiche est fermée.
  if (!isOpen || !verseKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#FAF7EE] dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/60 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-amber-200 flex items-center justify-center font-bold text-xs shadow-xs font-mono">
              {verseNumber}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.verseDetailsTitle}
              </h3>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                {language === 'ar'
                  ? `سورة ${getSurahByNumber(surahNumber)?.nameArabic || ''} · الآية ${verseNumber}`
                  : language === 'fr'
                  ? `Sourate ${getSurahByNumber(surahNumber)?.nameTransliterated || ''} · Verset ${verseNumber}`
                  : `Surah ${getSurahByNumber(surahNumber)?.nameTransliterated || ''} · Verse ${verseNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {audioUrl && onPlayAudio && (
              <button
                onClick={() => onPlayAudio(audioUrl)}
                className="p-2 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                title="Écouter ce verset"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Original Arabic Verse Box with Thematic Theme Badge */}
        {(() => {
          const theme = getVerseTheme(arabicText, surahNumber, verseNumber);
          return (
            <>
              {theme && (
              <div className="px-4 py-2 bg-stone-100/90 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-xs" 
                    style={{ backgroundColor: theme.dotColor }} 
                  />
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {language === 'ar' ? theme.labelAr : language === 'fr' ? theme.labelFr : theme.labelEn}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  {language === 'ar' ? 'تصنيف تقريبي آلي' : language === 'en' ? 'automatic, indicative' : 'thème indicatif (détection automatique)'}
                </span>
              </div>
              )}

              <div className="p-4 bg-stone-50/60 dark:bg-stone-800/30 border-b border-stone-200 dark:border-stone-800 text-center">
                <div
                  dir="rtl"
                  className="font-quran text-lg sm:text-xl font-bold leading-loose"
                  style={{
                    color: theme?.colorLight
                  }}
                >
                  {arabicText}
                  <span 
                    className="ayah-end"
                    style={{ color: theme?.dotColor || "#b45309" }}
                  >
                    ۝{toArabicNumerals(verseNumber)}
                  </span>
                </div>
              </div>
            </>
          );
        })()}

        {/* Signet de reprise : s'arrêter à ce verset et y revenir la prochaine fois */}
        {onToggleResumeMarker && (
          <div className="px-4 pt-3">
            <button
              onClick={onToggleResumeMarker}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-colors ${
                isResumeMarker
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-200'
                  : 'bg-emerald-800 text-white hover:bg-emerald-700 shadow-sm'
              }`}
            >
              <span aria-hidden>🔖</span>
              <span>
                {isResumeMarker
                  ? (language === 'ar' ? 'إزالة علامة التوقف' : language === 'en' ? 'Remove my bookmark here' : 'Retirer mon signet ici')
                  : (language === 'ar' ? 'توقفتُ هنا — أكمل من هذه الآية لاحقاً' : language === 'en' ? 'I stopped here — continue from this verse next time' : "Je m'arrête ici — reprendre à ce verset")}
              </span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 border-b border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/60 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('tafsir')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'tafsir'
                ? 'bg-emerald-800 text-amber-200 font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {t.tafsirTab}
          </button>
          <button
            onClick={() => setActiveTab('asbab')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'asbab'
                ? 'bg-emerald-800 text-amber-200 font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {t.asbabTab}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
              <span className="text-xs">Chargement des données savantes...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: Tafsir */}
              {activeTab === 'tafsir' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pb-1 border-b border-black/5 dark:border-white/5">
                    <span>{t.sourceLabel} :</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {details?.tafsirSource}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                    {details?.tafsirText}
                  </p>
                </div>
              )}

              {/* Tab 2: Asbab al-Nuzul */}
              {activeTab === 'asbab' && (
                <div className="space-y-3">
                  {details?.hasSpecificAsbab ? (
                    <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Récit de révélation authentifié</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 font-normal">
                          {details.asbabSource}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                        {details.asbabText}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-100/60 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-center space-y-1">
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                        {details?.asbabText}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        La majorité des versets coraniques ont été révélés selon la volonté divine générale sans occasion historique particulière.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
