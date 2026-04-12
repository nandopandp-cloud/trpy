'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { Locale, DEFAULT_LOCALE, LOCALES } from './locales';
import { detectLocaleFromBrowser } from './detect-locale';

const LOCALE_STORAGE_KEY = 'trpy_locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const detected = (stored || detectLocaleFromBrowser()) as Locale;
    const resolved = LOCALES.includes(detected) ? detected : DEFAULT_LOCALE;
    setLocaleState(resolved);
    document.documentElement.lang = resolved;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
