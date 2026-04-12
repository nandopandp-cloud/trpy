export const LOCALES = ['pt-BR', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'ja': '日本語',
  'zh-CN': '中文 (简体)',
};

export const DEFAULT_LOCALE: Locale = 'pt-BR';
