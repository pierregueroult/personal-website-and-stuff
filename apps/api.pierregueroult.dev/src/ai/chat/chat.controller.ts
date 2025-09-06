import { Body, Controller, Post } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';

import { ChatMessageDto } from '@repo/db/dto/ai/chatmessage';

import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Post('')
  async chatbotEndpoint(@Body() chatMessagesDto: ChatMessageDto) {
    return this.chatService.streamChat(chatMessagesDto.locale, chatMessagesDto.messages);
  }
}
