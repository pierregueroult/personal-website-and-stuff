import { Message, MessageContent } from '@repo/ui/components/ai/message';
import { Response } from '@repo/ui/components/ai/response';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { cn } from '@repo/ui/lib/utils';

import { useFormatter } from 'next-intl';

import { ChatMessage } from '@/stores/chat';

type ChatMessageProps = {
  message: ChatMessage;
};

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const format = useFormatter();

  const isThisMessageToday = ((d) => {
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  })(new Date(message.metadata?.createdAt || ""));

  return (
    <Message from={message.role} key={message.id} className="flex-col">
      <MessageContent variant="flat" className="max-w-full">
        <span>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <Response key={`${message.id}-${i}`}>{part.text}</Response>;
              default:
                return null;
            }
          })}
        </span>
      </MessageContent>
      <div
        className={cn(
          'flex w-full items-center text-xs opacity-50',
          message.role === 'user' ? 'justify-end' : 'justify-start',
        )}
      >
        {message.metadata?.createdAt && (
          <Tooltip>
            <TooltipTrigger>
              {isThisMessageToday
                ? format.dateTime(message.metadata.createdAt, {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : format.dateTime(message.metadata.createdAt, {
                  year: 'numeric',
                  day: '2-digit',
                  month: '2-digit',
                })}
            </TooltipTrigger>
            <TooltipContent align={message.role === 'user' ? 'end' : 'start'} side="bottom">
              {format.dateTime(message.metadata.createdAt, {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              })}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </Message>
  );
}
