import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { SURAHS_LIST } from '../data/surahsData';
import { JUZ_LIST } from '../data/juzCondensedData';
import { SURAH_START_PAGE, SURAH_START_JUZ } from '../data/surahStartPages';
import { getStandardPagesForCondensed } from '../services/quranApiService';
import { AppLanguage } from '../utils/translations';

// Fahras (index) of the condensed reading: every surah and every Juz leads to the exact
// condensed page (Juz x, page 1-5) that contains it, so the reader can open any passage.

export function locateSurah(surah: number): { juz: number; page: number; verseKey: string } {
  const juz = SURAH_START_JUZ[surah - 1];
  const mushafPage = SURAH_START_PAGE[surah - 1];
  let page = 1;
  for (let i = 1; i <= 5; i++) {
    if (getStandardPagesForCondensed(juz, i).includes(mushafPage)) { page = i; break; }
  }
  return { juz, page, verseKey: `${surah}:1` };
}

function pageRange(juz: number, page: number): string {
  const p = getStandardPagesForCondensed(juz, page);
  return p.length > 1 ? `${p[0]}–${p[p.length - 1]}` : String(p[0]);
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[ً-ٰٟـ'’`\-\s]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

interface Props {
  isOpen: boolean;
  language: AppLanguage;
  currentJuz: number;
  currentPage: number;
  completedPages?: string[];
  onClose: () => void;
  onJump: (juz: number, page: number, verseKey?: string) => void;
}

export default function FahrasModal({ isOpen, language, currentJuz, currentPage, completedPages = [], onClose, onJump }: Props) {
  const ar = language === 'ar';
  const n = (x: number | string) => (ar ? String(x).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : String(x));
  const [tab, setTab] = useState<'surah' | 'juz'>('surah');
  const [q, setQ] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const surahs = useMemo(() => SURAHS_LIST.map(s => ({ ...s, loc: locateSurah(s.number) })), []);
  const filtered = useMemo(() => {
    const k = norm(q.trim());
    if (!k) return surahs;
    return surahs.filter(s => String(s.number) === q.trim() || norm(s.nameArabic).includes(k) || norm(s.nameTransliterated).includes(k) || norm(s.nameEnglish).includes(k));
  }, [q, surahs]);

  // Ouvre la liste sur la sourate / le juz en cours de lecture.
  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => {
      const el = listRef.current?.querySelector('[data-current="1"]') as HTMLElement | null;
      el?.scrollIntoView({ block: 'center' });
    }, 60);
    return () => clearTimeout(id);
  }, [isOpen, tab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSurah = (() => {
    let cur = 1;
    for (const s of surahs) {
      if (s.loc.juz < currentJuz || (s.loc.juz === currentJuz && s.loc.page <= currentPage)) cur = s.number;
    }
    return cur;
  })();

  const go = (juz: number, page: number, verseKey?: string) => { onJump(juz, page, verseKey); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        dir={ar ? 'rtl' : 'ltr'}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-lg h-[88dvh] sm:h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#FAF7EE] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden"
      >
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-900 dark:text-emerald-300">
              <BookOpen className="w-5 h-5" />
              {ar ? 'الفهرس' : 'Index'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition" aria-label={ar ? 'إغلاق' : 'Close'}>
              <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-sm font-bold">
            {(['surah', 'juz'] as const).map(k => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`py-2 rounded-lg transition ${tab === k ? 'bg-white dark:bg-stone-700 text-emerald-900 dark:text-emerald-300 shadow-sm' : 'text-stone-600 dark:text-stone-400'}`}
              >
                {k === 'surah' ? (ar ? 'السور' : 'Surahs') : (ar ? 'الأجزاء' : 'Juz')}
              </button>
            ))}
          </div>
          {tab === 'surah' && (
            <div className="mt-3 relative">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-stone-400 ${ar ? 'right-3' : 'left-3'}`} />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={ar ? 'ابحث عن سورة…' : 'Search a surah…'}
                className={`w-full py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm outline-none focus:ring-2 focus:ring-emerald-600/40 ${ar ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
              />
            </div>
          )}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {tab === 'surah' ? (
            filtered.length === 0 ? (
              <p className="text-center text-sm text-stone-500 py-10">{ar ? 'لا توجد نتيجة' : 'No result'}</p>
            ) : filtered.map(s => {
              const cur = s.number === currentSurah;
              return (
                <button
                  key={s.number}
                  data-current={cur ? '1' : undefined}
                  onClick={() => go(s.loc.juz, s.loc.page, s.loc.verseKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition hover:bg-emerald-900/5 dark:hover:bg-white/5 active:scale-[0.98] ${cur ? 'bg-emerald-900/10 dark:bg-emerald-400/10' : ''}`}
                >
                  <span className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-xs font-bold bg-emerald-900 text-amber-100">{n(s.number)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-quran text-lg text-stone-900 dark:text-stone-100 leading-tight" dir="rtl">{s.nameArabic}</span>
                      {!ar && <span className="text-xs text-stone-500 truncate">{s.nameTransliterated}</span>}
                    </span>
                    <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {ar
                        ? `${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · ${n(s.versesCount)} آية · الجزء ${n(s.loc.juz)} · الصفحة ${n(s.loc.page)}/${n(5)}`
                        : `${s.revelationType} · ${s.versesCount} verses · Juz ${s.loc.juz} · page ${s.loc.page}/5`}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            JUZ_LIST.map(j => {
              const cur = j.juzNumber === currentJuz;
              return (
                <div key={j.juzNumber} data-current={cur ? '1' : undefined} className={`px-3 py-3 rounded-xl ${cur ? 'bg-emerald-900/10 dark:bg-emerald-400/10' : ''}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                      {ar ? `الجزء ${n(j.juzNumber)}` : `Juz ${j.juzNumber}`}
                      <span className="font-quran font-normal text-base text-stone-700 dark:text-stone-300 ms-2" dir="rtl">{j.nameArabic}</span>
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map(p => {
                      const done = completedPages.includes(`${j.juzNumber}-${p}`);
                      const here = cur && p === currentPage;
                      return (
                        <button
                          key={p}
                          onClick={() => go(j.juzNumber, p)}
                          title={ar ? `صفحات المصحف ${pageRange(j.juzNumber, p)}` : `Mushaf pages ${pageRange(j.juzNumber, p)}`}
                          className={`py-1.5 rounded-lg border text-center transition active:scale-95 hover:shadow-md ${
                            here ? 'bg-emerald-900 text-amber-100 border-emerald-900'
                              : done ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200'
                          }`}
                        >
                          <span className="block text-sm font-bold leading-none">{n(p)}</span>
                          <span className="block text-[9px] opacity-70 mt-1 leading-none">{ar ? n(pageRange(j.juzNumber, p)) : pageRange(j.juzNumber, p)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
