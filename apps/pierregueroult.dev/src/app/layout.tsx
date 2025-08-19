import '@repo/ui/styles/globals.css';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { accentFont, mainFont } from '@/lib/fonts';

type RootLayoutProps = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mainFont.variable} ${accentFont.variable} ${mainFont.className} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
