import en from './locales/en.json';
import tr from './locales/tr.json';

export const locales = {
  en,
  tr
} as const;

export type Locale = keyof typeof locales;
export type SiteContent = typeof en;
export type Project = SiteContent['projects'][number];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'tr';
}
