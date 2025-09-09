'use client';

import { ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { ChatStore, createChatStore } from '@/stores/chat';

export type ChatStoreApi = ReturnType<typeof createChatStore>;

export const ChatStoreContext = createContext<ChatStoreApi | undefined>(undefined);

export type ChatStoreProviderProps = {
  children: ReactNode;
};

export const ChatStoreProvider = ({ children }: ChatStoreProviderProps) => {
  const store = useRef<ChatStoreApi | null>(null);
  if (store.current === null) store.current = createChatStore();

  return <ChatStoreContext.Provider value={store.current}>{children}</ChatStoreContext.Provider>;
};

export const useChatStore = <T,>(selector: (store: ChatStore) => T): T => {
  const context = useContext(ChatStoreContext);

  if (!context) throw new Error('useChatStore must be used within a ChatStoreProvider');

  return useStore(context, selector);
};
