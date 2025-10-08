import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@repo/ui/components/ai/conversation';

import { ChatMessage } from '@/stores/chat';

import { ChatMessageComponent } from './chat-message';

type ChatConversationProps = {
  messages: ChatMessage[];
};

export function ChatConversation({ messages }: ChatConversationProps) {
  return (
    <div className="w-full flex-1 space-y-4 overflow-y-auto overscroll-none pr-2">
      <Conversation className="relative h-full w-full">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ask me anything about this website"
              description="I'm here to help you with any questions you have about Pierre Guéroult's portfolio. Feel free to ask me about his skills, experiences, projects, or blog posts."
            />
          ) : (
            messages.map((message) => <ChatMessageComponent key={message.id} message={message} />)
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
