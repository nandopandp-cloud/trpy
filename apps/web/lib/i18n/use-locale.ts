'use client';

import { useCallback, useEffect, useState } from 'react';
import { Locale, DEFAULT_LOCALE, LOCALES } from './locales';
import { detectLocaleFromBrowser } from './detect-locale';

const LOCALE_STORAGE_KEY = 'trpy_locale';

export function useLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load from localStorage or browser detection
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const detected = stored || detectLocaleFromBrowser();

    if (LOCALES.includes(detected as Locale)) {
      setLocaleState(detected as Locale);
    } else {
      setLocaleState(DEFAULT_LOCALE);
    }

    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (LOCALES.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      // Update document lang attribute
      document.documentElement.lang = newLocale;
    }
  }, []);

  return [locale, setLocale];
}
