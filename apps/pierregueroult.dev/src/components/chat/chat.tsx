'use client';

import { Textarea } from '@repo/ui/components/textarea';

import { AnimatePresence, motion } from 'motion/react';

import { useChatStore } from '@/components/providers/chat-store-provider';

export default function Chat() {
  const { isOpen, messages } = useChatStore((state) => state);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="sticky top-0 h-screen overflow-hidden "
          initial={{ width: 0 }}
          animate={{ width: 300 }}
          exit={{ width: 0, transition: { delay: 0.2, duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0, duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
            transition={{ duration: 0.2, delay: 0.2 }}
            style={{ height: '100%' }}
            className="flex h-full w-full flex-col"
          >
            <div className='w-full flex-1'></div>
            <div className='p-2'>
              <Textarea
                placeholder="Ask anything"
                className=" text-foreground placeholder-muted-foreground max-h-[25vh] min-h-10 w-full resize-none border-0 border-none p-0 text-sm shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
