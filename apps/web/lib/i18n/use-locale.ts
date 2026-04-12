'use client';

import { useContext } from 'react';
import { LocaleContext } from './locale-context';

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return [ctx.locale, ctx.setLocale] as const;
}
