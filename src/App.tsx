/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  CalendarCheck, 
  Bookmark, 
  BarChart3, 
  Settings as SettingsIcon, 
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import royalEmblemImg from './assets/images/khatmah_logo.webp';
import { KhatmaSelector } from './components/KhatmaSelector';
import { QuranReader } from './components/QuranReader';
import { ReadingHistory } from './components/ReadingHistory';
import { SettingsModal } from './components/SettingsModal';
import { VerseDetailsModal } from './components/VerseDetailsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DuaModal } from './components/DuaModal';
import { KhatmaScheduleModal } from './components/KhatmaScheduleModal';
import { DailyWirdCelebrationModal } from './components/DailyWirdCelebrationModal';
import { StartWirdOverlayModal } from './components/StartWirdOverlayModal';

import { 
  loadKhatmaState, 
  saveKhatmaState, 
  loadUserLanguage, 
  saveUserLanguage, 
  DEFAULT_KHATMA_STATE 
} from './utils/khatmaStorage';
import { 
  loadReadingSettings, 
  saveReadingSettings, 
  DEFAULT_SETTINGS 
} from './utils/storage';
import { KhatmaState, getTodaysAssignedTarget, PastKhatmaRecord } from './services/khatmaService';
import { getPageSurahRange, getPlanScheduleBreakdown } from './services/khatmaScheduleHelper';
import { ReadingSettings } from './types/quran';
import { AppLanguage } from './utils/translations';
import { todayISO } from './utils/localDate';

export default function App() {
  const [khatma, setKhatma] = useState<KhatmaState>(loadKhatmaState);
  const [language, setLanguage] = useState<AppLanguage>(loadUserLanguage);
  const isRtl = language === 'ar';
  const [settings, setSettings] = useState<ReadingSettings>(loadReadingSettings);
  const [currentTab, setCurrentTab] = useState<'home' | 'khatma' | 'quran' | 'history' | 'settings'>('home');

  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDailyCelebrationOpen, setIsDailyCelebrationOpen] = useState(false);
  const [celebratedPagesCount, setCelebratedPagesCount] = useState(0);
  const [celebratedWirdNumber, setCelebratedWirdNumber] = useState(1);

  const [startWirdOverlay, setStartWirdOverlay] = useState<{
    isOpen: boolean;
    wirdNumber: number;
    targetJuz: number;
    targetPage: number;
    surahRange: string;
    juzLabel: string;
  }>({
    isOpen: false,
    wirdNumber: 1,
    targetJuz: 1,
    targetPage: 1,
    surahRange: 'من سورة الفاتحة إلى سورة البقرة',
    juzLabel: 'الجزء 1'
  });

  const [verseModal, setVerseModal] = useState<{
    isOpen: boolean;
    verseKey: string | null;
    arabicText: string;
    surahNumber: number;
    verseNumber: number;
    audioUrl?: string;
  }>({
    isOpen: false,
    verseKey: null,
    arabicText: '',
    surahNumber: 1,
    verseNumber: 1
  });

  // Persist state changes
  useEffect(() => {
    saveKhatmaState(khatma);
  }, [khatma]);

  useEffect(() => {
    saveUserLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    saveReadingSettings(settings);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Audio player helper
  const handlePlayAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(err => console.error("Audio error:", err));
  };

  // Open Isti'adhah Niyyah Overlay before starting a wird or khatma
  const handleOpenStartWirdOverlay = (
    wirdNum: number = 1,
    targetJuz?: number,
    targetPage?: number,
    surahRange?: string,
    juzLabel?: string
  ) => {
    const schedule = getPlanScheduleBreakdown(khatma.durationDays);
    const dayItem = schedule.find(d => d.dayNumber === wirdNum) || schedule[0];

    const tj = targetJuz || dayItem.startJuz;
    const tp = targetPage || dayItem.startPage;
    const sr = surahRange || (language === 'ar' ? dayItem.surahRangeAr : dayItem.surahRangeFr);
    const jl = juzLabel || (language === 'ar' ? dayItem.juzLabelAr : dayItem.juzLabelFr);

    setStartWirdOverlay({
      isOpen: true,
      wirdNumber: wirdNum,
      targetJuz: tj,
      targetPage: tp,
      surahRange: sr,
      juzLabel: jl
    });
  };

  const handleConfirmStartWird = (targetJuz: number, targetPage: number) => {
    const nowIso = new Date().toISOString();
    setKhatma(prev => ({
      ...prev,
      hasStarted: true,
      startDateTime: prev.hasStarted && prev.startDateTime ? prev.startDateTime : nowIso,
      startDate: prev.hasStarted ? prev.startDate : todayISO(),
      currentPosition: { juz: targetJuz, page: targetPage }
    }));
    setStartWirdOverlay(prev => ({ ...prev, isOpen: false }));
    setIsScheduleModalOpen(false);
    setCurrentTab('quran');
  };

  // Khatma Handlers
  const handleSelectPlan = (durationDays: 3 | 5 | 7 | 9 | 15 | 30) => {
    setKhatma(prev => ({
      ...prev,
      durationDays,
      planId: `plan-${durationDays}-days`
    }));
    setIsScheduleModalOpen(true);
  };

  const handleTogglePause = () => {
    setKhatma(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active'
    }));
  };

  const handleRestartKhatma = () => {
    setKhatma({
      ...DEFAULT_KHATMA_STATE,
      khatmaNumber: khatma.khatmaNumber || 1,
      durationDays: khatma.durationDays,
      planId: khatma.planId,
      startDate: todayISO(),
      startDateTime: new Date().toISOString(),
      pastKhatmas: khatma.pastKhatmas || []
    });
  };

  const handleToggleCompletePage = (juz: number, page: number) => {
    const key = `${juz}-${page}`;
    const exists = khatma.completedPages.includes(key);
    const todayStr = todayISO();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let newCompleted: string[];
    let newDailyCount = khatma.dailyLog[todayStr] || 0;
    let newSessions = [...(khatma.readingSessions || [])];

    if (exists) {
      newCompleted = khatma.completedPages.filter(p => p !== key);
      newDailyCount = Math.max(0, newDailyCount - 1);
    } else {
      newCompleted = [...khatma.completedPages, key];
      newDailyCount += 1;

      // Record detailed reading session with exact time and authentic Surah range
      const surahInfo = getPageSurahRange(juz, page);
      const overallPage = (juz - 1) * 5 + page;

      newSessions.unshift({
        id: `sess-${Date.now()}-${juz}-${page}`,
        date: todayStr,
        time: timeStr,
        timestamp: now.toISOString(),
        juzNumber: juz,
        pageNumber: page,
        overallPage,
        surahRangeArabic: surahInfo.ar,
        surahRangeTranslit: surahInfo.fr
      });
    }

    // Auto-advance pointer to next page if completing current
    let nextJuz = khatma.currentPosition.juz;
    let nextPage = khatma.currentPosition.page;
    if (!exists && juz === khatma.currentPosition.juz && page === khatma.currentPosition.page) {
      if (page < 5) {
        nextPage = page + 1;
      } else if (juz < 30) {
        nextJuz = juz + 1;
        nextPage = 1;
      }
    }

    // Calculate Wird completions based on schedule breakdown
    const scheduleBreakdown = getPlanScheduleBreakdown(khatma.durationDays);
    let newCompletedWirds = [...(khatma.completedWirds || [])];
    let newCelebratedWirds = [...(khatma.celebratedWirds || [])];
    let justCompletedWirdNumber = 0;

    // Find if this page completion finishes a wird
    if (!exists) {
      for (const dayItem of scheduleBreakdown) {
        const isWirdFullyFinished = dayItem.pageKeys.every(k => newCompleted.includes(k));
        // Clé par plan : changer de plan ne doit pas empêcher la célébration du jour.
        const wirdTag = `wird-${khatma.durationDays}-${dayItem.dayNumber}`;

        if (isWirdFullyFinished && !newCelebratedWirds.includes(wirdTag)) {
          newCelebratedWirds.push(wirdTag);
          justCompletedWirdNumber = dayItem.dayNumber;

          // Add record
          newCompletedWirds.push({
            wirdNumber: dayItem.dayNumber,
            planDuration: khatma.durationDays,
            juzLabel: language === 'ar' ? dayItem.juzLabelAr : dayItem.juzLabelFr,
            surahRange: language === 'ar' ? dayItem.surahRangeAr : dayItem.surahRangeFr,
            completedAt: now.toISOString(),
            completedTime: timeStr,
            completedDate: todayStr,
            pagesCount: dayItem.pageCount
          });
        }
      }
    }

    // 1. Full Khatma Completed (150 pages) -> Record in pastKhatmas & increment khatmaNumber
    if (newCompleted.length >= 150) {
      const currentKhatmaNum = khatma.khatmaNumber || 1;
      const finishedKhatmaRecord: PastKhatmaRecord = {
        id: `khatma-completed-${Date.now()}`,
        khatmaNumber: currentKhatmaNum,
        durationDays: khatma.durationDays,
        planId: khatma.planId,
        startedAt: khatma.startDateTime || now.toISOString(),
        startDate: khatma.startDate || todayStr,
        startTime: khatma.startDateTime ? new Date(khatma.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00',
        completedAt: now.toISOString(),
        completedDate: todayStr,
        completedTime: timeStr,
        monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        year: now.getFullYear(),
        wirds: newCompletedWirds
      };

      setKhatma(prev => ({
        ...prev,
        khatmaNumber: currentKhatmaNum + 1,
        hasStarted: false,
        completedPages: [],
        currentPosition: { juz: 1, page: 1 },
        dailyLog: { ...prev.dailyLog, [todayStr]: newDailyCount },
        readingSessions: newSessions,
        completedWirds: [],
        celebratedWirds: [],
        pastKhatmas: [finishedKhatmaRecord, ...(prev.pastKhatmas || [])],
        lastReadDate: todayStr
      }));

      setIsDuaOpen(true);
      return;
    }

    // 2. If a wird was just finished, open celebration modal for that specific wird!
    if (justCompletedWirdNumber > 0) {
      setCelebratedWirdNumber(justCompletedWirdNumber);
      setCelebratedPagesCount(newDailyCount);
      setIsDailyCelebrationOpen(true);
    }

    setKhatma(prev => ({
      ...prev,
      hasStarted: true,
      startDateTime: prev.startDateTime || now.toISOString(),
      completedPages: newCompleted,
      currentPosition: { juz: nextJuz, page: nextPage },
      dailyLog: {
        ...prev.dailyLog,
        [todayStr]: newDailyCount
      },
      readingSessions: newSessions,
      completedWirds: newCompletedWirds,
      celebratedWirds: newCelebratedWirds,
      // Page terminée : le signet posé sur cette page n'a plus lieu d'être.
      resumeMarker: !exists && prev.resumeMarker && prev.resumeMarker.juz === juz && prev.resumeMarker.page === page ? null : prev.resumeMarker,
      lastReadDate: todayStr
    }));
  };

  // Signet de reprise (milieu de page) : un seul à la fois ; retoucher le même verset l'enlève.
  const handleToggleResumeMarker = (verseKey: string) => {
    setKhatma(prev => {
      const same = prev.resumeMarker?.verseKey === verseKey;
      return {
        ...prev,
        hasStarted: true,
        resumeMarker: same ? null : {
          juz: prev.currentPosition.juz,
          page: prev.currentPosition.page,
          verseKey,
          savedAt: new Date().toISOString()
        }
      };
    });
  };

  const handleNavigatePage = (juz: number, page: number) => {
    setKhatma(prev => ({
      ...prev,
      currentPosition: { juz, page }
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (juz: number, page: number) => {
    const exists = khatma.bookmarks.some(b => b.juz === juz && b.page === page);
    let newBookmarks = [...khatma.bookmarks];

    if (exists) {
      newBookmarks = newBookmarks.filter(b => !(b.juz === juz && b.page === page));
    } else {
      newBookmarks.push({
        juz,
        page,
        timestamp: new Date().toISOString(),
        note: `Juz ${juz} · Page ${page}/5`
      });
    }

    setKhatma(prev => ({
      ...prev,
      bookmarks: newBookmarks
    }));
  };

  const handleDeleteBookmark = (juz: number, page: number) => {
    setKhatma(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => !(b.juz === juz && b.page === page))
    }));
  };

  // Keyboard navigation for Quran reader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (currentTab !== 'quran') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (khatma.currentPosition.page < 5) {
          handleNavigatePage(khatma.currentPosition.juz, khatma.currentPosition.page + 1);
        } else if (khatma.currentPosition.juz < 30) {
          handleNavigatePage(khatma.currentPosition.juz + 1, 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (khatma.currentPosition.page > 1) {
          handleNavigatePage(khatma.currentPosition.juz, khatma.currentPosition.page - 1);
        } else if (khatma.currentPosition.juz > 1) {
          handleNavigatePage(khatma.currentPosition.juz - 1, 5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, khatma.currentPosition.juz, khatma.currentPosition.page]);

  // When reading the Quran, render the dedicated distraction-free reading canvas
  // Fenêtres communes à l'accueil ET à l'écran de lecture : célébration du jour, dua de fin de
  // Khatma et ouverture du wird (on termine souvent sa dernière page dans le lecteur).
  const sharedModals = (
    <>
      <DuaModal
        isOpen={isDuaOpen}
        onClose={() => setIsDuaOpen(false)}
        language={language}
      />

      <DailyWirdCelebrationModal
        isOpen={isDailyCelebrationOpen}
        onClose={() => setIsDailyCelebrationOpen(false)}
        onContinueReading={() => {
          setIsDailyCelebrationOpen(false);
          setCurrentTab('quran');
        }}
        onGoHome={() => {
          setIsDailyCelebrationOpen(false);
          setCurrentTab('home');
        }}
        language={language}
        khatma={khatma}
        pagesReadToday={celebratedPagesCount || (khatma.dailyLog[todayISO()] || 1)}
        wirdNumber={celebratedWirdNumber}
        onStartNextWird={(nextWirdNum) => {
          setIsDailyCelebrationOpen(false);
          const schedule = getPlanScheduleBreakdown(khatma.durationDays);
          const dayItem = schedule.find(d => d.dayNumber === nextWirdNum) || schedule[0];
          handleOpenStartWirdOverlay(
            nextWirdNum,
            dayItem.startJuz,
            dayItem.startPage,
            language === 'ar' ? dayItem.surahRangeAr : dayItem.surahRangeFr,
            language === 'ar' ? dayItem.juzLabelAr : dayItem.juzLabelFr
          );
        }}
      />

      <StartWirdOverlayModal
        isOpen={startWirdOverlay.isOpen}
        onClose={() => setStartWirdOverlay(prev => ({ ...prev, isOpen: false }))}
        onConfirmStart={handleConfirmStartWird}
        language={language}
        khatmaNumber={khatma.khatmaNumber || 1}
        durationDays={khatma.durationDays}
        wirdNumber={startWirdOverlay.wirdNumber}
        targetJuz={startWirdOverlay.targetJuz}
        targetPage={startWirdOverlay.targetPage}
        surahRange={startWirdOverlay.surahRange}
        juzLabel={startWirdOverlay.juzLabel}
      />

    </>
  );

  if (currentTab === 'quran') {
    const isCurrentPageCompleted = khatma.completedPages.includes(
      `${khatma.currentPosition.juz}-${khatma.currentPosition.page}`
    );
    const isCurrentPageBookmarked = khatma.bookmarks.some(
      b => b.juz === khatma.currentPosition.juz && b.page === khatma.currentPosition.page
    );

    return (
      <>
        <QuranReader
          juzNumber={khatma.currentPosition.juz}
          pageIndex={khatma.currentPosition.page}
          isCompleted={isCurrentPageCompleted}
          isBookmarked={isCurrentPageBookmarked}
          settings={settings}
          language={language}
          onBack={() => setCurrentTab('home')}
          onNavigatePage={handleNavigatePage}
          onToggleComplete={handleToggleCompletePage}
          onToggleBookmark={handleToggleBookmark}
          onUpdateFontSize={(fontSize) => setSettings(s => ({ ...s, fontSize }))}
          resumeVerseKey={
            khatma.resumeMarker && khatma.resumeMarker.juz === khatma.currentPosition.juz && khatma.resumeMarker.page === khatma.currentPosition.page
              ? khatma.resumeMarker.verseKey
              : undefined
          }
          onSelectVerseForDetails={(verseKey, textArabic, surahNum, verseNum, audioUrl) => {
            setVerseModal({
              isOpen: true,
              verseKey,
              arabicText: textArabic,
              surahNumber: surahNum,
              verseNumber: verseNum,
              audioUrl
            });
          }}
        />

        <VerseDetailsModal
          isOpen={verseModal.isOpen}
          onClose={() => setVerseModal(m => ({ ...m, isOpen: false }))}
          verseKey={verseModal.verseKey}
          arabicText={verseModal.arabicText}
          surahNumber={verseModal.surahNumber}
          verseNumber={verseModal.verseNumber}
          language={language}
          audioUrl={verseModal.audioUrl}
          onPlayAudio={handlePlayAudio}
          isResumeMarker={!!verseModal.verseKey && khatma.resumeMarker?.verseKey === verseModal.verseKey}
          onToggleResumeMarker={() => {
            if (verseModal.verseKey) handleToggleResumeMarker(verseModal.verseKey);
            setVerseModal(m => ({ ...m, isOpen: false }));
          }}
        />

        {sharedModals}

        <OfflineIndicator language={language} />
      </>
    );
  }

  // Otherwise, render full standard application shell with Sidebar (Desktop) and Bottom Nav (Mobile)
  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors ${
      settings.theme === 'mushaf' 
        ? 'theme-mushaf bg-[#FAF7EE] text-[#1C1917]' 
        : settings.theme === 'dark' 
        ? 'bg-[#151311] text-[#F5F5F4]' 
        : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      {/* DESKTOP SIDEBAR (Visible on lg+ screens, Royal Green active states, NO bordeaux) */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 shrink-0 bg-[#FAF7EE] dark:bg-[#151311] border-amber-900/10 dark:border-white/5 h-screen sticky top-0 overflow-hidden z-30 select-none ${
        isRtl ? 'border-l order-first' : 'border-r order-first'
      }`}>
        <div className="p-6 flex flex-col items-center">
          {/* Logo at Top */}
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex flex-col items-center text-center group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-2xl shadow-md mb-2 group-hover:scale-105 transition-transform duration-300">
              <img 
                src={royalEmblemImg} 
                alt="Logo Khatmah" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <span className="text-3xl font-bold font-['Reem_Kufi','Amiri',serif] text-stone-900 dark:text-stone-100">ختمة</span>
            <span className="text-[10px] font-bold font-['Cinzel',serif] tracking-[0.3em] text-amber-850 dark:text-amber-400 uppercase -mt-0.5">KHATMAH</span>
          </button>

          {/* Navigation Items (Royal Green for active states) */}
          <nav className="w-full mt-7 space-y-2 text-sm font-bold">
            {/* 1. الرئيسية (Home) */}
            <button
              onClick={() => setCurrentTab('home')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                currentTab === 'home'
                  ? 'bg-[#064e3b] text-white shadow-md ring-1 ring-amber-400/30'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5'
              }`}
            >
              <Home className={`w-5 h-5 ${currentTab === 'home' ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400'}`} />
              <span>{language === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
            </button>

            {/* 2. القرآن الكريم (Holy Quran) */}
            <button
              onClick={() => setCurrentTab('quran')}
              className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5"
            >
              <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>{language === 'ar' ? 'القرآن الكريم' : 'Saint Coran'}</span>
            </button>

            {/* 3. خطتي اليومية (My Daily Plan) */}
            <button
              onClick={() => setCurrentTab('khatma')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                currentTab === 'khatma'
                  ? 'bg-[#064e3b] text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>{language === 'ar' ? 'خطتي اليومية' : 'Mon Plan'}</span>
            </button>

            {/* 4. علاماتي (My Bookmarks) */}
            <button
              onClick={() => setCurrentTab('history')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                currentTab === 'history'
                  ? 'bg-[#064e3b] text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>{language === 'ar' ? 'علاماتي' : 'Mes Signets'}</span>
            </button>

            {/* 5. إحصاءاتي (My Statistics) */}
            <button
              onClick={() => setCurrentTab('history')}
              className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5 transition-all"
            >
              <BarChart3 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>{language === 'ar' ? 'إحصاءاتي' : 'Statistiques'}</span>
            </button>

            {/* 6. الإعدادات (Settings) */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-white/5 transition-all"
            >
              <SettingsIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>{language === 'ar' ? 'الإعدادات' : 'Paramètres'}</span>
            </button>
          </nav>
        </div>

        {/* Bottom of Sidebar: Golden Architectural Mosque Arch Watermark Silhouette */}
        <div className="w-full px-4 pb-4 opacity-40 dark:opacity-20 pointer-events-none">
          <svg className="w-full h-32 text-amber-600/50" viewBox="0 0 200 120" fill="currentColor">
            <path d="M100 10 C90 30 85 45 85 60 L85 120 L115 120 L115 60 C115 45 110 30 100 10 Z M50 35 C42 50 38 60 38 75 L38 120 L62 120 L62 75 C62 60 58 50 50 35 Z M150 35 C142 50 138 60 138 75 L138 120 L162 120 L162 75 C162 60 158 50 150 35 Z M10 20 L14 20 L14 120 L6 120 L6 20 Z M190 20 L194 20 L194 120 L186 120 L186 20 Z" />
          </svg>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* On Mobile: Top Navigation Bar with Back & Brand if not on home */}
        {currentTab !== 'home' && (
          <div className="lg:hidden sticky top-0 z-30 h-14 bg-[#FAF7EE]/95 dark:bg-[#151311]/95 backdrop-blur-md border-b border-amber-900/10 px-4 flex items-center justify-between">
            <button 
              onClick={() => setCurrentTab('home')}
              className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5"
            >
              <span>←</span>
              <span>{language === 'ar' ? 'الرئيسية' : 'Retour'}</span>
            </button>
            <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {currentTab === 'khatma' ? (language === 'ar' ? 'خطتي اليومية' : 'Mon Plan') : (language === 'ar' ? 'السجل والعلامات' : 'Historique')}
            </span>
            <div className="w-8" />
          </div>
        )}

        {/* Tab Views */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <Dashboard
              khatma={khatma}
              language={language}
              onSelectPlan={handleSelectPlan}
              onContinueReading={() => {
                if (!khatma.hasStarted) {
                  handleOpenStartWirdOverlay(1, 1, 1);
                } else {
                  // Reprendre au signet s'il y en a un.
                  const m = khatma.resumeMarker;
                  if (m) setKhatma(prev => ({ ...prev, currentPosition: { juz: m.juz, page: m.page } }));
                  setCurrentTab('quran');
                }
              }}
              onNavigateTab={(tab) => {
                if (tab === 'settings') setIsSettingsModalOpen(true);
                else setCurrentTab(tab);
              }}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onUpdateLanguage={setLanguage}
              onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
            />
          )}

          {currentTab === 'khatma' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <KhatmaSelector
                khatma={khatma}
                language={language}
                onSelectPlan={handleSelectPlan}
                onTogglePause={handleTogglePause}
                onRestartKhatma={handleRestartKhatma}
                onStartDayReading={(juz, page) => {
                  const schedule = getPlanScheduleBreakdown(khatma.durationDays);
                  const dayItem = schedule.find(d => d.pageKeys.includes(`${juz}-${page}`)) || schedule[0];
                  handleOpenStartWirdOverlay(
                    dayItem.dayNumber,
                    juz,
                    page,
                    language === 'ar' ? dayItem.surahRangeAr : dayItem.surahRangeFr,
                    language === 'ar' ? dayItem.juzLabelAr : dayItem.juzLabelFr
                  );
                }}
              />
            </div>
          )}

          {currentTab === 'history' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <ReadingHistory
                khatma={khatma}
                language={language}
                onSelectBookmark={(juz, page) => {
                  handleNavigatePage(juz, page);
                  setCurrentTab('quran');
                }}
                onDeleteBookmark={handleDeleteBookmark}
                onOpenQuranPage={(juz, page) => {
                  handleNavigatePage(juz, page);
                  setCurrentTab('quran');
                }}
              />
            </div>
          )}
        </main>

        {/* Desktop Footer */}
        <footer className="border-t border-black/5 dark:border-white/10 py-6 text-center text-xs text-stone-500 mt-auto">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 dark:text-emerald-300">KHATMAH (ختمة)</span>
              <span aria-hidden="true">·</span>
              <span>Your Quran. Your Pace. Your Khatma.</span>
            </div>
            <div className="flex items-center gap-4 text-stone-400 font-mono">
              <span>30 Juz · 150 Pages</span>
              <span>Coran 100% Intégral</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (Matching Mockup with Raised Royal Green Center Button) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7EE]/95 dark:bg-[#151311]/95 backdrop-blur-md border-t border-amber-900/10 dark:border-white/5 px-2 py-1.5 flex items-center justify-around text-[10px] font-bold shadow-lg">
        {/* 1. Settings */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 p-1"
        >
          <SettingsIcon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{language === 'ar' ? 'الإعدادات' : 'Réglages'}</span>
        </button>

        {/* 2. Daily Plan / History */}
        <button
          onClick={() => setCurrentTab('khatma')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'khatma' ? 'text-emerald-800 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-300'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{language === 'ar' ? 'خطتي' : 'Plan'}</span>
        </button>

        {/* 3. Center Raised HOME Button in ROYAL GREEN */}
        <button
          onClick={() => setCurrentTab('home')}
          className="relative -mt-5 px-3.5 py-2.5 rounded-2xl bg-[#064e3b] text-white shadow-lg flex flex-col items-center justify-center ring-4 ring-[#FAF7EE] dark:ring-[#151311] active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5 text-amber-300" />
          <span className="text-[10px] font-bold mt-0.5">{language === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
        </button>

        {/* 4. Quran */}
        <button
          onClick={() => setCurrentTab('quran')}
          className="flex flex-col items-center gap-0.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 p-1"
        >
          <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{language === 'ar' ? 'القرآن' : 'Coran'}</span>
        </button>

        {/* 5. Bookmarks */}
        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentTab === 'history' ? 'text-emerald-800 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-300'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{language === 'ar' ? 'علاماتي' : 'Signets'}</span>
        </button>
      </nav>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        language={language}
        onUpdateSettings={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
        onUpdateLanguage={setLanguage}
        onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
      />

      <KhatmaScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        language={language}
        khatma={khatma}
        onSelectPlan={handleSelectPlan}
        onStartDayReading={(juz, page) => {
          const schedule = getPlanScheduleBreakdown(khatma.durationDays);
          const dayItem = schedule.find(d => d.pageKeys.includes(`${juz}-${page}`)) || schedule[0];
          handleOpenStartWirdOverlay(
            dayItem.dayNumber,
            juz,
            page,
            language === 'ar' ? dayItem.surahRangeAr : dayItem.surahRangeFr,
            language === 'ar' ? dayItem.juzLabelAr : dayItem.juzLabelFr
          );
        }}
      />

      {sharedModals}

      <OfflineIndicator language={language} />
    </div>
  );
}
