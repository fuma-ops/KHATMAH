import React, { useEffect, useRef, useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Check, 
  Layers, 
  Sparkles,
  Bookmark,
  BarChart3,
  CalendarCheck,
  Bell,
  User,
  Globe,
  X
} from 'lucide-react';
import { KhatmaState, KHATMA_PLANS_CONFIG } from '../services/khatmaService';
import { AppLanguage } from '../utils/translations';

// Import the generated clean high-fidelity assets (no baked-in UI or text)
import sacredQuranHeroImg from '../assets/images/sacred_quran_sunset_hero_1794224314300.webp';
import royalEmblemImg from '../assets/images/khatmah_logo.webp';
import quranRehalImg from '../assets/images/quran_rehal_card_1794223662097.webp';
import plannerQuillImg from '../assets/images/planner_quill_card_1794223680272.webp';
import booksBookmarkImg from '../assets/images/books_bookmark_card_1794223697975.webp';
import lanternStudyImg from '../assets/images/lantern_study_card_1794223715621.webp';
import { PWAInstallButton } from './PWAInstallButton';

interface DashboardProps {
  khatma: KhatmaState;
  language: AppLanguage;
  onSelectPlan: (durationDays: 3 | 5 | 7 | 9 | 15 | 30) => void;
  onContinueReading: () => void;
  onNavigateTab: (tab: 'home' | 'khatma' | 'quran' | 'history' | 'settings') => void;
  onOpenSettings: () => void;
  onUpdateLanguage: (lang: AppLanguage) => void;
  onOpenScheduleModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  khatma,
  language,
  onSelectPlan,
  onContinueReading,
  onNavigateTab,
  onOpenSettings,
  onUpdateLanguage,
  onOpenScheduleModal
}) => {
  const isRtl = language === 'ar';
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  // Bouton principal : s'il est caché (sous la barre du bas ou hors écran), un bouton flottant le remplace.
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { rootMargin: '0px 0px -84px 0px', threshold: 0.9 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const marker = khatma.resumeMarker;
  const ctaLabel = marker
    ? (language === 'ar' ? `أكمل من علامتك (${marker.verseKey})` : language === 'en' ? `Resume at my bookmark (${marker.verseKey})` : `Reprendre à mon signet (${marker.verseKey})`)
    : (language === 'ar' ? 'متابعة القراءة' : language === 'en' ? 'Continue reading' : 'Continuer la lecture');

  const totalCompleted = khatma.completedPages.length;
  const overallPercentage = Math.round((totalCompleted / 150) * 100);

  // Circular gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FAF7EE] text-[#24211E] dark:bg-[#151311] dark:text-[#F5F5F4] transition-colors pb-24 lg:pb-12">
      {!ctaVisible && (
        <button
          onClick={onContinueReading}
          className="lg:hidden fixed z-40 bottom-[74px] left-4 right-4 py-3.5 rounded-2xl bg-[#064e3b] active:scale-95 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 animate-pulse-soft"
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>{ctaLabel}</span>
        </button>
      )}
      {/* 1. HERO BANNER: Sacred Holy Quran Centerpiece on Carved Rehal at Sunset */}
      <div className="relative w-full overflow-hidden border-b border-amber-900/10 dark:border-white/5">
        {/* Sacred Quran Centerpiece Background Artwork */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-75 dark:opacity-35 transition-opacity"
          style={{ backgroundImage: `url(${sacredQuranHeroImg})` }}
        />

        {/* Multi-layer Overlays for Crystal-Clear Text Readability on Photo */}
        {/* Layer 1: Softening scrim */}
        <div className="absolute inset-0 bg-amber-950/10 dark:bg-black/40" />

        {/* Layer 2: Central luminous radial halo centered right behind the text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,253,245,0.85)_0%,rgba(255,250,238,0.65)_45%,rgba(250,247,238,0.35)_75%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(21,19,17,0.92)_0%,rgba(21,19,17,0.8)_45%,rgba(21,19,17,0.45)_75%,transparent_100%)]" />

        {/* Layer 3: Smooth top-to-bottom atmospheric fade with backdrop blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7EE]/70 via-[#FAF7EE]/55 to-[#FAF7EE] dark:from-black/80 dark:via-black/70 dark:to-[#151311] backdrop-blur-[1.5px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-14 sm:pb-20 flex flex-col items-center z-10">
          {/* Top Bar on Hero: Language, Notification Bell, User Avatar */}
          <div className="w-full flex items-center justify-end gap-2 sm:gap-3 z-30">
            {/* Télécharger l'app (PWA) : visible sur la version web, caché une fois installée */}
            <div className={isRtl ? 'ml-auto' : 'mr-auto'}>
              <PWAInstallButton language={language} variant="hero" />
            </div>
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-300/70 dark:border-stone-700 text-xs font-bold text-stone-850 dark:text-stone-200 hover:bg-white shadow-xs flex items-center gap-1.5 transition-all"
                title="Changer de langue / Change language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'ar' ? 'العربية' : language === 'fr' ? 'Français' : 'English'}
                </span>
                <span className="text-[9px] opacity-60">▼</span>
              </button>

              {isLangOpen && (
                <div 
                  className={`absolute top-full mt-1.5 w-32 py-1 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-200/80 dark:border-stone-700 text-xs font-semibold z-50 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      onUpdateLanguage('ar');
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-start hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between ${
                      language === 'ar' ? 'text-emerald-800 font-bold' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>العربية</span>
                    {language === 'ar' && <Check className="w-3 h-3 text-emerald-700" />}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateLanguage('fr');
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-start hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between ${
                      language === 'fr' ? 'text-emerald-800 font-bold' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>Français</span>
                    {language === 'fr' && <Check className="w-3 h-3 text-emerald-700" />}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateLanguage('en');
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-start hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between ${
                      language === 'en' ? 'text-emerald-800 font-bold' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3 h-3 text-emerald-700" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                className="relative w-8 h-8 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-300/70 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white flex items-center justify-center shadow-xs transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#064e3b] text-amber-200 text-[10px] font-bold flex items-center justify-center border border-white dark:border-stone-900 shadow-2xs">
                  0
                </span>
              </button>

              {showNotificationToast && (
                <div 
                  className={`absolute top-full mt-2 w-72 p-3.5 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-200/80 dark:border-stone-700 text-xs z-50 animate-in fade-in ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100 pb-1.5 border-b border-black/5 dark:border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ar' ? 'تذكير الورد اليومي' : 'Rappel de lecture'}</span>
                    </span>
                    <button onClick={() => setShowNotificationToast(false)} className="text-stone-400 hover:text-stone-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                    {language === 'ar' 
                      ? 'حان وقت قراءة وردك اليومي ومواصلة ختمتك المباركة في راحة وسكينة.'
                      : 'Prenez quelques minutes pour lire vos pages du jour et avancer vers votre Khatma.'}
                  </p>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-300/70 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white flex items-center justify-center shadow-xs transition-all"
              title="Profil & Paramètres"
            >
              <User className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            </button>
          </div>

          {/* Central Imperial Emblem & Brand in High-Contrast Frosted Glass Pod */}
          <div className="mt-3 sm:mt-5 text-center flex flex-col items-center backdrop-blur-xl bg-[#FFFDF9]/85 dark:bg-stone-900/85 px-7 sm:px-12 py-5 sm:py-6 rounded-3xl border border-amber-300/70 dark:border-amber-500/40 shadow-lg max-w-lg">
            {/* 3D Royal Gold & Emerald Medallion Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl mb-2 hover:scale-105 transition-transform duration-300">
              <img 
                src={royalEmblemImg} 
                alt="Logo Khatmah" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Calligraphic Brand Name with Reem Kufi font and luxury gold shine */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-['Reem_Kufi','Amiri',serif] tracking-tight text-[#111827] dark:text-[#FFFDF9] drop-shadow-xs">
              ختمة
            </h1>
            <div className="text-xs sm:text-sm font-['Cinzel',serif] font-extrabold tracking-[0.35em] text-[#78350F] dark:text-amber-400 uppercase -mt-0.5 drop-shadow-2xs">
              KHATMAH
            </div>

            {/* Sacred Poetic Subtitle */}
            <p className="mt-2 text-xs sm:text-sm font-bold text-[#1F2937] dark:text-[#E5E7EB] font-serif max-w-md leading-relaxed drop-shadow-2xs">
              {language === 'ar' 
                ? 'أقرأ القرآن .. واختمه في المدة التي تناسبك' 
                : language === 'fr' 
                ? 'Lisez le Saint Coran .. et terminez-le au rythme qui vous convient' 
                : 'Read the Holy Quran .. and complete it at your own pace'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT BODY */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20 space-y-6">
        {/* A. Current Khatma Status Card ("ختمتي الحالية") */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FFFDF9]/95 dark:bg-stone-900/95 border border-amber-300/70 dark:border-stone-700 shadow-xl p-5 sm:p-7 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
            {/* Left (or Right in RTL): Circular Progress Gauge with Mosque Silhouette */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-amber-100 dark:stroke-stone-800"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Progress stroke */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-amber-600 dark:stroke-amber-500 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inside Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-stone-900 dark:text-stone-100">
                  {overallPercentage}%
                </span>
                {/* Golden Mosque Silhouette SVG */}
                <svg className="w-12 h-6 text-amber-700/80 dark:text-amber-500/80 -mt-1" viewBox="0 0 100 40" fill="currentColor">
                  <path d="M50 0 C46 8 44 14 44 20 L44 40 L56 40 L56 20 C56 14 54 8 50 0 Z M28 12 C25 17 24 22 24 26 L24 40 L36 40 L36 26 C36 22 35 17 32 12 Z M72 12 C69 17 68 22 68 26 L68 40 L80 40 L80 26 C80 22 79 17 76 12 Z M10 6 L12 6 L12 40 L8 40 L8 6 Z M10 0 L13 6 L7 6 Z M90 6 L92 6 L92 40 L88 40 L88 6 Z M90 0 L93 6 L87 6 Z M0 36 L100 36 L100 40 L0 40 Z" />
                </svg>
              </div>
            </div>

            {/* Center: Khatma Info & Numbers */}
            <div className="flex-1 text-center md:text-start space-y-2.5">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>{language === 'ar' ? 'ختمتي الحالية' : 'Ma Khatma en cours'}</span>
              </div>

              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
                {khatma.durationDays} {language === 'ar' ? (khatma.durationDays <= 10 ? 'أيام' : 'يوماً') : 'jours'}
              </div>

              {/* Two Statistics Tiles */}
              <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-8 pt-1 text-xs">
                {/* Current Juz */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <div className="text-[10px] text-stone-500 font-medium">{language === 'ar' ? 'الجزء الحالي' : 'Juz actuel'}</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
                      {khatma.currentPosition.juz} {language === 'ar' ? 'من' : '/'} 30
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-amber-200/80 dark:bg-stone-700" />

                {/* Juz Page */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <div className="text-[10px] text-stone-500 font-medium">{language === 'ar' ? 'صفحة الجزء' : 'Page du Juz'}</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
                      {khatma.currentPosition.page} {language === 'ar' ? 'من' : '/'} 5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Big CTA Button in ROYAL GREEN */}
            <div className="w-full md:w-auto shrink-0">
              <button
                ref={ctaRef}
                onClick={onContinueReading}
                className="w-full md:w-auto px-7 py-4 rounded-2xl bg-[#064e3b] hover:bg-[#047857] active:bg-[#022c22] text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-3 group hover:scale-[1.01]"
              >
                <BookOpen className="w-5 h-5 text-amber-300" />
                <span>{ctaLabel}</span>
                <ChevronRight className={`w-5 h-5 text-amber-300 group-hover:translate-x-0.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* B. Decorative Divider: "اختر مدة ختم القرآن" */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-600 w-16 sm:w-28" />
          <span className="text-amber-600 text-sm">✦</span>
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-bold text-sm sm:text-base font-serif">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>
              {language === 'ar' 
                ? 'اختر مدة ختم القرآن' 
                : language === 'fr' 
                ? 'Choisissez la durée de votre Khatma' 
                : 'Choose your Khatma Duration'}
            </span>
          </div>
          <span className="text-amber-600 text-sm">✦</span>
          <div className="h-px bg-gradient-to-l from-transparent via-amber-400 to-amber-600 w-16 sm:w-28" />
        </div>

        {/* C. 6 Khatma Duration Cards (Interactive, Royal Green when selected, NO bordeaux) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {KHATMA_PLANS_CONFIG.map((plan) => {
            const isSelected = khatma.durationDays === plan.durationDays;
            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan.durationDays)}
                className={`relative p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-200 flex flex-col items-center justify-center text-center shadow-xs border ${
                  isSelected
                    ? 'bg-[#064e3b] text-white border-amber-400 shadow-md ring-2 ring-amber-400/30 scale-[1.02]'
                    : 'bg-[#FFFDF9]/90 dark:bg-stone-900/90 hover:bg-amber-50/80 text-stone-850 dark:text-stone-100 border-amber-200/80 dark:border-stone-700 hover:border-amber-400'
                }`}
              >
                {/* Top Corner Checkmark Badge if Selected */}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shadow-xs border-2 border-white dark:border-stone-900">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </span>
                )}

                <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
                <span className={`text-sm sm:text-base font-bold font-serif ${isSelected ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`}>
                  {plan.durationDays} {language === 'ar' ? (plan.durationDays <= 10 ? 'أيام' : 'يوماً') : 'jours'}
                </span>
                <span className={`text-[10px] sm:text-[11px] mt-0.5 font-mono ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                  {(() => { const lo = Math.min(...plan.schedule), hi = Math.max(...plan.schedule); return lo === hi ? lo : `${lo}–${hi}`; })()} {language === 'ar' ? (plan.dailyPages <= 10 ? 'صفحات/يوم' : 'صفحة/يوم') : language === 'en' ? 'pages/day' : 'pages/jour'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Schedule Breakdown Trigger Button */}
        <div className="flex items-center justify-center pt-1">
          <button
            onClick={onOpenScheduleModal}
            className="px-5 py-2.5 rounded-full bg-white/95 dark:bg-stone-900/95 border border-amber-300/80 dark:border-stone-700 hover:border-emerald-600 text-xs font-bold text-stone-850 dark:text-stone-200 hover:text-emerald-900 dark:hover:text-emerald-300 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>
              {language === 'ar' 
                ? `عرض جدول وخطة الـ ${khatma.durationDays} يوماً بالتفصيل (الأجزاء والسور اليومية)` 
                : `Voir le programme détaillé (${khatma.durationDays} jours : Juz & Sourates)`}
            </span>
            <span className="text-amber-600 font-bold">✦</span>
          </button>
        </div>

        {/* D. Bottom 4 Quick Access Cards with Realistic Photographic Vignettes (matching mockup) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {/* Card 1: Holy Quran with Rehal Thumbnail */}
          <button
            onClick={() => onNavigateTab('quran')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-stone-900/95 border border-amber-200/90 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-md text-start"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 text-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                  {language === 'ar' ? 'القرآن الكريم' : 'Le Saint Coran'}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">150 {language === 'ar' ? 'صفحة' : 'pages'}</div>
              </div>
            </div>
            {/* Photographic Vignette Thumbnail */}
            <div className="w-14 h-12 sm:w-16 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-amber-200/50 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={quranRehalImg} alt="Coran" className="w-full h-full object-cover" />
            </div>
          </button>

          {/* Card 2: My Daily Plan with Notebook & Quill Thumbnail */}
          <button
            onClick={() => onNavigateTab('khatma')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-stone-900/95 border border-amber-200/90 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-md text-start"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 text-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                  {language === 'ar' ? 'خطتي اليومية' : 'Mon Plan'}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">{khatma.durationDays} {language === 'ar' ? 'يوماً' : 'jours'}</div>
              </div>
            </div>
            {/* Photographic Vignette Thumbnail */}
            <div className="w-14 h-12 sm:w-16 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-amber-200/50 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={plannerQuillImg} alt="Plan" className="w-full h-full object-cover" />
            </div>
          </button>

          {/* Card 3: My Bookmarks with Books & Ribbon Bookmark Thumbnail */}
          <button
            onClick={() => onNavigateTab('history')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-stone-900/95 border border-amber-200/90 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-md text-start"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 text-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                  {language === 'ar' ? 'علاماتي' : 'Mes Signets'}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">{khatma.bookmarks.length} {language === 'ar' ? 'علامة' : 'signets'}</div>
              </div>
            </div>
            {/* Photographic Vignette Thumbnail */}
            <div className="w-14 h-12 sm:w-16 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-amber-200/50 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={booksBookmarkImg} alt="Signets" className="w-full h-full object-cover" />
            </div>
          </button>

          {/* Card 4: My Statistics with Lantern Thumbnail */}
          <button
            onClick={() => onNavigateTab('history')}
            className="group p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-stone-900/95 border border-amber-200/90 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-md text-start"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 text-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                  {language === 'ar' ? 'إحصاءاتي' : 'Statistiques'}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">{khatma.completedPages.length} / 150</div>
              </div>
            </div>
            {/* Photographic Vignette Thumbnail */}
            <div className="w-14 h-12 sm:w-16 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-amber-200/50 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={lanternStudyImg} alt="Statistiques" className="w-full h-full object-cover" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
