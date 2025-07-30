import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TwitchAuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitchChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TwitchChatService.name);
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private buffer: string = '';
  private isConnected: boolean = false;

  constructor(
    private readonly twitchAuthService: TwitchAuthService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Module destroyed');
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

    this.ws.onmessage = (event: MessageEvent) => {
      this.buffer += event.data;
      const lines = this.buffer.split('\r\n');
      this.buffer = lines.pop() || '';
      for (const line of lines) {
        this.handleReceivedLine(line);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.reconnect();
    };

    this.ws.onerror = (error: Event) => {
      this.logger.error('WebSocket error:', error);
      this.reconnect();
    };
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
      const tagsMatch = line.match(/^@([^ ]+) /);
      const tags = tagsMatch ? this.parseTags(tagsMatch[1]) : {};
      const usernameMatch = line.match(/:(\w+)!\w+\.tmi\.twitch\.tv/);
      const username = usernameMatch ? usernameMatch[1] : 'unknown';
      const messageMatch = line.match(/PRIVMSG #[^ ]+ :(.+)$/);
      const message = messageMatch ? messageMatch[1] : '';

      this.logger.log(
        `Received message from ${username}: ${message} with tags: ${JSON.stringify(tags)}`,
      );
      return;
    }

    if (line.includes('NOTICE')) {
      this.logger.warn(`Received notice: ${line}`);
      return;
    }

    this.logger.debug(`Received line: ${line}`);
  }

  private parseTags(tagsString: string): Record<string, string> {
    return tagsString.split(';').reduce<Record<string, string>>((acc, tag) => {
      const [key, value] = tag.split('=');
      acc[key] = value ?? '';
      return acc;
    }, {});
  }
}
