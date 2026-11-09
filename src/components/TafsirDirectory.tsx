import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, ChevronRight, FileText } from 'lucide-react';
import { JUZ_LIST } from '../data/juzCondensedData';
import { getCondensedPage } from '../data/condensedPagesDatabase';
import { toArabicNumerals } from '../utils/storage';

interface TafsirDirectoryProps {
  onSelectPage: (juz: number, page: number) => void;
}

export const TafsirDirectory: React.FC<TafsirDirectoryProps> = ({ onSelectPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number>(1);

  const filteredJuzList = JUZ_LIST.filter(juz => {
    const q = searchQuery.toLowerCase();
    return (
      juz.juzNumber.toString().includes(q) ||
      juz.surahRange.toLowerCase().includes(q) ||
      juz.mainThemesFrench.toLowerCase().includes(q) ||
      juz.mainThemesEnglish.toLowerCase().includes(q)
    );
  });

  const activeJuz = JUZ_LIST.find(j => j.juzNumber === selectedJuz) || JUZ_LIST[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
          <span>Résumés, Thèmes & Tafsir des 30 Juz</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Comprenez le message divin en profondeur avant ou après votre récitation quotidienne.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une sourate, un thème ou un Juz (ex: Al-Baqarah, patience, Adam)..."
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Main Layout: Juz list on Left + 5-Page Detailed Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Juz List Selection */}
        <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredJuzList.map((juz) => {
            const isSelected = juz.juzNumber === selectedJuz;
            return (
              <button
                key={juz.juzNumber}
                onClick={() => setSelectedJuz(juz.juzNumber)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Juz {juz.juzNumber}</span>
                    <span className="font-arabic text-xs opacity-75">({juz.nameArabic})</span>
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                    {juz.surahRange}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-200' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right: Detailed 5-Page Breakdown for the active Juz */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-6">
          <div className="pb-4 border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Aperçu Global du Juz {activeJuz.juzNumber}
              </span>
              <span className="font-arabic text-xl font-bold text-emerald-900 dark:text-emerald-300">
                جُزْءُ {activeJuz.nameArabic}
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
              {activeJuz.surahRange}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mt-2">
              {activeJuz.mainThemesFrench}
            </p>
          </div>

          {/* The 5 Condensed Pages for this Juz */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Les 5 Pages Condensées de ce Juz
            </h4>

            {[1, 2, 3, 4, 5].map((pageIdx) => {
              const pageData = getCondensedPage(activeJuz.juzNumber, pageIdx);
              return (
                <div
                  key={pageIdx}
                  className="p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-900/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-emerald-800 text-amber-200 font-mono text-xs font-bold flex items-center justify-center">
                        {pageIdx}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {pageData.titleFrench}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {pageData.verseRange}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectPage(activeJuz.juzNumber, pageIdx)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Lire Page {pageIdx}/5</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {pageData.summaryFrench}
                  </p>

                  {/* Bullet lessons */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1.5">
                    {pageData.keyLessons.map((l, i) => (
                      <div key={i} className="text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span><strong>{l.point} :</strong> {l.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
