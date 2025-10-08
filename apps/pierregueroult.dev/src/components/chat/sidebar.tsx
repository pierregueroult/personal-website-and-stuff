'use client';

import { Separator } from '@repo/ui/components/separator';

import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from 'next-intl';

import Chat from '@/components/chat/chat';
import { useChatStore } from '@/components/providers/chat-store-provider';
import { useHotkeys } from '@/hooks/use-keys';
import { ChatStore } from '@/stores/chat';

export default function ChatSidebar() {
  const { isOpen, messages, setMessages, triggerChat } = useChatStore(
    (state: ChatStore): ChatStore => state,
  );
  const locale = useLocale();

  useHotkeys('meta+b', () => triggerChat());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="chat-sidebar sticky top-0 h-screen overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          exit={{ width: 0, transition: { delay: 0.2, duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0, duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
            transition={{ duration: 0.2, delay: 0.2 }}
            style={{ height: '100%' }}
            className="flex h-full w-full flex-row"
          >
            <div className="flex h-full w-full max-w-[calc(100%-8px)] flex-1 flex-col">
              <Chat initialMessages={messages} setStoredMessages={setMessages} locale={locale} />
            </div>
            <Separator orientation="vertical" className="mr-2" />
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
