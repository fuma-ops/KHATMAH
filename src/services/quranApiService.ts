import { VerseItem } from '../types/quran';

export interface StandardPageGroup {
  juzNumber: number;
  pageIndex: number; // 1 to 5
  standardPages: number[]; // e.g. [1, 2, 3, 4]
}

// 30 Juz page ranges in the Madinah Mushaf (604 pages). A Juz can start or end in the middle of a
// page: the shared page is listed in both Juz, and only the verses of the current Juz are shown
// (filter on juz_number), so every verse is read exactly once.
export const JUZ_PAGE_RANGES: { juz: number; startPage: number; endPage: number }[] = [
  { juz: 1, startPage: 1, endPage: 21 },
  { juz: 2, startPage: 22, endPage: 41 },
  { juz: 3, startPage: 42, endPage: 62 },
  { juz: 4, startPage: 62, endPage: 81 },
  { juz: 5, startPage: 82, endPage: 101 },
  { juz: 6, startPage: 102, endPage: 121 },
  { juz: 7, startPage: 121, endPage: 141 },
  { juz: 8, startPage: 142, endPage: 161 },
  { juz: 9, startPage: 162, endPage: 181 },
  { juz: 10, startPage: 182, endPage: 201 },
  { juz: 11, startPage: 201, endPage: 221 },
  { juz: 12, startPage: 222, endPage: 241 },
  { juz: 13, startPage: 242, endPage: 261 },
  { juz: 14, startPage: 262, endPage: 281 },
  { juz: 15, startPage: 282, endPage: 301 },
  { juz: 16, startPage: 302, endPage: 321 },
  { juz: 17, startPage: 322, endPage: 341 },
  { juz: 18, startPage: 342, endPage: 361 },
  { juz: 19, startPage: 362, endPage: 381 },
  { juz: 20, startPage: 382, endPage: 401 },
  { juz: 21, startPage: 402, endPage: 421 },
  { juz: 22, startPage: 422, endPage: 441 },
  { juz: 23, startPage: 442, endPage: 461 },
  { juz: 24, startPage: 462, endPage: 481 },
  { juz: 25, startPage: 482, endPage: 502 },
  { juz: 26, startPage: 502, endPage: 521 },
  { juz: 27, startPage: 522, endPage: 541 },
  { juz: 28, startPage: 542, endPage: 561 },
  { juz: 29, startPage: 562, endPage: 581 },
  { juz: 30, startPage: 582, endPage: 604 }
];

/**
 * Maps each of the 5 condensed pages of a Juz to its exact group of standard Mushaf pages.
 * By reading these 5 pages, the user reads ALL standard pages of the Juz with 100% of the verses!
 */
export function getStandardPagesForCondensed(juzNumber: number, pageIndex: number): number[] {
  const range = JUZ_PAGE_RANGES.find(r => r.juz === juzNumber) || JUZ_PAGE_RANGES[0];
  const totalStandardPages = range.endPage - range.startPage + 1;

  // Split into 5 equal buckets
  const baseSize = Math.floor(totalStandardPages / 5);
  const remainder = totalStandardPages % 5;

  let currentStart = range.startPage;
  const groups: number[][] = [];

  for (let i = 0; i < 5; i++) {
    // Distribute remainder among first few groups
    const size = baseSize + (i < remainder ? 1 : 0);
    const pages: number[] = [];
    for (let p = 0; p < size; p++) {
      pages.push(currentStart + p);
    }
    groups.push(pages);
    currentStart += size;
  }

  return groups[pageIndex - 1] || groups[0];
}

export interface StandardPageVerses {
  pageNumber: number;
  verses: {
    id: number;
    verseNumber: number;
    surahNumber: number;
    verseKey: string;
    textUthmani: string;
    juzNumber: number;
    textFrench: string;
    textEnglish: string;
    audioUrl: string;
  }[];
}

// In-memory cache for ultra-fast instant rendering
const pageCache = new Map<number, StandardPageVerses>();

// Strip html tags from translation texts (like <sup>1</sup>)
function cleanText(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Fetches all verses of a single standard Madinah Mushaf page (1 to 604)
 * with authentic text_uthmani and bilingual translations.
 */
export async function fetchStandardPage(pageNumber: number): Promise<StandardPageVerses> {
  if (pageCache.has(pageNumber)) {
    return pageCache.get(pageNumber)!;
  }

  // Check localStorage cache
  const storageKey = `mushaf_std_page_v2_${pageNumber}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      pageCache.set(pageNumber, parsed);
      return parsed;
    }
  } catch {}

  const url = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=136,85&fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch standard Quran page ${pageNumber}`);
  }

  const data = await res.json();
  const verses = (data.verses || []).map((v: any) => {
    // 3-digit padded chapter & verse for audio CDN
    const chPadded = String(v.chapter_id).padStart(3, '0');
    const vPadded = String(v.verse_number).padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${chPadded}${vPadded}.mp3`;

    const frenchTrans = v.translations?.find((t: any) => t.resource_id === 136)?.text || '';
    const englishTrans = v.translations?.find((t: any) => t.resource_id === 85)?.text || '';

    return {
      id: v.id,
      verseNumber: v.verse_number,
      surahNumber: v.chapter_id,
      verseKey: v.verse_key,
      textUthmani: v.text_uthmani,
      juzNumber: v.juz_number,
      textFrench: cleanText(frenchTrans),
      textEnglish: cleanText(englishTrans),
      audioUrl
    };
  });

  const pageData: StandardPageVerses = {
    pageNumber,
    verses
  };

  pageCache.set(pageNumber, pageData);
  try {
    localStorage.setItem(storageKey, JSON.stringify(pageData));
  } catch {}

  return pageData;
}

/**
 * Fetches the COMPLETE verses of a 5-page condensed section
 * by loading and merging all standard pages that make up this section (e.g. pages 1, 2, 3, 4).
 * ZERO VERSES OMITTED!
 */
function mergeCondensed(rawPages: StandardPageVerses[], juzNumber: number) {
  // Pages partagées entre deux Juz : on ne garde que les versets du Juz lu.
  const standardPages = rawPages
    .map(p => ({ ...p, verses: p.verses.filter(v => !v.juzNumber || v.juzNumber === juzNumber) }))
    .filter(p => p.verses.length > 0);
  const totalVersesCount = standardPages.reduce((acc, p) => acc + p.verses.length, 0);
  return { standardPages, totalVersesCount };
}

/** Page standard déjà en mémoire ou dans le stockage local (lecture synchrone, sans réseau). */
function readStandardPageSync(pageNumber: number): StandardPageVerses | null {
  const mem = pageCache.get(pageNumber);
  if (mem) return mem;
  try {
    const cached = localStorage.getItem(`mushaf_std_page_v2_${pageNumber}`);
    if (cached) {
      const parsed = JSON.parse(cached) as StandardPageVerses;
      pageCache.set(pageNumber, parsed);
      return parsed;
    }
  } catch {}
  return null;
}

/**
 * Page condensée immédiatement disponible (déjà téléchargée) : permet d'afficher la page
 * suivante sans écran de chargement. Renvoie null si une des pages standard manque encore.
 */
export function getCondensedPageSync(
  juzNumber: number,
  pageIndex: number
): { standardPages: StandardPageVerses[]; totalVersesCount: number } | null {
  const raw: StandardPageVerses[] = [];
  for (const p of getStandardPagesForCondensed(juzNumber, pageIndex)) {
    const page = readStandardPageSync(p);
    if (!page) return null;
    raw.push(page);
  }
  return mergeCondensed(raw, juzNumber);
}

/**
 * Télécharge en arrière-plan tout le Juz en cours (et le début du suivant) pour que le
 * changement de page soit instantané. Deux requêtes à la fois pour ne pas gêner la page affichée.
 */
const prefetchedJuz = new Set<number>();
export function prefetchJuz(juzNumber: number): void {
  if (prefetchedJuz.has(juzNumber)) return;
  prefetchedJuz.add(juzNumber);
  const pages: number[] = [];
  for (let i = 1; i <= 5; i++) pages.push(...getStandardPagesForCondensed(juzNumber, i));
  if (juzNumber < 30) pages.push(...getStandardPagesForCondensed(juzNumber + 1, 1));
  if (juzNumber > 1) pages.push(...getStandardPagesForCondensed(juzNumber - 1, 5));
  const todo = [...new Set(pages)].filter(p => !readStandardPageSync(p));
  const worker = async () => {
    while (todo.length) {
      const p = todo.shift()!;
      // Hors ligne : on autorisera un nouvel essai au prochain changement de page.
      await fetchStandardPage(p).catch(() => { prefetchedJuz.delete(juzNumber); });
    }
  };
  worker();
  worker();
}

/**
 * Fetches the COMPLETE verses of a 5-page condensed section
 * by loading and merging all standard pages that make up this section (e.g. pages 1, 2, 3, 4).
 * ZERO VERSES OMITTED!
 */
export async function fetchCondensedPageFull(
  juzNumber: number,
  pageIndex: number
): Promise<{ standardPages: StandardPageVerses[]; totalVersesCount: number }> {
  const stdPagesNumbers = getStandardPagesForCondensed(juzNumber, pageIndex);
  const rawPages = await Promise.all(stdPagesNumbers.map(p => fetchStandardPage(p)));
  return mergeCondensed(rawPages, juzNumber);
}
