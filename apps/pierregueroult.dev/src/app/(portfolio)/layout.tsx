
import LenisProvider from '@/components/providers/lenis-provider';

export default function PortfolioRootLayout({ children }: LayoutProps<'/'>) {
  return (
    <LenisProvider>
      <main className="bg-background">{children}</main>
    </LenisProvider>
  );
}
