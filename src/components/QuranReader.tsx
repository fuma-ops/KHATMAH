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
  getCondensedPageSync,
  prefetchJuz,
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
  /** Fenêtre tafsir/détails du verset ouverte (pour retrouver le verset au retour). */
  detailsOpen?: boolean;
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
  resumeVerseKey,
  detailsOpen = false
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const overallPage = (juzNumber - 1) * 5 + pageIndex;
  const progressPercent = Math.round((overallPage / 150) * 100);

  // Page déjà téléchargée : affichage immédiat, sans écran de chargement.
  const [fullPages, setFullPages] = useState<StandardPageVerses[]>(() => getCondensedPageSync(juzNumber, pageIndex)?.standardPages ?? []);
  const [loading, setLoading] = useState<boolean>(() => !getCondensedPageSync(juzNumber, pageIndex));
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
  // Verset ouvert pour le tafsir : il reste surligné pendant la lecture du tafsir et ~5 s après
  // le retour, pour retrouver tout de suite où l'on en était, puis la couleur s'efface doucement.
  const tappedVerseKey = useRef<string | null>(null);
  const [returnVerseKey, setReturnVerseKey] = useState<string | null>(null);
  const wasDetailsOpen = useRef<boolean>(false);
  useEffect(() => {
    if (detailsOpen) {
      wasDetailsOpen.current = true;
      if (tappedVerseKey.current) setReturnVerseKey(tappedVerseKey.current);
      return;
    }
    if (!wasDetailsOpen.current) return;
    wasDetailsOpen.current = false;
    const key = tappedVerseKey.current;
    if (!key) return;
    setReturnVerseKey(key);
    const el = contentRef.current?.querySelector(`[data-vk="${key}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const t = setTimeout(() => setReturnVerseKey(null), 5000);
    return () => clearTimeout(t);
  }, [detailsOpen]);
  useEffect(() => { setReturnVerseKey(null); tappedVerseKey.current = null; }, [juzNumber, pageIndex]);
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
    setLoadError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlayingKey(null);
    }

    // Page déjà en mémoire (préchargée) : on l'affiche tout de suite, sans moulinette.
    const ready = getCondensedPageSync(juzNumber, pageIndex);
    if (ready) {
      setFullPages(ready.standardPages);
      setLoading(false);
      prefetchJuz(juzNumber);
      return () => { cancelled = true; };
    }

    setLoading(true);
    fetchCondensedPageFull(juzNumber, pageIndex)
      .then(res => {
        if (!cancelled) {
          setFullPages(res.standardPages);
          setLoading(false);
          // Le reste du Juz (et le début du suivant) se télécharge en arrière-plan.
          prefetchJuz(juzNumber);
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
  // Clé du dernier calcul (page affichée + taille de l'écran + état des polices) : on ne refait pas
  // ce calcul coûteux s'il n'y a rien de nouveau, pour que le changement de page soit instantané.
  const lastFitKey = useRef<string>('');
  const lastFitFont = useRef<number>(0);
  const recalculateFontSize = useCallback((force: boolean = false) => {
    if (!containerRef.current || !contentRef.current) return;
    const container = containerRef.current;
    const content = contentRef.current;
    const vks = content.querySelectorAll('[data-vk]');
    const fitKey = [
      vks[0]?.getAttribute('data-vk'), vks.length, container.clientWidth, container.clientHeight,
      document.fonts?.status, settings.fontSize, autoFitEnabled
    ].join('|');
    if (!force && fitKey === lastFitKey.current) return;
    lastFitKey.current = fitKey;

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

    // Taille de police : la hauteur du texte varie à peu près comme le carré de la taille.
    // On estime donc la bonne taille en 2 ou 3 mesures au lieu d'une longue recherche
    // (chaque mesure oblige le navigateur à remettre toute la page en forme).
    const minFont = isMobile ? 9.5 : 12.5;
    const maxFont = isMobile ? 24.0 : 42.0;
    const clampF = (v: number) => Math.min(maxFont, Math.max(minFont, Number(v.toFixed(2))));
    const heightAt = (size: number) => { content.style.fontSize = `${size}px`; return content.scrollHeight; };
    let bestFont = clampF(lastFitFont.current || (isMobile ? 16 : 24));
    let h = heightAt(bestFont);
    for (let i = 0; i < 3; i++) {
      const fitsNow = h <= availHeight;
      // déjà à moins de 2 % sous la limite, ou bloqué aux bornes : c'est la bonne taille
      if ((fitsNow && h >= availHeight * 0.96) || (fitsNow && bestFont >= maxFont) || (!fitsNow && bestFont <= minFont)) break;
      const next = clampF(bestFont * Math.sqrt((availHeight * 0.98) / h));
      if (Math.abs(next - bestFont) < 0.05) break;
      bestFont = next;
      h = heightAt(bestFont);
    }
    // Garde-fou : on ne garde jamais une taille qui dépasse (petits pas vers le bas).
    for (let i = 0; i < 6 && h > availHeight && bestFont > minFont; i++) {
      bestFont = clampF(bestFont * 0.97);
      h = heightAt(bestFont);
    }
    lastFitFont.current = bestFont;
    const measuredHeight = h;

    // DYNAMIC HEIGHT EXPANSION:
    // If the text doesn't fill the vertical space (leaves empty space at the bottom),
    // expand line-height to fill ~94% to 96% of the available height!
    let bestLH = baseLH;
    const targetFillHeight = availHeight * 0.95;

    if (measuredHeight > 0 && measuredHeight < targetFillHeight) {
      const maxAllowedLH = isMobile ? 2.05 : isTablet ? 2.35 : 2.65;
      // La hauteur est proportionnelle à l'interligne (même nombre de lignes) : calcul direct.
      let trialLH = Math.min(maxAllowedLH, Number((baseLH * targetFillHeight / measuredHeight).toFixed(3)));
      content.style.lineHeight = String(trialLH);
      let hl = content.scrollHeight;
      for (let i = 0; i < 4 && hl > availHeight && trialLH > baseLH; i++) {
        trialLH = Math.max(baseLH, Number((trialLH * (availHeight * 0.97) / hl).toFixed(3)));
        content.style.lineHeight = String(trialLH);
        hl = content.scrollHeight;
      }
      bestLH = Math.max(baseLH, Number(trialLH.toFixed(2)));
      if (hl > availHeight) bestLH = baseLH;
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
          recalculateFontSize(true);
        });
        // Le sous-ensemble ARABE de la police se charge à part : on le demande avec du texte arabe.
        document.fonts.load("20px 'Amiri Quran'", 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ').then(() => recalculateFontSize(true)).catch(() => {});
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
        recalculateFontSize(true);
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
    const onFontsLoaded = () => recalculateFontSize(true);
    fonts?.addEventListener?.('loadingdone', onFontsLoaded);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      fonts?.removeEventListener?.('loadingdone', onFontsLoaded);
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

  // Écran toujours allumé pendant la lecture (Screen Wake Lock) : repris quand on revient sur
  // l'app, relâché en quittant le lecteur. Navigateurs sans support : sans effet.
  // Secours (app installée sur iPhone, ou Wake Lock indisponible/refusé) : une vidéo muette de
  // 16 px jouée en boucle, invisible, empêche la mise en veille (technique « NoSleep »).
  useEffect(() => {
    const nav = navigator as any;
    let lock: any = null;
    let alive = true;
    let video: HTMLVideoElement | null = null;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const startVideo = () => {
      if (!alive) return;
      if (!video) {
        video = document.createElement('video');
        video.src = '/nosleep.mp4';
        video.muted = true;
        video.loop = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('aria-hidden', 'true');
        Object.assign(video.style, { position: 'fixed', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none', bottom: '0', left: '0' });
        document.body.appendChild(video);
      }
      video.play().catch(() => {});
    };

    const acquire = async () => {
      if (!alive || document.visibilityState !== 'visible') return;
      let ok = false;
      if (nav.wakeLock?.request) {
        if (lock && !lock.released) ok = true;
        else {
          try { lock = await nav.wakeLock.request('screen'); ok = true; } catch { ok = false; }
        }
      }
      // Sur iPhone, l'app installée peut ignorer le Wake Lock : on ajoute toujours le secours.
      if (!ok || isIOS) startVideo();
    };

    const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };
    // La lecture vidéo exige parfois un geste : on relance au premier toucher dans le lecteur.
    const onGesture = () => { acquire(); };
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    document.addEventListener('touchstart', onGesture, { passive: true });
    document.addEventListener('click', onGesture);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('click', onGesture);
      lock?.release?.().catch(() => {});
      if (video) { video.pause(); video.remove(); video = null; }
    };
  }, []);

  // Balayage du doigt pour changer de page, comme dans un mushaf : glisser vers la droite = page
  // suivante, vers la gauche = page précédente. Un geste surtout vertical reste un défilement.
  const swipeStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const onSwipeStart = (e: React.TouchEvent) => {
    const tch = e.touches[0];
    swipeStart.current = e.touches.length === 1 ? { x: tch.clientX, y: tch.clientY, t: Date.now() } : null;
  };
  const onSwipeEnd = (e: React.TouchEvent) => {
    const st = swipeStart.current;
    swipeStart.current = null;
    if (!st) return;
    const tch = e.changedTouches[0];
    const dx = tch.clientX - st.x;
    const dy = tch.clientY - st.y;
    if (Date.now() - st.t > 800 || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (window.getSelection()?.toString()) return; // sélection de texte en cours
    if (dx > 0) handleNext();
    else handlePrev();
  };

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
        onTouchStart={onSwipeStart}
        onTouchEnd={onSwipeEnd}
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
                          tappedVerseKey.current = verse.verseKey;
                          if (visualMode === 'focus') {
                            setFocusedVerseKey(verse.verseKey);
                          }
                          onSelectVerseForDetails(verse.verseKey, verse.textUthmani, verse.surahNumber, verse.verseNumber, verse.audioUrl);
                        }}
                        className={`cursor-pointer rounded-sm px-0.5 transition-colors duration-1000 inline ${
                          isVersePlaying 
                            ? 'bg-amber-300/50 dark:bg-amber-900/40 font-bold' 
                            : returnVerseKey === verse.verseKey
                            ? 'verse-return' 
                            : resumeVerseKey === verse.verseKey
                            ? `verse-resume ${resumeGlow ? 'animate-pulse' : ''}`
                            : isFocused
                            ? 'verse-focus'
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
