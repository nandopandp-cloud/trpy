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

/**
 * All supported currencies with symbol and label
 */
export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$',  label: 'BRL — Real Brasileiro' },
  { code: 'USD', symbol: '$',   label: 'USD — Dólar Americano' },
  { code: 'EUR', symbol: '€',   label: 'EUR — Euro' },
  { code: 'GBP', symbol: '£',   label: 'GBP — Libra Esterlina' },
  { code: 'JPY', symbol: '¥',   label: 'JPY — Iene Japonês' },
  { code: 'CHF', symbol: 'Fr',  label: 'CHF — Franco Suíço' },
  { code: 'CAD', symbol: 'C$',  label: 'CAD — Dólar Canadense' },
  { code: 'AUD', symbol: 'A$',  label: 'AUD — Dólar Australiano' },
  { code: 'CNY', symbol: '¥',   label: 'CNY — Yuan Chinês' },
  { code: 'ARS', symbol: '$',   label: 'ARS — Peso Argentino' },
  { code: 'MXN', symbol: '$',   label: 'MXN — Peso Mexicano' },
  { code: 'CLP', symbol: '$',   label: 'CLP — Peso Chileno' },
  { code: 'COP', symbol: '$',   label: 'COP — Peso Colombiano' },
  { code: 'PEN', symbol: 'S/',  label: 'PEN — Sol Peruano' },
  { code: 'UYU', symbol: '$',   label: 'UYU — Peso Uruguaio' },
  { code: 'INR', symbol: '₹',   label: 'INR — Rupia Indiana' },
  { code: 'THB', symbol: '฿',   label: 'THB — Baht Tailandês' },
  { code: 'IDR', symbol: 'Rp',  label: 'IDR — Rupia Indonésia' },
  { code: 'SGD', symbol: 'S$',  label: 'SGD — Dólar de Singapura' },
  { code: 'HKD', symbol: 'HK$', label: 'HKD — Dólar de Hong Kong' },
  { code: 'NZD', symbol: 'NZ$', label: 'NZD — Dólar Neozelandês' },
  { code: 'SEK', symbol: 'kr',  label: 'SEK — Coroa Sueca' },
  { code: 'NOK', symbol: 'kr',  label: 'NOK — Coroa Norueguesa' },
  { code: 'DKK', symbol: 'kr',  label: 'DKK — Coroa Dinamarquesa' },
  { code: 'PLN', symbol: 'zł',  label: 'PLN — Zlóti Polonês' },
  { code: 'TRY', symbol: '₺',   label: 'TRY — Lira Turca' },
  { code: 'ZAR', symbol: 'R',   label: 'ZAR — Rand Sul-Africano' },
  { code: 'EGP', symbol: '£',   label: 'EGP — Libra Egípcia' },
  { code: 'AED', symbol: 'د.إ', label: 'AED — Dirham Emirados' },
  { code: 'SAR', symbol: '﷼',   label: 'SAR — Riyal Saudita' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

export function getCurrencySymbolByCode(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}
