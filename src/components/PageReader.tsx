import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle2, 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  Info,
  Type,
  Loader2,
  ShieldCheck,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CondensedPage, ReadingSettings, UserProgress } from '../types/quran';
import { toArabicNumerals } from '../utils/storage';
import { 
  fetchCondensedPageFull, 
  getStandardPagesForCondensed, 
  StandardPageVerses 
} from '../services/quranApiService';
import { SURAHS_LIST, getSurahByNumber } from '../data/surahsData';

interface PageReaderProps {
  pageData: CondensedPage;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  progress: UserProgress;
  onToggleCompletePage: (juz: number, page: number) => void;
  onNavigatePage: (juz: number, page: number) => void;
  onOpenJuzSelector: () => void;
  onOpenTafsir: () => void;
  onToggleBookmark: (juz: number, page: number) => void;
}

export const PageReader: React.FC<PageReaderProps> = ({
  pageData,
  settings,
  onUpdateSettings,
  progress,
  onToggleCompletePage,
  onNavigatePage,
  onOpenJuzSelector,
  onOpenTafsir,
  onToggleBookmark
}) => {
  const pageKey = `${pageData.juzNumber}-${pageData.pageIndex}`;
  const isCompleted = progress.completedPages.includes(pageKey);
  const isBookmarked = progress.bookmarks.some(
    b => b.juz === pageData.juzNumber && b.page === pageData.pageIndex
  );

  const [activeTab, setActiveTab] = useState<'mushaf' | 'bilingual' | 'summary'>('mushaf');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingKey, setCurrentPlayingKey] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Live complete Quran data state
  const [fullPages, setFullPages] = useState<StandardPageVerses[]>([]);
  const [isLoadingFull, setIsLoadingFull] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Standard pages mapped to this condensed page (e.g. [1, 2, 3, 4])
  const standardPagesList = getStandardPagesForCondensed(pageData.juzNumber, pageData.pageIndex);

  // Fetch all complete standard pages for this 5-page portion
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingFull(true);
    setLoadError(null);

    // Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingKey(null);
    }

    fetchCondensedPageFull(pageData.juzNumber, pageData.pageIndex)
      .then(res => {
        if (!isCancelled) {
          setFullPages(res.standardPages);
          setIsLoadingFull(false);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          console.error("Error loading complete Quran pages:", err);
          setLoadError("Impossible de charger les versets en ligne. Affichage du texte local.");
          setIsLoadingFull(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [pageData.juzNumber, pageData.pageIndex]);

  // Handle navigation
  const handlePrev = () => {
    if (pageData.pageIndex > 1) {
      onNavigatePage(pageData.juzNumber, pageData.pageIndex - 1);
    } else if (pageData.juzNumber > 1) {
      onNavigatePage(pageData.juzNumber - 1, 5);
    }
  };

  const handleNext = () => {
    if (pageData.pageIndex < 5) {
      onNavigatePage(pageData.juzNumber, pageData.pageIndex + 1);
    } else if (pageData.juzNumber < 30) {
      onNavigatePage(pageData.juzNumber + 1, 1);
    }
  };

  // Flat list of all verses across all grouped standard pages
  const allVerses = fullPages.length > 0 
    ? fullPages.flatMap(p => p.verses)
    : pageData.verses.map(v => ({
        id: v.id,
        verseNumber: v.verseNumber,
        surahNumber: v.surahNumber,
        verseKey: `${v.surahNumber}:${v.verseNumber}`,
        textUthmani: v.textArabic,
        textFrench: v.textFrench,
        textEnglish: v.textEnglish,
        audioUrl: v.audioUrl || ''
      }));

  const playVerseAudio = (verseKey: string, audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.onended = () => {
      // Find next verse in list
      const idx = allVerses.findIndex(v => v.verseKey === verseKey);
      if (idx !== -1 && idx < allVerses.length - 1) {
        const nextVerse = allVerses[idx + 1];
        if (nextVerse.audioUrl) {
          playVerseAudio(nextVerse.verseKey, nextVerse.audioUrl);
        }
      } else {
        setIsPlaying(false);
        setCurrentPlayingKey(null);
      }
    };

    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setCurrentPlayingKey(verseKey);
    }).catch(err => {
      console.error("Audio error:", err);
      setIsPlaying(false);
      setCurrentPlayingKey(null);
    });
  };

  const toggleGlobalAudio = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentPlayingKey(null);
    } else if (allVerses.length > 0) {
      const first = allVerses[0];
      if (first.audioUrl) {
        playVerseAudio(first.verseKey, first.audioUrl);
      }
    }
  };

  const handleToggleCompletionWithConfetti = () => {
    const willBeCompleted = !isCompleted;
    onToggleCompletePage(pageData.juzNumber, pageData.pageIndex);

    if (willBeCompleted) {
      confetti({
        particleCount: pageData.pageIndex === 5 ? 120 : 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#047857', '#10b981', '#fbbf24', '#f59e0b', '#3b82f6']
      });
    }
  };

  // Theme styling
  const getThemeWrapperClass = () => {
    switch (settings.theme) {
      case 'mushaf':
        return 'theme-mushaf bg-[#FAF7EE] text-[#1C1917] border-[#E8DFC9]';
      case 'dark':
        return 'bg-stone-900 text-stone-100 border-stone-800';
      case 'white':
      default:
        return 'bg-white text-stone-900 border-stone-200';
    }
  };

  const getThemeCardClass = () => {
    switch (settings.theme) {
      case 'mushaf':
        return 'bg-[#F4EEDC] text-[#292524] border-[#E4D7BE]';
      case 'dark':
        return 'bg-stone-800/70 text-stone-200 border-stone-700';
      case 'white':
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Top Banner: Juz, 5-Page Indicator & Complete Quran Integrity Proof */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${getThemeCardClass()}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenJuzSelector}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-amber-100 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Juz {pageData.juzNumber}</span>
              <span className="text-amber-300 font-arabic text-sm">({toArabicNumerals(pageData.juzNumber)})</span>
              <span className="opacity-60">▾</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-emerald-800 dark:text-emerald-400">
                <span>Page Condensée {pageData.pageIndex} sur 5 de ce Juz</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Étape {pageData.overallPageNumber}/150</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {pageData.surahRange}
              </h1>
            </div>
          </div>

          {/* Quick Page Visual Indicators (1 to 5) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
              {[1, 2, 3, 4, 5].map((idx) => {
                const key = `${pageData.juzNumber}-${idx}`;
                const isStepRead = progress.completedPages.includes(key);
                const isCurrent = pageData.pageIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => onNavigatePage(pageData.juzNumber, idx)}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-800 text-amber-200 ring-2 ring-emerald-600 scale-105 shadow-xs'
                        : isStepRead
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    title={`Étape ${idx}/5 (${isStepRead ? 'Lue' : 'À lire'})`}
                  >
                    {idx}
                  </button>
                );
              })}
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(pageData.juzNumber, pageData.pageIndex)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border-stone-200 dark:border-stone-700'
              }`}
              title={isBookmarked ? 'Signet enregistré' : 'Marquer comme signet'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Essential Integrity & Standard Mushaf Mapping Note */}
        <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Coran 100% Intégral :</strong> Aucun verset omis. Cette page réunit les <strong>pages standard {standardPagesList.join(', ')}</strong> du Mushaf de Médine ({allVerses.length} versets complets).
            </span>
          </div>
          <div className="text-stone-500 font-arabic text-sm font-semibold">
            {pageData.themeTitleArabic}
          </div>
        </div>
      </div>

      {/* Reading Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Mode switcher tabs */}
        <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
          <button
            onClick={() => setActiveTab('mushaf')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'mushaf'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Mushaf Intégral (Tous les Versets)
          </button>
          <button
            onClick={() => setActiveTab('bilingual')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'bilingual'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Verset par Verset + Traduction
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Résumé & Tadabbur
          </button>
        </div>

        {/* Audio Player & Font Resize */}
        <div className="flex items-center gap-2">
          {/* Audio Play button */}
          <button
            onClick={toggleGlobalAudio}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 border ${
              isPlaying
                ? 'bg-emerald-800 text-amber-200 border-emerald-700 animate-pulse'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-700'
            }`}
            title="Écouter la récitation continue (Cheikh Mishary Alafasy)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Écouter'}</span>
          </button>

          {/* Font Size controls */}
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800">
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.max(18, settings.fontSize - 2) })}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              title="Écriture plus petite / condensée"
            >
              A-
            </button>
            <span className="px-1 text-[11px] text-stone-400 font-mono">{settings.fontSize}</span>
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.min(42, settings.fontSize + 2) })}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              title="Agrandir la taille"
            >
              A+
            </button>
          </div>

          {/* Tafsir Drawer */}
          <button
            onClick={onOpenTafsir}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-800 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
            title="Ouvrir le résumé thématique"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Reading Frame */}
      <div 
        className={`relative rounded-3xl border-2 p-6 sm:p-10 transition-all shadow-sm ${getThemeWrapperClass()}`}
        style={{ minHeight: '520px' }}
      >
        {/* Subtle Islamic Framing Corner Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-800/30 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-800/30 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-800/30 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-800/30 rounded-br-sm pointer-events-none" />

        {/* Loading Indicator */}
        {isLoadingFull && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="w-7 h-7 text-emerald-800 animate-spin" />
            <span className="text-xs font-medium">Chargement des {standardPagesList.length} pages intégrales du Coran...</span>
          </div>
        )}

        {/* Tab 1: Continuous Full Mushaf View */}
        {!isLoadingFull && activeTab === 'mushaf' && (
          <div className="space-y-8">
            {fullPages.map((stdPage) => (
              <div key={stdPage.pageNumber} className="relative">
                {/* Standard Mushaf Page Divider */}
                <div className="my-6 text-center select-none">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-emerald-800/15 bg-emerald-800/5 text-emerald-900 dark:text-emerald-300 text-[11px] font-mono">
                    <Layers className="w-3 h-3 text-emerald-700" />
                    <span>Page standard {stdPage.pageNumber} du Mushaf</span>
                  </div>
                </div>

                {/* Verses of this standard page */}
                <div 
                  dir="rtl"
                  className="leading-loose text-justify text-right selection:bg-emerald-200 font-quran transition-all"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight
                  }}
                >
                  {stdPage.verses.map((verse) => {
                    const isVersePlaying = currentPlayingKey === verse.verseKey;
                    const surahMeta = getSurahByNumber(verse.surahNumber);
                    const isSurahFirstVerse = verse.verseNumber === 1;

                    return (
                      <React.Fragment key={verse.id}>
                        {/* Surah Header if verse is 1 */}
                        {isSurahFirstVerse && surahMeta && (
                          <div className="my-6 text-center select-none block">
                            <div className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-amber-200 border border-amber-300/30 shadow-xs inline-block min-w-[280px]">
                              <div className="font-arabic text-xl font-bold">
                                سُورَةُ {surahMeta.nameArabic}
                              </div>
                              <div className="text-[11px] text-emerald-100 font-sans tracking-wide">
                                {surahMeta.nameTransliterated} · {surahMeta.versesCount} versets · {surahMeta.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                              </div>
                            </div>
                            {/* Bismillah (except for Surah 9 At-Tawbah) */}
                            {verse.surahNumber !== 9 && verse.surahNumber !== 1 && (
                              <div className="my-4 font-quran text-center text-xl text-emerald-950 dark:text-emerald-200">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                              </div>
                            )}
                          </div>
                        )}

                        <span 
                          onClick={() => playVerseAudio(verse.verseKey, verse.audioUrl)}
                          className={`cursor-pointer transition-colors rounded-sm px-1 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 ${
                            isVersePlaying
                              ? 'bg-amber-200/60 dark:bg-amber-900/50 text-emerald-950 font-bold'
                              : ''
                          }`}
                          title={`Écouter ${verse.verseKey}`}
                        >
                          <span>{verse.textUthmani}</span>
                          <span className="ayah-end">
                            ۝{toArabicNumerals(verse.verseNumber)}
                          </span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Bilingual Verse-by-Verse with translations */}
        {!isLoadingFull && activeTab === 'bilingual' && (
          <div className="space-y-4">
            {allVerses.map((verse) => {
              const isVersePlaying = currentPlayingKey === verse.verseKey;
              return (
                <div 
                  key={verse.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isVersePlaying
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      Verset {verse.verseKey}
                    </span>
                    {verse.audioUrl && (
                      <button
                        onClick={() => playVerseAudio(verse.verseKey, verse.audioUrl)}
                        className="p-1 hover:text-emerald-700"
                        title="Écouter ce verset"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div 
                    dir="rtl" 
                    className="font-quran text-right mb-2 text-stone-900 dark:text-stone-100"
                    style={{ fontSize: `${settings.fontSize - 2}px`, lineHeight: 2 }}
                  >
                    {verse.textUthmani}
                    <span className="ayah-end">۝{toArabicNumerals(verse.verseNumber)}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                    {settings.translationLang === 'fr' ? verse.textFrench : verse.textEnglish}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Summary & Tadabbur View */}
        {activeTab === 'summary' && (
          <div className="space-y-6 text-stone-800 dark:text-stone-200">
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-400 mb-2">
                Résumé & Thèmes de cette Section ({pageData.titleFrench})
              </h3>
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {settings.translationLang === 'fr' ? pageData.summaryFrench : pageData.summaryEnglish}
              </p>
            </div>

            {/* Key Lessons */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
                Points Clés & Enseignements
              </h4>
              <div className="grid gap-3">
                {pageData.keyLessons.map((lesson, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <div className="font-semibold text-xs text-emerald-800 dark:text-emerald-400 mb-1">
                      {lesson.point}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {lesson.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabulary */}
            {pageData.vocabulary.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Vocabulaire Coranique Remarquable
                </h4>
                <div className="grid sm:grid-cols-3 gap-2">
                  {pageData.vocabulary.map((voc, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.01]">
                      <div className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-300">
                        {voc.arabic}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{voc.transliteration}</div>
                      <div className="text-xs text-stone-700 dark:text-stone-300 mt-1">{voc.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tadabbur Action */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Méditation & Action Concrète (Tadabbur)</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-950 dark:text-emerald-100">
                {pageData.tadabburReflection}
              </p>
            </div>
          </div>
        )}

        {/* Footer Page Number inside Mushaf Frame */}
        <div className="mt-10 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-mono">
          <span>Juz {pageData.juzNumber} · Page {pageData.pageIndex}/5 (Pages standard {standardPagesList.join(', ')})</span>
          <span>Étape {pageData.overallPageNumber} / 150</span>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700">
        <button
          onClick={handlePrev}
          disabled={pageData.juzNumber === 1 && pageData.pageIndex === 1}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Page Précédente</span>
        </button>

        {/* Primary Completion Button */}
        <button
          onClick={handleToggleCompletionWithConfetti}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
            isCompleted
              ? 'bg-emerald-800 text-amber-200 hover:bg-emerald-700'
              : 'bg-emerald-900 text-white hover:bg-emerald-800 hover:scale-[1.02]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? 'Page Terminée ✓ (Revalider)' : 'Marquer cette page comme lue ✓'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={pageData.juzNumber === 30 && pageData.pageIndex === 5}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Page Suivante</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
