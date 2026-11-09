// Rappel quotidien du wird : vraies notifications du téléphone (Web Push) quand le serveur
// d'envoi est configuré, sinon rappel local quand l'app est ouverte ou en arrière-plan.
import { todayISO } from '../utils/localDate';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // « HH:MM », heure locale
}

const KEY = 'khatmah_reminder_v1';
const LAST_LOCAL_KEY = 'khatmah_reminder_last_local';

// Serveur d'envoi (fonction Supabase) et clé publique VAPID, injectés au build.
const PUSH_API: string = (import.meta as any).env?.VITE_KHATMAH_PUSH_API || '';
const VAPID_PUBLIC: string = (import.meta as any).env?.VITE_KHATMAH_VAPID_PUBLIC || '';

export const pushServerConfigured = (): boolean => Boolean(PUSH_API && VAPID_PUBLIC);

export function readReminder(): ReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { enabled: false, time: '21:00', ...JSON.parse(raw) };
  } catch {}
  return { enabled: false, time: '21:00' };
}

function saveReminder(s: ReminderSettings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function pushSubscription(): Promise<PushSubscription | null> {
  if (!pushServerConfigured() || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource });
}

async function callServer(body: Record<string, unknown>) {
  if (!PUSH_API) return;
  try {
    await fetch(PUSH_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {}
}

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Casablanca';

/** Active le rappel (demande l'autorisation, s'abonne aux notifications). Renvoie un statut lisible. */
export async function enableReminder(time: string, lang: string): Promise<'push' | 'local' | 'denied' | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'denied';
  saveReminder({ enabled: true, time });
  try {
    const sub = await pushSubscription();
    if (sub) {
      await callServer({ action: 'subscribe', subscription: sub.toJSON(), time, tz: tz(), lang, today: todayISO() });
      return 'push';
    }
  } catch {}
  return 'local';
}

export async function updateReminderTime(time: string, lang: string) {
  const cur = readReminder();
  saveReminder({ ...cur, time });
  if (!cur.enabled) return;
  try {
    const sub = await pushSubscription();
    if (sub) await callServer({ action: 'subscribe', subscription: sub.toJSON(), time, tz: tz(), lang, today: todayISO() });
  } catch {}
}

export async function disableReminder() {
  saveReminder({ ...readReminder(), enabled: false });
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager?.getSubscription();
    if (sub) {
      await callServer({ action: 'unsubscribe', endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
  } catch {}
}

/** Prévient le serveur que le wird du jour est terminé : pas de rappel ce soir. */
export async function markReadToday(done: boolean) {
  if (!readReminder().enabled || !pushServerConfigured()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager?.getSubscription();
    if (sub) await callServer({ action: 'progress', endpoint: sub.endpoint, today: todayISO(), done });
  } catch {}
}

/**
 * Rappel local (sans serveur, ou en complément) : à l'heure choisie, si le wird du jour n'est pas
 * fini et qu'aucun rappel n'a encore été montré aujourd'hui.
 */
export async function maybeShowLocalReminder(remainingPages: number, lang: string) {
  const s = readReminder();
  if (!s.enabled || remainingPages <= 0 || !notificationsSupported() || Notification.permission !== 'granted') return;
  if (pushServerConfigured()) return; // le serveur s'en charge (même app fermée)
  const now = new Date();
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (hm < s.time) return;
  const today = todayISO();
  try { if (localStorage.getItem(LAST_LOCAL_KEY) === today) return; } catch {}
  try {
    const reg = await navigator.serviceWorker.ready;
    const title = lang === 'ar' ? 'ختمة — وردك اليومي' : lang === 'en' ? 'Khatmah — your daily wird' : 'Khatmah — votre wird du jour';
    const body = lang === 'ar'
      ? `بقيت ${remainingPages} صفحة من ورد اليوم. بارك الله في وقتك.`
      : lang === 'en'
      ? `${remainingPages} page(s) left in today's wird.`
      : `Il reste ${remainingPages} page(s) de votre wird du jour.`;
    await reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'khatmah-daily', data: { url: '/' } });
    localStorage.setItem(LAST_LOCAL_KEY, today);
  } catch {}
}
