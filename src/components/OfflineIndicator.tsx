import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface OfflineIndicatorProps {
  language: AppLanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const t = TRANSLATIONS[language];

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg animate-in slide-in-from-bottom">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{t.offlineNotice}</span>
    </div>
  );
};
