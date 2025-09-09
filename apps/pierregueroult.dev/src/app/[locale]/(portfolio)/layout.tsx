import Chat from '@/components/chat/chat';
import { Header } from '@/components/navigation/header';
import { ChatStoreProvider } from '@/components/providers/chat-store-provider';
import LenisProvider from '@/components/providers/lenis-provider';

export default function PortfolioRootLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <LenisProvider>
      <ChatStoreProvider>
        <div className="flex">
          <Chat />
          <main className="bg-background flex-1">
            <Header />
            {children}
          </main>
        </div>
      </ChatStoreProvider>
    </LenisProvider>
  );
}
