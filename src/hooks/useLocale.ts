import { useEffect, useMemo, useState } from 'react';
import { defaultLocale, isLocale, locales, type Locale } from '../data/content';

const storageKey = 'ask-portfolio-locale';

function getInitialLocale(): Locale {
  const storedLocale = window.localStorage.getItem(storageKey);
  return isLocale(storedLocale) ? storedLocale : defaultLocale;
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return defaultLocale;
    return getInitialLocale();
  });

  const content = locales[locale];

  useEffect(() => {
    window.localStorage.setItem(storageKey, locale);
    document.documentElement.lang = locale;
    document.title = content.meta.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = content.meta.description;
    }
  }, [content, locale]);

  return useMemo(
    () => ({
      content,
      locale,
      setLocale
    }),
    [content, locale]
  );
}
