import type { ReactNode } from 'react';
import { JetBrains_Mono } from 'next/font/google';
import '@repo/ui/styles/globals.css';

type RootLayoutProps = Readonly<{ children: ReactNode }>;

const mainFont = JetBrains_Mono({ subsets: ['latin'], variable: '--font-main' });

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mainFont.variable} ${mainFont.className} antialiased`}>{children}</body>
    </html>
  );
}
