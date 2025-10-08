import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LanguageModule } from 'src/language/language.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [LanguageModule, ConfigModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
