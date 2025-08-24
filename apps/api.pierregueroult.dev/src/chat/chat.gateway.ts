import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import type { Server } from 'socket.io';

import type { ChatMessage } from '@repo/db/types/chat/chat.interface';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  emitChatMessage(chatMessage: ChatMessage): void {
    this.server.emit('chat', chatMessage);
  }
}
