import { KhatmaGoal } from '../types/quran';

export const KHATMA_PLANS: KhatmaGoal[] = [
  {
    id: "30-days",
    title: "Khatma 30 Jours (Recommandée)",
    targetDays: 30,
    pagesPerDay: 5,
    juzPerDay: 1,
    description: "Le rythme équilibré par excellence : 1 Juz complet par jour, condensé en exactement 5 pages bien lisibles.",
    scheduleDescription: "1 page après chaque prière obligatoire (Fajr, Dhuhr, Asr, Maghrib, Isha). Soit ~3-4 minutes par prière !"
  },
  {
    id: "15-days",
    title: "Khatma 15 Jours (Rythme Actif)",
    targetDays: 15,
    pagesPerDay: 10,
    juzPerDay: 2,
    description: "Terminez le Coran en deux semaines seulement, idéal pendant les vacances ou un mois spirituel.",
    scheduleDescription: "2 pages après chaque prière ou 5 pages le matin et 5 pages le soir (~30-35 min/jour)."
  },
  {
    id: "10-days",
    title: "Khatma 10 Jours (Les 10 Dernières Nuits)",
    targetDays: 10,
    pagesPerDay: 15,
    juzPerDay: 3,
    description: "Conçu spécialement pour les 10 dernières nuits de Ramadan ou les 10 premiers jours de Dhul-Hijjah.",
    scheduleDescription: "3 pages après chaque prière (15 pages = 3 Juz par jour, soit ~45-50 min/jour)."
  },
  {
    id: "7-days",
    title: "Khatma 7 Jours (Tradition Hebdomadaire)",
    targetDays: 7,
    pagesPerDay: 21,
    juzPerDay: 4.3,
    description: "La pratique traditionnelle des Compagnons (Fami Bi-Shawq) pour achever le Coran en une semaine.",
    scheduleDescription: "4 à 5 pages après chaque prière ou 1 heure d'immersion quotidienne."
  }
];

export const PRAYER_SCHEDULE_NAMES = [
  { id: 'fajr', nameFr: 'Fajr', nameAr: 'الفجر', pageSlot: 'Page 1' },
  { id: 'dhuhr', nameFr: 'Dhuhr', nameAr: 'الظهر', pageSlot: 'Page 2' },
  { id: 'asr', nameFr: 'Asr', nameAr: 'العصر', pageSlot: 'Page 3' },
  { id: 'maghrib', nameFr: 'Maghrib', nameAr: 'المغرب', pageSlot: 'Page 4' },
  { id: 'isha', nameFr: 'Isha', nameAr: 'العشاء', pageSlot: 'Page 5' }
];
