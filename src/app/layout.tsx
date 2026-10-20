import type { Metadata } from 'next';
import './globals.css';
import { getLang } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/client';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'jb-components',
  description: 'Shared UI components (ported from CP-Meiji Non-Campus)',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <I18nProvider lang={lang}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
