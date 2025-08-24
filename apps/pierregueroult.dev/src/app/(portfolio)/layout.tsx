import { ReactNode } from 'react';

import LenisProvider from '@/components/providers/lenis-provider';

type PortfolioRootLayoutProps = {
  children: ReactNode;
};

export default function PortfolioRootLayout({ children }: PortfolioRootLayoutProps) {
  return (
    <LenisProvider>
      <main className="bg-background">{children}</main>
    </LenisProvider>
  );
}
