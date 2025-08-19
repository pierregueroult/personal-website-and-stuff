import { Injectable } from '@nestjs/common';

import type { ChatMessage } from '@repo/db/types/chat/chat.interface';

import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(private readonly chatGateway: ChatGateway) { }

  sendTwitchChatMessage(line: string): void {
    const chatMessage = this.convertTwitchLineToChatMessage(line);
    if (chatMessage) {
      this.chatGateway.emitChatMessage(chatMessage);
    }
  }

  convertTwitchLineToChatMessage(line: string): ChatMessage | null {
    const [tagsRaw] = line.split(' ', 1);
    const tags = Object.fromEntries(
      tagsRaw
        .replace('@', '')
        .split(';')
        .map((tag) => tag.split('=')),
    );

    const username = line.match(/:(\w+)!/)?.[1] ?? '';
    const message = line.match(/PRIVMSG #[^ ]+ :(.*)$/)?.[1] ?? '';
    const color = 'color' in tags ? tags.color : '#FFFFFF';

    const badges: Record<string, string> = {};
    if (tags['badges']) {
      tags['badges'].split(',').forEach((badge: string) => {
        const [name, version] = badge.split('/');
        if (name) badges[name] = version;
      });
    }

    return {
      platform: 'twitch',
      username,
      message,
      timestamp: new Date().toISOString(),
      color,
      badges,
    };
  }
}
