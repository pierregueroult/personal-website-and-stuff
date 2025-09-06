import { Module } from '@nestjs/common';

import { LanguageModule } from 'src/language/language.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [LanguageModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
