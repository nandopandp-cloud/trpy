import { Locale, LOCALES, DEFAULT_LOCALE } from './locales';

/**
 * Detect user's locale based on:
 * 1. Browser language preference
 * 2. Accept-Language header (server-side)
 * 3. IP geolocation (fallback)
 */
export function detectLocaleFromBrowser(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const browserLangs = navigator.languages || [navigator.language];

  for (const lang of browserLangs) {
    // Exact match: 'pt-BR', 'en', etc.
    if (LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }

    // Language prefix match: 'pt' -> 'pt-BR', 'en-US' -> 'en'
    const langPrefix = lang.split('-')[0];
    const match = LOCALES.find((locale) => locale.startsWith(langPrefix));
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

/**
 * Detect locale from Accept-Language header (server-side)
 */
export function detectLocaleFromHeader(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim())
    .map((lang) => lang.toLowerCase());

  for (const lang of languages) {
    if (LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }

    const langPrefix = lang.split('-')[0];
    const match = LOCALES.find((locale) => locale.startsWith(langPrefix));
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}
