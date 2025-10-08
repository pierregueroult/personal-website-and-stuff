import { useChat } from '@ai-sdk/react';

import { DefaultChatTransport } from 'ai';
import { useEffect } from 'react';

import { useBrowserId } from '@/hooks/use-browser-id';
import { env } from '@/lib/env/client';
import { ChatMessage } from '@/stores/chat';

import { ChatConversation } from './chat-conversation';
import { ChatInput } from './chat-input';

type ChatProps = {
  initialMessages: ChatMessage[];
  setStoredMessages: (messages: ChatMessage[]) => void;
  locale: string;
};

export default function Chat({ initialMessages, setStoredMessages, locale }: ChatProps) {
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `${env.NEXT_PUBLIC_API_URL}/ai/chat`,
      body: { locale },
    }),
  });

  const id = useBrowserId();

  const handleSubmit = (message: string) => {
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: message }],
      metadata: {
        createdAt: Date.now(),
        userId: id,
      },
    });
  };

  useEffect(() => {
    setStoredMessages(messages);
  }, [messages, setStoredMessages]);

  return (
    <>
      <ChatConversation messages={messages} />
      <ChatInput
        onSubmit={handleSubmit}
        disabled={status === 'error' || status === 'streaming' || status === 'submitted'}
      />
    </>
  );
}
