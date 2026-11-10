// Mesure d'audience via Google Tag Manager (GTM-TG95398C) : la balise GA4 est configurée dans GTM.
// Les événements sont poussés dans dataLayer ; aucun contenu personnel (pas de texte, pas d'identité).
type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Payload = {}): void {
  try {
    (window.dataLayer = window.dataLayer || []).push({ event, ...params });
  } catch {
    /* mesure indisponible : l'application continue normalement */
  }
}

/** Application installée (écran d'accueil) ou ouverte dans le navigateur. */
export function displayMode(): 'standalone' | 'browser' {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true ? 'standalone' : 'browser';
  } catch {
    return 'browser';
  }
}

/** Événements globaux : ouverture (avec le mode d'affichage) et installation de l'app. */
export function initAnalytics(): void {
  track('khatmah_open', { display_mode: displayMode() });
  window.addEventListener('appinstalled', () => track('khatmah_install', { display_mode: displayMode() }));
}

/** Écran affiché dans l'application (accueil, lecture, plan, historique…). */
export function trackScreen(screen: string): void {
  track('khatmah_screen', { screen_name: screen, page_path: `/app/${screen}`, display_mode: displayMode() });
}
