'use client';

import { Button } from '@repo/ui/components/button';

import { ComponentProps } from 'react';

import { useChatStore } from '@/components/providers/chat-store-provider';

type TriggerChatButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'>;

export function TriggerChatButton(props: TriggerChatButtonProps) {
  const { triggerChat } = useChatStore((state) => state);

  return <Button onClick={triggerChat} {...props} />;
}
