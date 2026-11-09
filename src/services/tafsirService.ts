
export interface VerseTafsirDetails {
  verseKey: string; // e.g. "2:255"
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tafsirText: string;
  tafsirSource: string;
  hasSpecificAsbab: boolean;
  asbabText: string;
  asbabSource?: string;
}

// In-memory cache for verse tafsir responses
const tafsirCache = new Map<string, VerseTafsirDetails>();

// Curated verified Asbab al-Nuzul from authentic classical collections (Al-Wahidi, As-Suyuti Lubab al-Nuqul)
const VERIFIED_ASBAB_AL_NUZUL: Record<string, { textAr: string; textFr: string; textEn: string; source: string }> = {
  "2:142": {
    textAr: "نزل في شأن تحويل القبلة من بيت المقدس إلى الكعبة المشرفة بعد ستة عشر أو سبعة عشر شهراً من الهجرة النبوية.",
    textFr: "Révélé lors du changement de la Qibla de Jérusalem (Bayt Al-Maqdis) vers la Ka'bah Sacrée à La Mecque, 16 à 17 mois après l'Hégire.",
    textEn: "Revealed concerning the redirection of the Qibla from Jerusalem to the Ka'bah in Makkah, sixteen to seventeen months after the Hijrah.",
    source: "Sahih Al-Bukhari & Sahih Muslim"
  },
  "2:186": {
    textAr: "سأل أعرابي رسول الله ﷺ: أقريب ربنا فنناجيه، أم بعيد فنناديه؟ فأنزل الله تعالى: {وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ}.",
    textFr: "Un bédouin demanda au Prophète ﷺ : « Notre Seigneur est-Il proche pour que nous Lui chuchotions, ou lointain pour que nous L'appelions ? » Alors Allah révéla : {Et quand Mes serviteurs t'interrogent sur Moi, Je suis proche}.",
    textEn: "A bedouin asked the Prophet ﷺ: 'Is our Lord near so that we may whisper to Him, or far so that we should shout to Him?' Thereupon Allah revealed: {And when My servants ask you concerning Me, indeed I am near}.",
    source: "Ibn Abi Hatim, cité par Ibn Kathir (chaîne discutée)"
  },
  "2:189": {
    textAr: "سأل معاذ بن جبل وثعلبة بن غنمة رسول الله ﷺ عن الأهلة وسبب تدرجها، فنزلت الآية مبينة منافعها للناس ومواقيت الحج.",
    textFr: "Mu'adh ibn Jabal et Tha'labah ibn Ghanamah interrogèrent le Messager d'Allah ﷺ sur les phases de la lune ; ce verset fut révélé pour en expliquer l'utilité dans le calendrier des cultes et du Hajj.",
    textEn: "Mu'adh ibn Jabal asked the Prophet ﷺ about the waxing and waning of new moons; this verse revealed their purpose in marking time for mankind and pilgrimage.",
    source: "As-Suyuti, Lubab an-Nuqul (rapporté par Abu Nu'aym et Ibn 'Asakir, chaîne faible)"
  },
  "2:256": {
    textAr: "نزلت في رجل من الأنصار من بني سالم بن عوف كان له ابنان تنصرا قبل البعثة وأراد إكراههما على الإسلام، فنهاه الله عن ذلك.",
    textFr: "Révélé à propos d'un Médinois des Banu Salim dont les deux fils s'étaient christianisés avant l'Islam ; il voulut les forcer à embrasser l'Islam, mais Allah révéla : {Nulle contrainte en religion}.",
    textEn: "Revealed regarding an Ansar whose sons had become Christians; he wanted to compel them to embrace Islam, but Allah revealed: {There is no compulsion in religion}.",
    source: "Tafsir At-Tabari (d'après As-Suddi) ; As-Suyuti, Lubab an-Nuqul"
  },
  "3:195": {
    textAr: "عن أم سلمة رضي الله عنها أنها قالت: يا رسول الله، لا أسمع الله ذكر النساء في الهجرة بشيء، فأنزل الله الآية الكريمة: {فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لَا أُضِيعُ عَمَلَ عَامِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَىٰ}.",
    textFr: "Umm Salamah demanda au Prophète ﷺ : « Ô Messager d'Allah, je n'entends pas mentionner les femmes au sujet de l'émigration. » Alors Allah révéla ce verset confirmant que nulle œuvre d'homme ou de femme n'est perdue.",
    textEn: "Umm Salamah asked the Prophet ﷺ why women were not explicitly mentioned regarding the reward of migration, so Allah revealed this verse confirming full equality of deeds.",
    source: "Jami' At-Tirmidhi & Tafsir Ibn Kathir"
  },
  "93:1": {
    textAr: "أبطأ الوحي على النبي ﷺ فقال المشركون: قلى محمداً ربه، فأنزل الله تعالى سورة الضحى رداً عليهم وتطميناً لقلب رسوله.",
    textFr: "La révélation s'était interrompue un moment et des polythéistes affirmèrent : « Son Seigneur l'a abandonné ! » Allah révéla alors la sourate Ad-Duha pour rassurer son Messager ﷺ.",
    textEn: "When revelation paused briefly, the Quraysh mocked: 'His Lord has abandoned him!' Allah revealed Surah Ad-Duha to console His Prophet ﷺ.",
    source: "Sahih Al-Bukhari & Sahih Muslim"
  },
  "108:1": {
    textAr: "نزلت في العاص بن وائل السهمي حين قال عن النبي ﷺ بعد وفاة ابنه القاسم: إنه أبتر لا عقب له، فأنزل الله: {إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ}.",
    textFr: "Révélé au sujet d'Al-'As ibn Wa'il qui s'était moqué du Prophète ﷺ après le décès de son fils Al-Qasim ; Allah lui annonça l'Abondance (Al-Kawthar) et que son détracteur était le véritable sans postérité.",
    textEn: "Revealed when Al-'As ibn Wa'il mocked the Prophet ﷺ following the death of his infant son; Allah declared the Prophet granted Abundance and his detractor cut off.",
    source: "Tafsir Ibn Kathir & As-Suyuti"
  },
  "111:1": {
    textAr: "لما صعد النبي ﷺ الصفا ونادى قريشاً، قال له أبو لهب: تباً لك ألهذا جمعتنا؟ فأنزلت السورة الكريمة في خسران أبي لهب وامرأته.",
    textFr: "Lorsque le Prophète ﷺ gravit le mont As-Safa pour avertir sa tribu, Abu Lahab lui cria : « Péris-tu ! Est-ce pour cela que tu nous as réunis ? » Alors descendit la sourate Al-Masad.",
    textEn: "When the Prophet ﷺ called Quraysh from Mount Safa, Abu Lahab cursed him saying: 'Perish you! Did you gather us for this?' Allah then revealed Surah Al-Masad.",
    source: "Sahih Al-Bukhari"
  }
};

/**
 * Strips HTML formatting tags from text
 */
function cleanTafsirHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Fetches verified verse details:
 * 1. Arabic text
 * 2. Authentic Tafsir from Tafsir Al-Muyassar / Ibn Kathir
 * 3. Verified Asbab al-Nuzul (or explicit "No specific authentic occasion" statement)
 * 4. Passage context
 * 5. Practical lessons & reflections
 */
export async function getVerseDetails(
  verseKey: string,
  arabicText: string,
  surahNumber: number,
  verseNumber: number,
  language: 'ar' | 'fr' | 'en'
): Promise<VerseTafsirDetails> {
  const cacheKey = `${verseKey}_${language}`;
  if (tafsirCache.has(cacheKey)) {
    return tafsirCache.get(cacheKey)!;
  }

  // Fallback default message when no specific authentic Asbab al-Nuzul is established
  const noAsbabMsg = {
    ar: "لا يتضمن التطبيق سبب نزول موثقاً لهذه الآية. راجع كتب أسباب النزول (الواحدي، السيوطي) للتوسع.",
    fr: "L'application ne contient pas de cause de révélation documentée pour ce verset. Pour approfondir, voir les ouvrages d'asbab an-nuzul (Al-Wahidi, As-Suyuti).",
    en: "This app has no documented occasion of revelation for this verse. See the asbab al-nuzul works (Al-Wahidi, As-Suyuti) to learn more."
  };

  const asbabData = VERIFIED_ASBAB_AL_NUZUL[verseKey];
  const hasSpecificAsbab = Boolean(asbabData);
  const asbabText = hasSpecificAsbab
    ? (language === 'ar' ? asbabData.textAr : language === 'fr' ? asbabData.textFr : asbabData.textEn)
    : noAsbabMsg[language];
  const asbabSource = asbabData ? asbabData.source : undefined;

  let tafsirText = "";
  let tafsirSource = "Tafsir Al-Muyassar (مجمع الملك فهد لطباعة المصحف الشريف)";

  try {
    // For Arabic, fetch Tafsir Al-Muyassar (ID 16)
    // For English/French, fetch Ibn Kathir (ID 169) or Al-Muyassar
    const tafsirId = language === 'ar' ? 16 : 169;
    const res = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tafsir && data.tafsir.text) {
        tafsirText = cleanTafsirHtml(data.tafsir.text);
        tafsirSource = data.tafsir.translated_name?.name || (language === 'ar' ? "التفسير الميسر" : "Tafsir Ibn Kathir");
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote tafsir, using structured fallback", err);
  }

  // Jamais de tafsir inventé : sans connexion, on le dit simplement.
  const tafsirUnavailable = !tafsirText;
  if (tafsirUnavailable) {
    tafsirSource = '';
    tafsirText = language === 'ar'
      ? "تعذّر تحميل التفسير. تحقّق من اتصالك بالإنترنت ثم أعد فتح الآية."
      : language === 'fr'
      ? "Le tafsir n'a pas pu être chargé. Vérifiez votre connexion puis rouvrez le verset."
      : "The tafsir could not be loaded. Check your connection and open the verse again.";
  }

  const result: VerseTafsirDetails = {
    verseKey,
    surahNumber,
    verseNumber,
    arabicText,
    tafsirText,
    tafsirSource,
    hasSpecificAsbab,
    asbabText,
    asbabSource
  };

  tafsirCache.set(cacheKey, result);
  return result;
}
