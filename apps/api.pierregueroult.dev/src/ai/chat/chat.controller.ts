import { Body, Controller, HttpException, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import type { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

import { ChatMessageDto } from '@repo/db/dto/ai/chatmessage';

import { ChatService } from './chat.service';

@Controller('ai/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  chatbotEndpoint(@Body() chatMessagesDto: ChatMessageDto, @Res() response: Response) {
    try {
      this.logger.log(
        `Chat request received for locale: ${chatMessagesDto.locale}, messages count: ${chatMessagesDto.messages.length}`,
      );

      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          const result = this.chatService.streamChat(
            chatMessagesDto.locale,
            chatMessagesDto.messages,
          );

          writer.merge(
            result.toUIMessageStream({
              messageMetadata: ({ part }) => {
                if (part.type === 'start') {
                  return {
                    createdAt: Date.now(),
                    model: 'gpt-4o',
                  };
                }

                if (part.type === 'finish') {
                  return {
                    totalTokens: part.totalUsage.totalTokens,
                  };
                }
              },
            }),
          );
        },
      });

      pipeUIMessageStreamToResponse({ stream, response });
    } catch (error) {
      this.logger.error('Error in chat endpoint', error);

      if ((error as any)?.message?.includes('rate limit') || (error as any)?.status === 429) {
        throw new HttpException(
          'Too many requests. Please wait before sending another message.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        'An error occurred while processing your chat request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
