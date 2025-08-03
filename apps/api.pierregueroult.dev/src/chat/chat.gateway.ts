import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import type { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  emitChatMessage(category: string, color: string, message: string, username: string): void {
    this.server.emit('chat', {
      category,
      color,
      message,
      username,
    });
  }
}
