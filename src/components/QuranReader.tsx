import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Maximize2,
  Minimize2,
  Loader2,
  Eye,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  fetchCondensedPageFull, 
  StandardPageVerses 
} from '../services/quranApiService';
import { getSurahByNumber } from '../data/surahsData';
import { toArabicNumerals } from '../utils/storage';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { ReadingSettings } from '../types/quran';

export type VisualGuideMode = 'classic' | 'alternating' | 'focus';

interface QuranReaderProps {
  juzNumber: number;
  pageIndex: number; // 1 to 5
  isCompleted: boolean;
  isBookmarked: boolean;
  settings: ReadingSettings;
  language: AppLanguage;
  onBack: () => void;
  onNavigatePage: (juz: number, page: number) => void;
  onToggleComplete: (juz: number, page: number) => void;
  onToggleBookmark: (juz: number, page: number) => void;
  onUpdateFontSize: (size: number) => void;
  onSelectVerseForDetails: (verseKey: string, textArabic: string, surahNum: number, verseNum: number, audioUrl?: string) => void;
  /** Verset du signet de reprise sur cette page (s'il y en a un). */
  resumeVerseKey?: string;
}

// Temps minimal sur une page pour qu'elle soit comptée automatiquement en passant à la suivante.
const AUTO_READ_MS = 60_000;

export const QuranReader: React.FC<QuranReaderProps> = ({
  juzNumber,
  pageIndex,
  isCompleted,
  isBookmarked,
  settings,
  language,
  onBack,
  onNavigatePage,
  onToggleComplete,
  onToggleBookmark,
  onUpdateFontSize,
  onSelectVerseForDetails,
  resumeVerseKey
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const overallPage = (juzNumber - 1) * 5 + pageIndex;
  const progressPercent = Math.round((overallPage / 150) * 100);

  const [fullPages, setFullPages] = useState<StandardPageVerses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [audioPlayingKey, setAudioPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-fit zero-scroll engine
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [autoFitEnabled, setAutoFitEnabled] = useState<boolean>(true);
  const [effectiveFontSize, setEffectiveFontSize] = useState<number>(settings.fontSize);
  const [effectiveLineHeight, setEffectiveLineHeight] = useState<number>(1.75);
  // true quand le texte dépasse l'écran (police choisie trop grande, ou portion trop longue même à la
  // taille minimale) : on autorise alors le défilement pour qu'AUCUN verset ne soit jamais masqué.
  const [overflowing, setOverflowing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [retryTick, setRetryTick] = useState<number>(0);
  const refitTries = useRef<number>(0);
  // Heure d'arrivée sur la page (pour la validation automatique) + petit message éphémère.
  const pageEnteredAt = useRef<number>(Date.now());
  useEffect(() => { pageEnteredAt.current = Date.now(); }, [juzNumber, pageIndex]);
  const [toast, setToast] = useState<string>('');
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };
  // Signet de reprise : on amène le verset à l'écran et on le fait briller quelques secondes.
  const [resumeGlow, setResumeGlow] = useState<boolean>(false);
  useEffect(() => {
    if (loading || !resumeVerseKey) return;
    const el = contentRef.current?.querySelector(`[data-vk="${resumeVerseKey}"]`) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setResumeGlow(true);
    const t = setTimeout(() => setResumeGlow(false), 4000);
    return () => clearTimeout(t);
  }, [loading, resumeVerseKey, juzNumber, pageIndex]);
  useEffect(() => { refitTries.current = 0; }, [juzNumber, pageIndex, settings.fontSize]);
  // Vraies pages du mushaf de Médine couvertes par cette page condensée (ex. « 22–25 »).
  const mushafRange = fullPages.length
    ? fullPages[0].pageNumber === fullPages[fullPages.length - 1].pageNumber
      ? String(fullPages[0].pageNumber)
      : `${fullPages[0].pageNumber}–${fullPages[fullPages.length - 1].pageNumber}`
    : '';

  // Visual Comfort & Reading Guide Modes (Sobriety & Clarity without rainbow)
  // 'classic' = 100% noble black ink + subtle golden ayah markers
  // 'alternating' = soft ton-sur-ton contrast between verses (deep ink / soft charcoal)
  // 'focus' = gentle amber halo on the active verse being read
  const [visualMode, setVisualMode] = useState<VisualGuideMode>('classic');
  const [focusedVerseKey, setFocusedVerseKey] = useState<string | null>(null);
  const [isGuideMenuOpen, setIsGuideMenuOpen] = useState<boolean>(false);

  // Load verses of the standard pages mapped to this 1 digital page
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlayingKey(null);
    }

    fetchCondensedPageFull(juzNumber, pageIndex)
      .then(res => {
        if (!cancelled) {
          setFullPages(res.standardPages);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error("Failed to load verses:", err);
          setFullPages([]);
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [juzNumber, pageIndex, retryTick]);

  // Recalculate optimal font size & line spacing so text EXPANDS to fill the available height with ZERO scrolling
  const recalculateFontSize = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const container = containerRef.current;
    const content = contentRef.current;

    if (!autoFitEnabled) {
      setEffectiveFontSize(settings.fontSize);
      setEffectiveLineHeight(1.75);
      setOverflowing(true);
      return;
    }

    // Mesure dans un état neutre (sans barre de défilement), quel que soit l'état précédent.
    const prevOverflow = container.style.overflowY;
    container.style.overflowY = 'hidden';
    // Accurate calculation of available content box inside container
    const compStyle = window.getComputedStyle(container);
    const padTop = parseFloat(compStyle.paddingTop) || 12;
    const padBottom = parseFloat(compStyle.paddingBottom) || 12;
    // 6px safety margin so text never touches boundaries or overflows
    const availHeight = container.clientHeight - padTop - padBottom - 6;
    if (availHeight <= 80) { container.style.overflowY = prevOverflow; return; }

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    // Use a compact base line-height during binary search so font size is maximized and crisp!
    const baseLH = isMobile ? 1.52 : isTablet ? 1.58 : 1.62;
    content.style.lineHeight = String(baseLH);

    // Search range for font size
    let low = isMobile ? 9.5 : 12.5;
    let high = isMobile ? 24.0 : 42.0;
    let bestFont = low;

    // 12 precise binary search steps to find the largest readable font size
    for (let i = 0; i < 12; i++) {
      const mid = Number(((low + high) / 2).toFixed(2));
      content.style.fontSize = `${mid}px`;
      if (content.scrollHeight <= availHeight) {
        bestFont = mid;
        low = mid + 0.1;
      } else {
        high = mid - 0.1;
      }
    }

    // Apply the best font size
    content.style.fontSize = `${bestFont}px`;
    const measuredHeight = content.scrollHeight;

    // DYNAMIC HEIGHT EXPANSION:
    // If the text doesn't fill the vertical space (leaves empty space at the bottom),
    // expand line-height to fill ~94% to 96% of the available height!
    let bestLH = baseLH;
    const targetFillHeight = availHeight * 0.95;

    if (measuredHeight > 0 && measuredHeight < targetFillHeight) {
      const ratio = targetFillHeight / measuredHeight;
      const maxAllowedLH = isMobile ? 2.05 : isTablet ? 2.35 : 2.65;
      let trialLH = Math.min(maxAllowedLH, Number((baseLH * ratio).toFixed(2)));

      // Step down slightly if trialLH overshoots availHeight
      content.style.lineHeight = String(trialLH);
      while (content.scrollHeight > availHeight && trialLH > baseLH) {
        trialLH = Number((trialLH - 0.04).toFixed(2));
        content.style.lineHeight = String(trialLH);
      }
      bestLH = Math.max(baseLH, trialLH);
    }

    content.style.fontSize = `${bestFont}px`;
    content.style.lineHeight = String(bestLH);
    setEffectiveFontSize(bestFont);
    setEffectiveLineHeight(bestLH);
    // Garde-fou : si même la plus petite taille ne suffit pas, on passe en défilement.
    setOverflowing(content.scrollHeight > availHeight + 1);
    container.style.overflowY = prevOverflow;
  }, [autoFitEnabled, settings.fontSize]);

  useLayoutEffect(() => {
    if (!loading && fullPages.length > 0) {
      recalculateFontSize();
      const t1 = setTimeout(recalculateFontSize, 40);
      const t2 = setTimeout(recalculateFontSize, 120);
      const t3 = setTimeout(recalculateFontSize, 300);

      // Recalculate once web fonts (Amiri Quran) are fully rendered.
      // fonts.ready peut se résoudre avant que la police du Coran soit demandée : on la charge explicitement.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          recalculateFontSize();
        });
        // Le sous-ensemble ARABE de la police se charge à part : on le demande avec du texte arabe.
        document.fonts.load("20px 'Amiri Quran'", 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ').then(() => recalculateFontSize()).catch(() => {});
      }
      // Passes de contrôle : la police et les images de l'en-tête peuvent finir de charger plus tard.
      const t4 = setTimeout(recalculateFontSize, 700);
      const t5 = setTimeout(recalculateFontSize, 1500);
      const t6 = setTimeout(recalculateFontSize, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
      };
    }
  }, [loading, fullPages, autoFitEnabled, recalculateFontSize, resumeVerseKey]);

  // Garde-fou final, après chaque rendu : si la fin du texte dépasse le bas de l'écran,
  // on active le défilement. Aucun verset ne doit jamais être masqué.
  useLayoutEffect(() => {
    const check = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content || loading) return;
      const over = content.getBoundingClientRect().bottom > container.getBoundingClientRect().bottom + 1
        || content.scrollHeight > container.clientHeight + 1;
      // Écart entre le calcul et l'affichage (police arrivée entre-temps) : on refait le calcul,
      // 4 fois au plus par page ; si le texte ne tient toujours pas, le défilement reste actif.
      const fitsNow = !over && content.scrollHeight < container.clientHeight - 24;
      if (autoFitEnabled && (over ? !overflowing : overflowing && fitsNow) && refitTries.current < 4) {
        refitTries.current += 1;
        recalculateFontSize();
      } else if (over && !overflowing) {
        setOverflowing(true);
      }
    };
    check();
    const id = setInterval(check, 500);
    const stop = setTimeout(() => clearInterval(id), 5000);
    return () => { clearInterval(id); clearTimeout(stop); };
  });

  // Window resize and ResizeObserver to smoothly expand text whenever screen or orientation changes
  useEffect(() => {
    const handleResize = () => {
      recalculateFontSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let ro: ResizeObserver | null = null;
    if (containerRef.current) {
      ro = new ResizeObserver(() => {
        recalculateFontSize();
      });
      ro.observe(containerRef.current);
    }
    // La police du Coran arrive parfois après le premier calcul : on recalcule à chaque chargement.
    const fonts = (document as any).fonts;
    fonts?.addEventListener?.('loadingdone', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      fonts?.removeEventListener?.('loadingdone', handleResize);
      if (ro) ro.disconnect();
    };
  }, [recalculateFontSize]);

  const handlePrev = useCallback(() => {
    setAutoFitEnabled(true);
    if (pageIndex > 1) {
      onNavigatePage(juzNumber, pageIndex - 1);
    } else if (juzNumber > 1) {
      onNavigatePage(juzNumber - 1, 5);
    }
  }, [juzNumber, pageIndex, onNavigatePage]);

  // Validation automatique : passer à la page suivante après au moins 1 minute de lecture
  // compte la page comme lue (sans toucher ✓). En dessous, on considère qu'on feuillette.
  const handleNext = useCallback(() => {
    setAutoFitEnabled(true);
    const isLast = juzNumber === 30 && pageIndex === 5;
    const readLongEnough = Date.now() - pageEnteredAt.current >= AUTO_READ_MS;
    if (!isCompleted && (readLongEnough || isLast)) {
      onToggleComplete(juzNumber, pageIndex);
      if (!isLast) showToast(language === 'ar' ? '✓ سُجّلت الصفحة تلقائياً' : language === 'en' ? '✓ Page saved automatically' : '✓ Page enregistrée automatiquement');
    } else if (!isCompleted && !isLast) {
      showToast(language === 'ar' ? 'لم تُحتسب الصفحة (أقل من دقيقة) — اضغط ✓ إن قرأتها' : language === 'en' ? 'Page not counted (under 1 min) — tap ✓ if you read it' : 'Page non comptée (moins d\'1 min) — touchez ✓ si vous l\'avez lue');
    }
    if (isLast) return;
    if (pageIndex < 5) {
      onNavigatePage(juzNumber, pageIndex + 1);
    } else if (juzNumber < 30) {
      onNavigatePage(juzNumber + 1, 1);
    }
  }, [juzNumber, pageIndex, onNavigatePage, isCompleted, onToggleComplete, language]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (isRtl) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRtl, handlePrev, handleNext]);

  const handleToggleCompleteWithConfetti = () => {
    const willBeCompleted = !isCompleted;
    onToggleComplete(juzNumber, pageIndex);
    if (willBeCompleted) {
      confetti({
        particleCount: pageIndex === 5 ? 120 : 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#047857', '#10b981', '#f59e0b', '#fbbf24']
      });
    }
  };

  const handleManualFontChange = (delta: number) => {
    setAutoFitEnabled(false);
    const newSize = Math.max(10, Math.min(42, Number((effectiveFontSize + delta).toFixed(1))));
    setEffectiveFontSize(newSize);
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${newSize}px`;
    }
    onUpdateFontSize(newSize);
  };

  // Background style: Warm Mushaf paper eliminates 90% of eye glare compared to stark white
  const bgClass = settings.theme === 'dark' 
    ? 'bg-[#141210] text-[#f5f5f4]' 
    : settings.theme === 'mushaf' 
    ? 'bg-[#FAF6EB] text-[#24211e]' 
    : 'bg-[#FAF8F5] text-[#1c1917]';

  const isPrevDisabled = juzNumber === 1 && pageIndex === 1;
  // Dernière page : le bouton « suivant » termine la Khatma (puis dua de fin de Khatma).
  const isNextDisabled = juzNumber === 30 && pageIndex === 5 && isCompleted;
  const isDark = settings.theme === 'dark';

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-start ${bgClass} transition-colors select-text relative`}>
      {/* 1. ONLY TOP BAR: Contains all navigation, arrows, complete status & controls */}
      <header className="shrink-0 h-12 w-full backdrop-blur-md bg-opacity-95 border-b border-black/5 dark:border-white/10 px-2 sm:px-4 flex items-center justify-between text-xs font-semibold z-20">
        {/* Left Side: Back button */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline font-bold tracking-wide">KHATMAH</span>
          </button>
        </div>

        {/* Center: Simple Navigation Arrows ("Flèches") & Page Info */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous Page Arrow */}
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="p-1 sm:p-1.5 rounded-lg border border-stone-300/80 dark:border-stone-700 hover:bg-emerald-800/10 dark:hover:bg-emerald-400/10 text-stone-700 dark:text-stone-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            title={t.prevPage}
          >
            <ChevronLeft className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          {/* Position indicator */}
          <div
            className="flex items-center gap-1.5 tracking-wider font-mono text-[11px] sm:text-[13px] font-bold text-emerald-950 dark:text-emerald-300 px-1 select-none"
            title={mushafRange ? (language === 'ar' ? `صفحات المصحف ${mushafRange}` : `Mushaf : pages ${mushafRange}`) : undefined}
          >
            <span>{t.juzLabel} {juzNumber}</span>
            <span className="opacity-30">|</span>
            <span>{t.pageLabel} {pageIndex} / 5</span>
            {mushafRange && (
              <span className="hidden sm:inline font-sans font-medium text-[11px] text-stone-500 dark:text-stone-400">
                ({language === 'ar' ? 'المصحف' : 'Mushaf'} {mushafRange})
              </span>
            )}
          </div>

          {/* Next Page Arrow */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="p-1 sm:p-1.5 rounded-lg border border-stone-300/80 dark:border-stone-700 hover:bg-emerald-800/10 dark:hover:bg-emerald-400/10 text-stone-700 dark:text-stone-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            title={t.nextPage}
          >
            <ChevronRight className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Right Side: Page Complete Button, Reading Guide Mode, Auto-Fit, Font Zoom & Bookmark */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mark Page Completed Button */}
          <button
            onClick={handleToggleCompleteWithConfetti}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg font-bold transition-all flex items-center gap-1 text-[11px] shadow-2xs ${
              isCompleted
                ? 'bg-emerald-800 text-amber-200 hover:bg-emerald-700'
                : 'bg-emerald-900 text-white hover:bg-emerald-800'
            }`}
            title={isCompleted ? t.pageCompletedBadge : t.markPageCompleted}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCompleted ? t.pageCompletedBadge : 'Lu'}</span>
          </button>

          {/* Visual Reading Guide Menu Button (Sobriété & Confort visuel) */}
          <div className="relative">
            <button
              onClick={() => setIsGuideMenuOpen(!isGuideMenuOpen)}
              className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                visualMode !== 'classic'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Ajuster le confort de lecture et le guide visuel"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">
                {visualMode === 'classic' ? 'Sobre' : visualMode === 'alternating' ? 'Nuances' : 'Focus'}
              </span>
            </button>

            {/* Quick Comfort Guide Dropdown */}
            {isGuideMenuOpen && (
              <div 
                className={`absolute top-full mt-2 w-64 p-3 rounded-2xl bg-[#FAF7EE] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-xl z-50 text-xs ${
                  isRtl ? 'left-0' : 'right-0'
                }`}
              >
                <div className="font-bold text-stone-800 dark:text-stone-200 mb-2 pb-1.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                  <span>Confort de lecture</span>
                  <span className="text-[10px] text-stone-400 font-normal">Sans couleur criarde</span>
                </div>

                <div className="space-y-1.5">
                  {/* Mode 1: Classic Noble */}
                  <button
                    onClick={() => {
                      setVisualMode('classic');
                      setIsGuideMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-colors ${
                      visualMode === 'classic'
                        ? 'bg-emerald-800/10 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-800/20'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full mt-1.5 bg-stone-800 dark:bg-stone-200 shrink-0" />
                    <div>
                      <div className="font-semibold">Classique Médinois</div>
                      <div className="text-[10px] opacity-75 font-normal">Texte 100% noir d'encre noble, seuls les ornements ۝ sont dorés.</div>
                    </div>
                  </button>

                  {/* Mode 2: Soft Ton-sur-Ton */}
                  <button
                    onClick={() => {
                      setVisualMode('alternating');
                      setIsGuideMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-colors ${
                      visualMode === 'alternating'
                        ? 'bg-emerald-800/10 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-800/20'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full mt-1.5 bg-stone-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Nuances Douces (Ton-sur-Ton)</div>
                      <div className="text-[10px] opacity-75 font-normal">Micro-alternance d'encre sombre pour distinguer chaque verset sans couleur.</div>
                    </div>
                  </button>

                  {/* Mode 3: Interactive Focus */}
                  <button
                    onClick={() => {
                      setVisualMode('focus');
                      setIsGuideMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-colors ${
                      visualMode === 'focus'
                        ? 'bg-emerald-800/10 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-800/20'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full mt-1.5 bg-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Guide Focus de lecture</div>
                      <div className="text-[10px] opacity-75 font-normal">Un léger halo doré discret accompagne le verset où vous êtes.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Fit Toggle (0 Scroll) */}
          <button
            onClick={() => {
              const next = !autoFitEnabled;
              setAutoFitEnabled(next);
              if (next) {
                setTimeout(recalculateFontSize, 30);
              } else {
                setEffectiveFontSize(settings.fontSize);
                setEffectiveLineHeight(1.75);
              }
            }}
            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
              autoFitEnabled
                ? 'bg-emerald-800 text-amber-200 border-emerald-700 shadow-2xs'
                : 'text-stone-500 border-stone-300 dark:border-stone-700 hover:text-stone-800'
            }`}
            title={autoFitEnabled ? "Mode Plein Écran (0 Scroll) actif" : "Activer l'ajustement automatique 0 Scroll"}
          >
            {autoFitEnabled ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden md:inline">{autoFitEnabled ? "0 Scroll" : "Ajuster"}</span>
          </button>

          {/* Font Zoom Controls */}
          <div className="flex items-center border border-black/10 dark:border-white/15 rounded-lg overflow-hidden bg-black/[0.02] dark:bg-white/5">
            <button
              onClick={() => handleManualFontChange(-1.5)}
              className="px-1.5 py-1 text-[11px] text-stone-600 dark:text-stone-300 hover:bg-black/5"
              title="Réduire"
            >
              A-
            </button>
            <button
              onClick={() => handleManualFontChange(+1.5)}
              className="px-1.5 py-1 text-[11px] text-stone-600 dark:text-stone-300 hover:bg-black/5"
              title="Agrandir"
            >
              A+
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(juzNumber, pageIndex)}
            className={`p-1.5 rounded-lg transition-colors border ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-transparent hover:border-black/10'
            }`}
            title={isBookmarked ? t.bookmarkRemoved : t.bookmarkSaved}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="shrink-0 w-full h-0.5 bg-black/5 dark:bg-white/5">
        <div 
          className="h-full bg-emerald-800 dark:bg-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Main Full-Width Reading Canvas (Zero Scroll, Zero Empty Space, Never Cut Under Top Bar) */}
      <main 
        ref={containerRef}
        onClick={() => {
          if (isGuideMenuOpen) setIsGuideMenuOpen(false);
        }}
        className={`flex-1 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-3 sm:pb-5 flex flex-col justify-start items-center relative ${
          autoFitEnabled && !overflowing ? 'overflow-hidden' : 'overflow-y-auto scrollbar-none'
        }`}
      >
        {!loading && loadError ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 text-stone-500">
            <span className="text-sm font-medium">
              {language === 'ar'
                ? 'تعذّر تحميل الآيات. تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.'
                : language === 'en'
                ? 'Could not load the verses. Check your connection and try again.'
                : 'Impossible de charger les versets. Vérifiez votre connexion puis réessayez.'}
            </span>
            <button
              onClick={() => setRetryTick((n) => n + 1)}
              className="px-4 py-2 rounded-full bg-emerald-800 text-white text-sm font-semibold active:scale-95"
            >
              {language === 'ar' ? 'إعادة المحاولة' : language === 'en' ? 'Retry' : 'Réessayer'}
            </button>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-800" />
            <span className="text-xs font-medium">Chargement des versets...</span>
          </div>
        ) : (
          <div 
            ref={contentRef}
            dir="rtl"
            className="w-full font-quran select-text block"
            style={{
              fontSize: `${effectiveFontSize}px`,
              lineHeight: effectiveLineHeight,
              textAlign: 'justify',
              textJustify: 'inter-word',
              textAlignLast: 'start',
              wordBreak: 'keep-all',
              overflowWrap: 'normal',
              hyphens: 'none',
              letterSpacing: 'normal'
            }}
          >
            {fullPages.map((stdPage) => (
              <React.Fragment key={stdPage.pageNumber}>
                {stdPage.verses.map((verse, vIdx) => {
                  const isVersePlaying = audioPlayingKey === verse.verseKey;
                  const surahMeta = getSurahByNumber(verse.surahNumber);
                  const isSurahFirstVerse = verse.verseNumber === 1;
                  const isFocused = visualMode === 'focus' && focusedVerseKey === verse.verseKey;

                  // Ton-sur-ton alternation: micro-contrast without any rainbow color
                  // Odd verses in deep rich ink, even verses in slightly softened charcoal
                  let textColor = undefined;
                  if (visualMode === 'alternating') {
                    if (isDark) {
                      textColor = vIdx % 2 === 0 ? '#f5f5f4' : '#d6d3d1';
                    } else {
                      textColor = vIdx % 2 === 0 ? '#1c1917' : '#44403c';
                    }
                  }

                  return (
                    <React.Fragment key={verse.id}>
                      {/* Compact Surah Header when a Surah begins */}
                      {isSurahFirstVerse && surahMeta && (
                        <div className="my-2.5 text-center select-none w-full block">
                          <span className="py-0.5 px-3 rounded-lg bg-[#064e3b] text-amber-200 border border-amber-300/30 shadow-xs inline-block">
                            <span className="font-arabic text-xs sm:text-sm font-bold">
                              سُورَةُ {surahMeta.nameArabic}
                            </span>
                          </span>
                          {verse.surahNumber !== 9 && verse.surahNumber !== 1 && (
                            <div className="my-0.5 font-quran text-center text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pure Noble Verse: Crisp typography, subtle golden ayah markers */}
                      {resumeVerseKey === verse.verseKey && (
                        <span
                          className="inline-block align-middle mx-0.5 text-[0.9em] select-none"
                          title={language === 'ar' ? 'علامة التوقف' : language === 'en' ? 'Your bookmark' : 'Votre signet'}
                          aria-label="signet"
                        >🔖</span>
                      )}
                      <span
                        data-vk={verse.verseKey}
                        onClick={() => {
                          if (visualMode === 'focus') {
                            setFocusedVerseKey(verse.verseKey);
                          }
                          onSelectVerseForDetails(verse.verseKey, verse.textUthmani, verse.surahNumber, verse.verseNumber, verse.audioUrl);
                        }}
                        className={`cursor-pointer rounded-sm px-0.5 transition-colors inline ${
                          isVersePlaying 
                            ? 'bg-amber-300/50 dark:bg-amber-900/40 font-bold' 
                            : resumeVerseKey === verse.verseKey
                            ? `bg-amber-200/60 dark:bg-amber-900/40 ring-1 ring-amber-500/60 ${resumeGlow ? 'animate-pulse' : ''}`
                            : isFocused
                            ? 'bg-amber-200/40 dark:bg-amber-950/50 ring-1 ring-amber-400/40'
                            : 'hover:bg-amber-100/30 dark:hover:bg-white/5'
                        }`}
                        style={{
                          color: textColor
                        }}
                        title={language === 'ar' ? `اضغط لتفسير الآية ${verse.verseKey}` : `Tafsir (${verse.verseKey})`}
                      >
                        <span className="inline">{verse.textUthmani}</span>
                        {/* Noble Antique Gold Ayah End Marker */}
                        <span 
                          className="ayah-end inline-flex text-amber-700 dark:text-amber-400"
                          style={{
                            fontFamily: "'Amiri', serif"
                          }}
                        >
                          ۝{toArabicNumerals(verse.verseNumber)}
                        </span>
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
        {!loading && !loadError && autoFitEnabled && overflowing && (
          <div className="sticky bottom-0 h-0 w-full pointer-events-none flex justify-center overflow-visible">
            <span className="-translate-y-[130%] text-[11px] font-semibold text-emerald-900/80 dark:text-emerald-300/80 bg-white/80 dark:bg-stone-900/80 rounded-full px-3 py-1 shadow-sm">
              {language === 'ar' ? 'مرّر للأسفل لإكمال الصفحة ↓' : language === 'en' ? 'Scroll down to finish the page ↓' : 'Faites défiler pour finir la page ↓'}
            </span>
          </div>
        )}
      </main>
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2 rounded-full bg-emerald-900 text-amber-100 text-xs font-semibold shadow-lg max-w-[90vw] text-center pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
};
