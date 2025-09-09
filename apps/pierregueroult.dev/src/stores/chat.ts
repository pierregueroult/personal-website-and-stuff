'use client';

import type { UIMessage } from 'ai';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type ChatStates = {
  isOpen: boolean;
  messages: UIMessage[];
};

export type ChatActions = {
  openChat: () => void;
  closeChat: () => void;
  triggerChat: () => void;
  addMessage: (message: UIMessage) => void;
  setMessages: (messages: UIMessage[]) => void;
};

export type ChatStore = ChatStates & ChatActions;

export const defaultChatStates: ChatStates = {
  isOpen: false,
  messages: [],
};

export const createChatStore = (initState: ChatStates = defaultChatStates) => {
  return createStore<ChatStore>()(
    persist(
      (set) => ({
        ...initState,
        openChat: () => set(() => ({ isOpen: true })),
        closeChat: () => set(() => ({ isOpen: false })),
        triggerChat: () => set((state) => ({ isOpen: !state.isOpen })),
        addMessage: (message: UIMessage) =>
          set((state) => ({ messages: [...state.messages, message] })),
        setMessages: (messages: UIMessage[]) => set(() => ({ messages })),
      }),
      {
        name: 'chat-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ messages: state.messages, isOpen: state.isOpen }),
      },
    ),
  );
};
