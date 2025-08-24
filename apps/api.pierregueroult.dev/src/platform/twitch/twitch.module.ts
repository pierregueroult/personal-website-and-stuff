import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from 'src/chat/chat.module';

import { Token } from '@repo/db/entities/token';

import { TwitchAuthService } from './auth/auth.service';
import { TwitchChatService } from './chat/chat.service';

@Module({
  providers: [TwitchChatService, TwitchAuthService],
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Token]), ChatModule],
  exports: [TwitchChatService, TwitchAuthService],
})
export class TwitchModule {}
