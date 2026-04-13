'use client';

import { useLocale, t, LOCALES, LOCALE_NAMES } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const [locale, setLocale] = useLocale();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center">
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t(locale, 'settings.language')}</p>
          <p className="text-xs text-muted-foreground">{t(locale, 'settings.language_desc')}</p>
        </div>
      </div>

      <Select value={locale} onValueChange={(value) => setLocale(value as any)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {LOCALE_NAMES[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
