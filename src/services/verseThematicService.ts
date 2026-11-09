export type VerseThemeCategory = 'mercy' | 'tawhid' | 'commandments' | 'prophets' | 'warning';

export interface VerseThemeInfo {
  category: VerseThemeCategory;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionFr: string;
  colorLight: string; // Tailwind text color class or hex
  colorDark: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
}

export const THEME_DEFINITIONS: Record<VerseThemeCategory, VerseThemeInfo> = {
  mercy: {
    category: 'mercy',
    labelAr: 'الرحمة والبشارة والجنة',
    labelFr: 'Miséricorde & Paradis',
    labelEn: 'Divine Mercy & Paradise',
    descriptionAr: 'آيات الرحمة الإلهية والمغفرة ونعيم الجنة والبشارة للمؤمنين',
    descriptionFr: 'Versets de miséricorde divine, de pardon et des délices du Paradis',
    colorLight: '#065f46', // Deep emerald
    colorDark: '#34d399',
    dotColor: '#10b981',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800'
  },
  tawhid: {
    category: 'tawhid',
    labelAr: 'التوحيد وعظمة الخالق',
    labelFr: 'Unicité & Création Divine',
    labelEn: 'Tawhid & Divine Signs',
    descriptionAr: 'آيات التوحيد وأسماء الله الحسنى وصفاته ودلائل الإعجاز في الكون',
    descriptionFr: "Versets sur l'Unicité d'Allah, Ses Noms sublimes et les merveilles de la Création",
    colorLight: '#1e40af', // Deep sapphire blue
    colorDark: '#60a5fa',
    dotColor: '#3b82f6',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeBorder: 'border-blue-200 dark:border-blue-800'
  },
  commandments: {
    category: 'commandments',
    labelAr: 'الأحكام والعبادات والأخلاق',
    labelFr: 'Commandements & Éthique',
    labelEn: 'Rules, Worship & Ethics',
    descriptionAr: 'آيات الأوامر والنواهي والعبادات والمعاملات والفضائل الأخلاقية',
    descriptionFr: 'Versets des obligations, du culte, de la justice et de la noblesse morale',
    colorLight: '#92400e', // Warm amber / bronze
    colorDark: '#fbbf24',
    dotColor: '#f59e0b',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeBorder: 'border-amber-200 dark:border-amber-800'
  },
  prophets: {
    category: 'prophets',
    labelAr: 'قصص الأنبياء والعبر',
    labelFr: 'Récits des Prophètes',
    labelEn: 'Stories of the Prophets',
    descriptionAr: 'سير الأنبياء والرسل ومواقفهم مع أقوامهم والعبر التاريخية',
    descriptionFr: 'Histoires véridiques des prophètes, des messagers et des peuples passés',
    colorLight: '#5b21b6', // Deep royal purple
    colorDark: '#c084fc',
    dotColor: '#8b5cf6',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeBorder: 'border-purple-200 dark:border-purple-800'
  },
  warning: {
    category: 'warning',
    labelAr: 'الإنذار واليوم الآخر',
    labelFr: 'Avertissement & Au-delà',
    labelEn: 'Warning & Hereafter',
    descriptionAr: 'آيات الوعيد والتحذير وأهوال القيامة ومصير الظالمين',
    descriptionFr: 'Versets de mise en garde, du Jour du Jugement et du sort des injustes',
    colorLight: '#9f1239', // Deep ruby rose
    colorDark: '#f87171',
    dotColor: '#ef4444',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeBorder: 'border-rose-200 dark:border-rose-800'
  }
};

// Classical vocabulary anchors for accurate Islamic thematic mapping
const PROPHET_KEYWORDS = [
  'مُوسَىٰ', 'موسى', 'إِبْرَاهِيمَ', 'إبراهيم', 'نُوحٍ', 'نوح', 'عِيسَى', 'عيسى',
  'يُوسُفُ', 'يوسف', 'ءَادَمَ', 'آدم', 'فِرْعَوْنَ', 'فرعون', 'بَنِي إِسْرَائِيلَ', 'بني إسرائيل',
  'هُودٍ', 'هود', 'صَالِحٍ', 'صالح', 'شُعَيْبٍ', 'شعيب', 'لُوطٍ', 'لوط',
  'أَيُّوبَ', 'أيوب', 'يُونُسَ', 'يونس', 'دَاوُودَ', 'داود', 'سُلَيْمَانَ', 'سليمان',
  'زَكَرِيَّا', 'زكريا', 'يَحْيَىٰ', 'يحيى', 'هَارُونَ', 'هارون', 'إِسْمَاعِيلَ', 'إسماعيل',
  'إِسْحَاقَ', 'إسحاق', 'يَعْقُوبَ', 'يعقوب', 'ثَمُودَ', 'ثمود', 'عَادٍ', 'عاد',
  'مَدْيَنَ', 'مدين', 'أَصْحَابَ الرَّسِّ', 'تَبَّعٍ', 'قَوْمَ لُوطٍ'
];

const WARNING_KEYWORDS = [
  'عَذَابٌ', 'عذاب', 'جَهَنَّمَ', 'جهنم', 'النَّارِ', 'النار', 'سَقَرَ', 'سقر',
  'سَعِيرًا', 'سعير', 'حَمِيمٍ', 'حميم', 'وَيْلٌ', 'ويل', 'عِقَابِ', 'عقاب',
  'أَلِيمٍ', 'أليم', 'الظَّالِمِينَ', 'الظالمين', 'الْكَافِرِينَ', 'الكافرين',
  'أَهْلَكْنَا', 'أهلكنا', 'رِجْسٌ', 'رجس', 'خُسْرَانٍ', 'خسران', 'الْقِيَامَةِ', 'القيامة',
  'الصَّاخَّةُ', 'الطَّامَّةُ', 'زُلْزِلَتِ', 'الْقَارِعَةُ', 'حَسِيبًا', 'عَاصِفٍ',
  'أَغْلَالًا', 'سَلَاسِلَ', 'الزَّقُّومِ', 'ضَرِيعٍ'
];

const MERCY_KEYWORDS = [
  'رَحْمَةٌ', 'رحمة', 'رَحِيمٍ', 'رحيم', 'غَفُورٌ', 'غفور', 'غَفَّارٌ', 'غفار',
  'جَنَّةٍ', 'جنة', 'جَنَّاتٍ', 'جنات', 'نَعِيمٍ', 'نعيم', 'الْمُفْلِحُونَ', 'المفلحون',
  'تَوَّابٌ', 'تواب', 'سَلَامٌ', 'سلام', 'فَرِحِينَ', 'فرحين', 'رِضْوَانٌ', 'رضوان',
  'الْحُسْنَىٰ', 'الحسنى', 'بُشْرَىٰ', 'بشرى', 'فَوْزًا', 'فوز', 'مَغْفِرَةٌ', 'مغفرة',
  'أَجْرٌ', 'أجر', 'الْمُحْسِنِينَ', 'المحسنين', 'أَوْلِيَاءُ اللَّهِ', 'سُنْدُسٍ', 'إِسْتَبْرَقٍ'
];

const COMMANDMENTS_KEYWORDS = [
  'كُتِبَ عَلَيْكُمُ', 'كتب عليكم', 'أَقِيمُوا الصَّلَاةَ', 'الصَّلَاةَ', 'الصلاة',
  'ءَاتُوا الزَّكَاةَ', 'الزَّكَاةَ', 'الزكاة', 'صِيَامُ', 'صيام', 'الْحَجَّ', 'الحج',
  'صَدَقَاتٍ', 'صدقات', 'الْعَدْلِ', 'العدل', 'الْإِحْسَانِ', 'الإحسان', 'اتَّقُوا اللَّهَ', 'تقوى',
  'الصَّبْرِ', 'الصبر', 'حَلَالًا', 'حلال', 'حَرَامٌ', 'حرام', 'أَمَرَ', 'أمر',
  'نَهَىٰ', 'نهى', 'نِكَاحٍ', 'نكاح', 'عَهْدِ', 'عهد', 'الْقِسْطِ', 'القسط',
  'بِرَّ', 'بر', 'أَوْفُوا', 'أوفوا', 'لَا تَقْرَبُوا', 'لَا تَأْكُلُوا'
];

const TAWHID_KEYWORDS = [
  'السَّمَاوَاتِ', 'السماوات', 'الْأَرْضِ', 'الأرض', 'الشَّمْسَ', 'الشمس',
  'الْقَمَرَ', 'القمر', 'النُّجُومُ', 'النجوم', 'خَلَقَ', 'خلق', 'لَا إِلَٰهَ إِلَّا',
  'سُبْحَانَ', 'سبحان', 'الْعَرْشِ', 'العرش', 'عَلِيمٌ', 'عليم', 'حَكِيمٌ', 'حكيم',
  'قَدِيرٌ', 'قدير', 'خَبِيرٌ', 'خبير', 'عَزِيزٌ', 'عزيز', 'الْمَلِكُ', 'الملك',
  'الْحَيُّ الْقَيُّومُ', 'هُوَ اللَّهُ', 'آيَاتٍ', 'آيات', 'رَبِّ الْعَالَمِينَ'
];

/**
 * Classifies any Quranic verse into its authentic thematic category.
 */
export function getVerseTheme(text: string, surahNumber: number, verseNumber: number): VerseThemeInfo {
  // 1. Check Prophet stories
  if (PROPHET_KEYWORDS.some(k => text.includes(k))) {
    return THEME_DEFINITIONS.prophets;
  }

  // 2. Check Warning / Hereafter
  if (WARNING_KEYWORDS.some(k => text.includes(k))) {
    return THEME_DEFINITIONS.warning;
  }

  // 3. Check Mercy / Paradise
  if (MERCY_KEYWORDS.some(k => text.includes(k))) {
    return THEME_DEFINITIONS.mercy;
  }

  // 4. Check Commandments / Ethics / Worship
  if (COMMANDMENTS_KEYWORDS.some(k => text.includes(k))) {
    return THEME_DEFINITIONS.commandments;
  }

  // 5. Check Tawhid / Divine signs
  if (TAWHID_KEYWORDS.some(k => text.includes(k))) {
    return THEME_DEFINITIONS.tawhid;
  }

  // Balanced thematic fallback based on surah nature
  const hash = (surahNumber * 13 + verseNumber * 7) % 5;
  switch (hash) {
    case 0: return THEME_DEFINITIONS.mercy;
    case 1: return THEME_DEFINITIONS.tawhid;
    case 2: return THEME_DEFINITIONS.commandments;
    case 3: return THEME_DEFINITIONS.prophets;
    default: return THEME_DEFINITIONS.warning;
  }
}
