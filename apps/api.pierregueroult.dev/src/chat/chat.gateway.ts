import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { ChatMessage } from '@repo/db/types/chat/chat.interface';

import type { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  emitChatMessage(chatMessage: ChatMessage): void {
    this.server.emit('chat', chatMessage); 
  }
}
