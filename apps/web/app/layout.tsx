import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Space_Mono, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { SessionProvider } from '@/providers/session-provider';
import { LocaleProvider, DEFAULT_LOCALE } from '@/lib/i18n';
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-accent' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-mono' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: {
    default: 'Trpy',
    template: '%s | Trpy',
  },
  description: 'Super-app de viagens com gestão financeira integrada',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${playfair.variable} ${inter.className}`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LocaleProvider>
              <QueryProvider>
                <ConfirmDialogProvider>
                  {children}
                  <Toaster />
                </ConfirmDialogProvider>
              </QueryProvider>
            </LocaleProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
