import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellRing, BookOpen, X } from 'lucide-react';
import { AppLanguage } from '../utils/translations';
import { KhatmaState, getTodaysAssignedTarget } from '../services/khatmaService';
import { getPlanScheduleBreakdown } from '../services/khatmaScheduleHelper';
import { localDateISO } from '../utils/localDate';
import {
  readReminder, enableReminder, disableReminder, updateReminderTime, notificationsSupported, pushServerConfigured,
} from '../services/reminders';

interface Props {
  khatma: KhatmaState;
  language: AppLanguage;
  onReadNow: () => void;
}

/** Jours consécutifs avec au moins une page lue, jusqu'à aujourd'hui (ou hier si rien encore aujourd'hui). */
export function readingStreak(dailyLog: Record<string, number>): number {
  const d = new Date();
  if (!(dailyLog[localDateISO(d)] > 0)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dailyLog[localDateISO(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function todayStatus(khatma: KhatmaState) {
  const { targetPages, completedToday } = getTodaysAssignedTarget(khatma);
  const remaining = khatma.hasStarted ? Math.max(0, targetPages - completedToday) : targetPages;
  const schedule = getPlanScheduleBreakdown(khatma.durationDays);
  const next = schedule.find((d) => !d.pageKeys.every((k) => khatma.completedPages.includes(k)));
  return { targetPages, completedToday, remaining, wird: next?.dayNumber ?? schedule.length, totalWirds: schedule.length };
}

const T = {
  fr: { title: 'Votre wird du jour', left: (r: number, t: number) => `Il reste ${r} page${r > 1 ? 's' : ''} sur ${t} aujourd'hui`, done: '✅ Wird du jour terminé — qu\'Allah l\'accepte !', notStarted: 'Choisissez un plan et commencez votre Khatma.', streak: (n: number) => `🔥 ${n} jour${n > 1 ? 's' : ''} d'affilée`, read: 'Lire maintenant', reminder: 'Rappel quotidien', at: 'à', on: 'Activer', off: 'Désactiver', pushOk: 'Notifications activées sur ce téléphone.', localOk: "Rappel activé (s'affiche quand l'app est ouverte ou en arrière-plan).", denied: 'Notifications refusées : autorisez-les dans les réglages du téléphone.', unsupported: "Ce navigateur ne gère pas les notifications. Installez l'app (bouton Télécharger l'app).", ios: "Sur iPhone : installez d'abord l'app sur l'écran d'accueil, puis activez le rappel depuis l'app." },
  ar: { title: 'وردك اليومي', left: (r: number, t: number) => `بقيت ${r} صفحة من ${t} اليوم`, done: '✅ أتممت ورد اليوم — تقبّل الله منك!', notStarted: 'اختر خطة وابدأ ختمتك.', streak: (n: number) => `🔥 ${n} يوم متتالٍ`, read: 'اقرأ الآن', reminder: 'تذكير يومي', at: 'على الساعة', on: 'تفعيل', off: 'إيقاف', pushOk: 'تم تفعيل الإشعارات على هذا الهاتف.', localOk: 'تم تفعيل التذكير (يظهر عندما يكون التطبيق مفتوحاً).', denied: 'الإشعارات مرفوضة: فعّلها من إعدادات الهاتف.', unsupported: 'هذا المتصفح لا يدعم الإشعارات. ثبّت التطبيق أولاً.', ios: 'على آيفون: ثبّت التطبيق على الشاشة الرئيسية أولاً، ثم فعّل التذكير من داخله.' },
  en: { title: "Today's wird", left: (r: number, t: number) => `${r} of ${t} page${t > 1 ? 's' : ''} left today`, done: "✅ Today's wird completed — may Allah accept it!", notStarted: 'Choose a plan and start your Khatma.', streak: (n: number) => `🔥 ${n}-day streak`, read: 'Read now', reminder: 'Daily reminder', at: 'at', on: 'Turn on', off: 'Turn off', pushOk: 'Notifications are on for this phone.', localOk: 'Reminder on (shown while the app is open or in the background).', denied: 'Notifications blocked: allow them in your phone settings.', unsupported: "This browser doesn't support notifications. Install the app first.", ios: 'On iPhone: add the app to your Home Screen first, then turn on the reminder from the app.' },
};

export const NotificationBell: React.FC<Props> = ({ khatma, language, onReadNow }) => {
  const t = T[language] || T.fr;
  const isRtl = language === 'ar';
  const [open, setOpen] = useState(false);
  const [rem, setRem] = useState(readReminder());
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const st = todayStatus(khatma);
  const streak = readingStreak(khatma.dailyLog || {});
  const badge = khatma.hasStarted && st.remaining > 0 ? st.remaining : 0;

  useEffect(() => { if (open) setRem(readReminder()); }, [open]);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

  const toggle = async () => {
    setBusy(true);
    if (rem.enabled) {
      await disableReminder();
      setRem({ ...rem, enabled: false });
      setMsg('');
    } else if (isIOS && !standalone) {
      setMsg(t.ios);
    } else {
      const r = await enableReminder(rem.time, language);
      if (r === 'push' || r === 'local') setRem({ ...rem, enabled: true });
      setMsg(r === 'push' ? t.pushOk : r === 'local' ? t.localOk : r === 'denied' ? t.denied : t.unsupported);
    }
    setBusy(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-300/70 dark:border-stone-700 hover:bg-white flex items-center justify-center shadow-xs active:scale-95"
        title={t.title}
        aria-label={t.title}
      >
        {rem.enabled ? <BellRing className="w-4 h-4 text-amber-700 dark:text-amber-400" /> : <Bell className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#064e3b] text-amber-200 text-[10px] font-bold flex items-center justify-center border border-white">
            {badge}
          </span>
        )}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-16" onClick={() => setOpen(false)}>
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] dark:bg-stone-900 border border-amber-200/80 dark:border-stone-700 shadow-2xl p-5 text-stone-900 dark:text-stone-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">{t.title}</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-800" aria-label="Fermer"><X className="w-4 h-4" /></button>
            </div>

            <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900 p-4">
              {!khatma.hasStarted ? (
                <p className="text-sm">{t.notStarted}</p>
              ) : st.remaining > 0 ? (
                <>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Wird {st.wird} / {st.totalWirds}</div>
                  <div className="text-sm font-semibold mt-1">{t.left(st.remaining, st.targetPages)}</div>
                  <div className="mt-2 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
                    <div className="h-full bg-emerald-700 transition-all duration-500" style={{ width: `${Math.min(100, Math.round((st.completedToday / st.targetPages) * 100))}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-sm font-semibold">{t.done}</p>
              )}
              {streak > 0 && <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400">{t.streak(streak)}</div>}
            </div>

            <button
              onClick={() => { setOpen(false); onReadNow(); }}
              className="mt-3 w-full py-3 rounded-2xl bg-[#064e3b] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-amber-300" /> {t.read}
            </button>

            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
              <div className="text-sm font-bold">{t.reminder}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-stone-500">{t.at}</span>
                <input
                  type="time"
                  value={rem.time}
                  onChange={(e) => { const time = e.target.value || '21:00'; setRem({ ...rem, time }); updateReminderTime(time, language); }}
                  className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono"
                />
                <button
                  onClick={toggle}
                  disabled={busy || !notificationsSupported() && !rem.enabled}
                  className={`ms-auto px-4 py-2 rounded-xl text-xs font-bold active:scale-95 disabled:opacity-50 ${rem.enabled ? 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100' : 'bg-amber-400 text-emerald-950'}`}
                >
                  {rem.enabled ? t.off : t.on}
                </button>
              </div>
              {(msg || (!notificationsSupported() && !rem.enabled)) && (
                <p className="mt-2 text-[11px] text-stone-600 dark:text-stone-300 leading-snug">{msg || t.unsupported}</p>
              )}
              {!pushServerConfigured() && rem.enabled && !msg && (
                <p className="mt-2 text-[11px] text-stone-500 leading-snug">{t.localOk}</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
