import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WebSocket, { type RawData } from 'ws';

import { EnvironmentVariables } from '../../../env.validation';
import { TwitchAuthService } from '../auth/auth.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class TwitchChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TwitchChatService.name);
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private buffer: string = '';
  private isConnected: boolean = false;

  constructor(
    private readonly twitchAuthService: TwitchAuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly chatGateway: ChatGateway,
  ) { }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    this.disconnect();
  }

  private async connect() {
    if (this.isConnected) return;

    let accessToken: string;
    try {
      accessToken = await this.twitchAuthService.getAccessToken();
    } catch {
      this.logger.error('Could not connect to Twitch chat: Access token not available');
      return;
    }

    const channel = this.configService.get<string>('NEST_TWITCH_CHANNEL');
    const username = this.configService.get<string>('NEST_TWITCH_USERNAME');

    this.ws = new WebSocket(`wss://irc-ws.chat.twitch.tv:443`);

    this.ws.onopen = () => {
      this.isConnected = true;

      this.logger.log('WebSocket connection established');
      this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      this.send(`PASS oauth:${accessToken}`);
      this.send(`NICK ${username}`);
      this.send(`JOIN #${channel}`);
    };

    this.ws.on('message', (event: RawData) => {
      this.buffer += event.toString('utf-8');
      const lines = this.buffer.split('\r\n');
      this.buffer = lines.pop() || '';
      for (const line of lines) {
        this.handleReceivedLine(line);
      }
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.reconnect();
    });

    this.ws.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
      this.reconnect();
    });
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private reconnect() {
    this.disconnect();
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(async () => {
        await this.connect();
      }, 5000);
    }
  }

  private send(message: string) {
    if (this.ws && this.isConnected) {
      this.ws.send(message);
    }
  }

  private handleReceivedLine(line: string) {
    if (line.length === 0) return;

    if (line.startsWith('PING')) {
      this.send(line.replace('PING', 'PONG'));
      return;
    }

    if (line.includes('PRIVMSG')) {

      const username = this.getTag(line, 'display-name') || this.getTag(line, 'login') || 'unknown';
      const message = line.split('PRIVMSG')[1].split(':')[1] || '';
      const color = this.getTag(line, 'color') || '#000000';

      this.logger.log(`Received message from ${username}: ${message}`);

     this.chatGateway.emitChatMessage('twitch', color, message, username);

      return;
    }

    if (line.includes('NOTICE')) {
      this.logger.warn(`Received notice: ${line}`);
      return;
    }

    this.logger.debug(`Received line: ${line}`);
  }

  private getTags(message: string): Record<string, string> {
    if (!message.startsWith('@')) return {};

    const endIndex = message.indexOf(' ');
    if (endIndex === -1) return {};

    const tagsString = message.substring(1, endIndex);
    const tags: Record<string, string> = {};

    for (const tag of tagsString.split(';')) {
      const [key, ...rest] = tag.split('=');
      tags[key] = rest.length > 0 ? rest.join('=') : '';
    }

    return tags;
  }

  private getTag(message: string, key: string): string | null {
    const tags = this.getTags(message);
    return Object.prototype.hasOwnProperty.call(tags, key) ? tags[key] : null;
  }
}
