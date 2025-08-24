import '@repo/ui/styles/globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { accentFont, mainFont } from '@/lib/fonts';

export default function RootLayout({ children }: LayoutProps<'/'>) {
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
