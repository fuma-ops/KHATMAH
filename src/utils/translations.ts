export type AppLanguage = 'ar' | 'fr' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  continueReading: string;
  currentKhatma: string;
  progress: string;
  currentPosition: string;
  juzLabel: string;
  pageLabel: string;
  daysRemaining: string;
  todaysReading: string;
  pagesToReadToday: string;
  pagesCompletedToday: string;
  completedOf: string;
  navMyKhatma: string;
  navQuran: string;
  navHistory: string;
  navSettings: string;
  selectPlanTitle: string;
  selectPlanSubtitle: string;
  planDuration: string;
  planDailyPages: string;
  planDaysUnit: string;
  startKhatma: string;
  changePlan: string;
  restartKhatma: string;
  pauseKhatma: string;
  resumeKhatma: string;
  confirmRestartTitle: string;
  confirmRestartMsg: string;
  confirmBtn: string;
  cancelBtn: string;
  prevPage: string;
  nextPage: string;
  markPageCompleted: string;
  pageCompletedBadge: string;
  readingViewPure: string;
  readingViewBilingual: string;
  fontSize: string;
  verseDetailsTitle: string;
  tafsirTab: string;
  asbabTab: string;
  contextTab: string;
  lessonsTab: string;
  noAsbabFound: string;
  sourceLabel: string;
  installApp: string;
  installAppIOS: string;
  offlineNotice: string;
  statusActive: string;
  statusPaused: string;
  streakDays: string;
  historyTitle: string;
  noHistoryYet: string;
  bookmarkSaved: string;
  bookmarkRemoved: string;
  bookmarksTitle: string;
  themeParchment: string;
  themeDark: string;
  themeWhite: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  ar: {
    appName: "ختمة",
    tagline: "قرآنك. وتيرتك. ختمتك.",
    continueReading: "متابعة القراءة",
    currentKhatma: "الختمة الحالية",
    progress: "نسبة الإنجاز",
    currentPosition: "موضع القراءة الحالي",
    juzLabel: "الجزء",
    pageLabel: "الصفحة",
    daysRemaining: "الأيام المتبقية",
    todaysReading: "ورد اليوم",
    pagesToReadToday: "صفحات اليوم المطلوبة",
    pagesCompletedToday: "الصفحات المنجزة اليوم",
    completedOf: "من",
    navMyKhatma: "ختمتي",
    navQuran: "المصحف",
    navHistory: "سجل القراءة",
    navSettings: "الإعدادات",
    selectPlanTitle: "اختر خطة الختمة المناسبة لك",
    selectPlanSubtitle: "6 خطط متوازنة ومضبوطة لإنهاء القرآن كاملاً في المدة التي تختارها",
    planDuration: "المدة",
    planDailyPages: "صفحات رقمية يومياً",
    planDaysUnit: "أيام",
    startKhatma: "بدء هذه الختمة",
    changePlan: "تغيير الخطة",
    restartKhatma: "إعادة تعيين الختمة",
    pauseKhatma: "إيقاف مؤقت",
    resumeKhatma: "استئناف الختمة",
    confirmRestartTitle: "تأكيد إعادة البدء",
    confirmRestartMsg: "هل أنت متأكد من رغبتك في إعادة بدء الختمة من البداية؟",
    confirmBtn: "نعم، أعد البدء",
    cancelBtn: "إلغاء",
    prevPage: "الصفحة السابقة",
    nextPage: "الصفحة التالية",
    markPageCompleted: "تمت قراءة هذه الصفحة بنجاح ✓",
    pageCompletedBadge: "تمت القراءة ✓",
    readingViewPure: "المصحف الكامل",
    readingViewBilingual: "الآيات والترجمة",
    fontSize: "حجم الخط",
    verseDetailsTitle: "تفسير الآية وتدبرها",
    tafsirTab: "التفسير المعتمد",
    asbabTab: "أسباب النزول",
    contextTab: "سياق الآيات",
    lessonsTab: "العبر والفوائد",
    noAsbabFound: "لم يرد سبب نزول خاص ثابت بسند معتمد في هذا الموضع.",
    sourceLabel: "المصدر المعتمد",
    installApp: "تثبيت تطبيق ختمة",
    installAppIOS: "تثبيت على آيفون",
    offlineNotice: "أنت في وضع عدم الاتصال — يتم استخدام بيانات المصحف المحفوظة.",
    statusActive: "نشطة",
    statusPaused: "متوقفة مؤقتاً",
    streakDays: "أيام متتالية",
    historyTitle: "سجل القراءات اليومية",
    noHistoryYet: "لا توجد جلسات قراءة مسجلة بعد. ابدأ قراءتك اليوم!",
    bookmarkSaved: "تم حفظ الفاصلة",
    bookmarkRemoved: "تمت إزالة الفاصلة",
    bookmarksTitle: "الفواصل والإشارات المرجعية",
    themeParchment: "ورق المصحف الدافئ",
    themeDark: "قيام الليل (داكن)",
    themeWhite: "أبيض ناصع"
  },
  fr: {
    appName: "KHATMAH",
    tagline: "Votre Coran. Votre Rythme. Votre Khatma.",
    continueReading: "Continuer la lecture",
    currentKhatma: "Khatma en cours",
    progress: "Progression",
    currentPosition: "Position actuelle",
    juzLabel: "Juz",
    pageLabel: "Page",
    daysRemaining: "Jours restants",
    todaysReading: "Lecture du Jour",
    pagesToReadToday: "Pages assignées aujourd'hui",
    pagesCompletedToday: "Pages lues aujourd'hui",
    completedOf: "sur",
    navMyKhatma: "Ma Khatma",
    navQuran: "Le Coran",
    navHistory: "Historique",
    navSettings: "Paramètres",
    selectPlanTitle: "Choisissez votre rythme de Khatma",
    selectPlanSubtitle: "6 programmes équilibrés pour achever le Coran complet dans la durée de votre choix",
    planDuration: "Durée",
    planDailyPages: "pages numériques / jour",
    planDaysUnit: "jours",
    startKhatma: "Choisir ce programme",
    changePlan: "Changer de plan",
    restartKhatma: "Recommencer la Khatma",
    pauseKhatma: "Mettre en pause",
    resumeKhatma: "Reprendre la Khatma",
    confirmRestartTitle: "Confirmer la réinitialisation",
    confirmRestartMsg: "Êtes-vous sûr de vouloir recommencer la Khatma depuis le début ?",
    confirmBtn: "Oui, recommencer",
    cancelBtn: "Annuler",
    prevPage: "Page précédente",
    nextPage: "Page suivante",
    markPageCompleted: "Marquer cette page comme lue ✓",
    pageCompletedBadge: "Page lue ✓",
    readingViewPure: "Mushaf Intégral",
    readingViewBilingual: "Versets & Traduction",
    fontSize: "Taille de police",
    verseDetailsTitle: "Tafsir & Méditation du Verset",
    tafsirTab: "Tafsir Vérifié",
    asbabTab: "Asbab al-Nuzul",
    contextTab: "Contexte du Passage",
    lessonsTab: "Leçons & Méditation",
    noAsbabFound: "Aucune circonstance spécifique de révélation n'est établie pour ce verset.",
    sourceLabel: "Source savante",
    installApp: "Installer l'application",
    installAppIOS: "Installer sur iPhone",
    offlineNotice: "Mode hors-ligne — Le Coran reste disponible sans connexion.",
    statusActive: "En cours",
    statusPaused: "En pause",
    streakDays: "jours consécutifs",
    historyTitle: "Historique des lectures quotidiennes",
    noHistoryYet: "Aucune session enregistrée pour le moment. Commencez votre lecture !",
    bookmarkSaved: "Signet enregistré",
    bookmarkRemoved: "Signet retiré",
    bookmarksTitle: "Signets & Marques-pages",
    themeParchment: "Parchemin Mushaf",
    themeDark: "Nocturne Qiyam",
    themeWhite: "Blanc Épuré"
  },
  en: {
    appName: "KHATMAH",
    tagline: "Your Quran. Your Pace. Your Khatma.",
    continueReading: "Continue Reading",
    currentKhatma: "Current Khatma",
    progress: "Progress",
    currentPosition: "Current Position",
    juzLabel: "Juz",
    pageLabel: "Page",
    daysRemaining: "Days remaining",
    todaysReading: "Today's Reading",
    pagesToReadToday: "Assigned pages today",
    pagesCompletedToday: "Completed pages today",
    completedOf: "of",
    navMyKhatma: "My Khatma",
    navQuran: "Quran",
    navHistory: "History",
    navSettings: "Settings",
    selectPlanTitle: "Select Your Khatma Plan",
    selectPlanSubtitle: "6 balanced plans to complete the entire Quran at your chosen pace",
    planDuration: "Duration",
    planDailyPages: "digital pages / day",
    planDaysUnit: "days",
    startKhatma: "Select this plan",
    changePlan: "Change Plan",
    restartKhatma: "Restart Khatma",
    pauseKhatma: "Pause Khatma",
    resumeKhatma: "Resume Khatma",
    confirmRestartTitle: "Confirm Restart",
    confirmRestartMsg: "Are you sure you want to restart your Khatma from the beginning?",
    confirmBtn: "Yes, Restart",
    cancelBtn: "Cancel",
    prevPage: "Previous page",
    nextPage: "Next page",
    markPageCompleted: "Mark page as completed ✓",
    pageCompletedBadge: "Completed ✓",
    readingViewPure: "Pure Mushaf",
    readingViewBilingual: "Verses & Translation",
    fontSize: "Font size",
    verseDetailsTitle: "Verse Tafsir & Reflection",
    tafsirTab: "Verified Tafsir",
    asbabTab: "Occasions of Revelation",
    contextTab: "Passage Context",
    lessonsTab: "Lessons & Tadabbur",
    noAsbabFound: "No specific authentic occasion of revelation has been established.",
    sourceLabel: "Scholarly source",
    installApp: "Install App",
    installAppIOS: "Install on iPhone",
    offlineNotice: "Offline Mode — Cached Quran data is being used.",
    statusActive: "Active",
    statusPaused: "Paused",
    streakDays: "day streak",
    historyTitle: "Daily Reading History",
    noHistoryYet: "No reading history recorded yet. Begin your reading today!",
    bookmarkSaved: "Bookmark saved",
    bookmarkRemoved: "Bookmark removed",
    bookmarksTitle: "Bookmarks & Markers",
    themeParchment: "Warm Parchment",
    themeDark: "Night Qiyam",
    themeWhite: "Clean White"
  }
};
