import React, { useState } from 'react';
import { X, Search, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { JUZ_LIST } from '../data/juzCondensedData';
import { SURAHS_LIST } from '../data/surahsData';
import { UserProgress } from '../types/quran';

interface JuzSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (juz: number, page: number) => void;
  progress: UserProgress;
}

export const JuzSelectorModal: React.FC<JuzSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  progress
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'juz' | 'surah'>('juz');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAHS_LIST.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.number.toString().includes(q) ||
      s.nameTransliterated.toLowerCase().includes(q) ||
      s.nameFrench.toLowerCase().includes(q) ||
      s.nameArabic.includes(q)
    );
  });

  const filteredJuz = JUZ_LIST.filter(j => {
    const q = searchQuery.toLowerCase();
    return (
      j.juzNumber.toString().includes(q) ||
      j.surahRange.toLowerCase().includes(q) ||
      j.nameArabic.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-200 flex items-center justify-center font-bold text-sm">
              ق
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Navigation Rapide dans le Coran
              </h3>
              <p className="text-xs text-stone-500">
                Accédez directement aux 30 Juz (150 pages) ou aux 114 Sourates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('juz')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'juz'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Par les 30 Juz
            </button>
            <button
              onClick={() => setActiveTab('surah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'surah'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Par les 114 Sourates
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'juz' ? "Chercher un Juz..." : "Chercher une sourate..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'juz' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredJuz.map((juz) => {
                const completedPagesInJuz = [1, 2, 3, 4, 5].filter(p => 
                  progress.completedPages.includes(`${juz.juzNumber}-${p}`)
                ).length;

                return (
                  <div
                    key={juz.juzNumber}
                    className="p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:border-emerald-700/50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-800 text-amber-100 font-mono text-xs font-bold flex items-center justify-center">
                          {juz.juzNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            Juz {juz.juzNumber}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate max-w-[150px]">
                            {juz.surahRange}
                          </div>
                        </div>
                      </div>

                      <span className="font-arabic text-sm font-bold text-emerald-900 dark:text-emerald-400">
                        {juz.nameArabic}
                      </span>
                    </div>

                    {/* 5 Page mini buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5 dark:border-white/5">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {completedPagesInJuz}/5 lues
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((pageNum) => {
                          const isRead = progress.completedPages.includes(`${juz.juzNumber}-${pageNum}`);
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                onSelectPage(juz.juzNumber, pageNum);
                                onClose();
                              }}
                              className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                                isRead
                                  ? 'bg-emerald-800 text-amber-200'
                                  : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-emerald-700 hover:text-white'
                              }`}
                              title={`Page ${pageNum}/5`}
                            >
                              P{pageNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectPage(surah.startJuz, 1);
                    onClose();
                  }}
                  className="w-full p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 rounded-xl transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {surah.nameTransliterated} · {surah.nameFrench}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {surah.versesCount} versets · {surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'} · Juz {surah.startJuz}
                      </div>
                    </div>
                  </div>

                  <span className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-400">
                    {surah.nameArabic}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
