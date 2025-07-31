import { Module } from '@nestjs/common';
import { TwitchChatService } from './chat/chat.service';
import { TwitchAuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@repo/db/entities/token';

@Module({
  providers: [TwitchChatService, TwitchAuthService],
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Token])],
  exports: [TwitchChatService],
})
export class TwitchModule {}
