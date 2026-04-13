import type { Locale } from './locales';

/**
 * Map Locale to BCP 47 language tag for Intl APIs
 */
const LOCALE_TO_BCP47: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'ja': 'ja-JP',
  'zh-CN': 'zh-CN',
};

/**
 * Format a number using the locale's number format (for currency, decimals, etc)
 */
export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(LOCALE_TO_BCP47[locale], options);
}

/**
 * Format a date using the locale's date format
 */
export function formatDate(locale: Locale, date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(LOCALE_TO_BCP47[locale], options);
}

/**
 * Get currency symbol for the locale
 */
export function getCurrencySymbol(locale: Locale): string {
  const symbols: Record<Locale, string> = {
    'pt-BR': 'R$',
    'en': '$',
    'es': '€',
    'fr': '€',
    'de': '€',
    'it': '€',
    'ja': '¥',
    'zh-CN': '¥',
  };
  return symbols[locale];
}
