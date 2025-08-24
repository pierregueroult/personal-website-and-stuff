import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WebSocket, { type RawData } from 'ws';

import { ChatService } from '../../../chat/chat.service';
import { EnvironmentVariables } from '../../../env.validation';
import { TwitchAuthService } from '../auth/auth.service';
import {
  FORCE_RECONNECT_DELAY,
  HEALTH_CHECK_INTERVAL,
  IDLE_THRESHOLD,
  PING_TIMEOUT,
  RECONNECT_DELAY,
  TOKEN_CHECK_INTERVAL,
  TWITCH_IRC_URL,
} from './chat.constants';
import { ConnectionConfig, TwitchTags } from './chat.interface';

@Injectable()
export class TwitchChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TwitchChatService.name);

  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private buffer = '';

  private currentAccessToken: string | null = null;

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;

  private lastMessageTime = 0;
  private pendingPing = false;

  constructor(
    private readonly twitchAuthService: TwitchAuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly chatService: ChatService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
    this.startPeriodicTokenCheck();
    this.startHealthCheck();
  }

  async onModuleDestroy(): Promise<void> {
    this.disconnect();
    this.clearIntervals();
  }

  private async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.debug('Already connected, skipping connection attempt');
      return;
    }

    try {
      const config = await this.getConnectionConfig();
      await this.establishWebSocketConnection(config);
    } catch (error) {
      this.logger.error('Failed to connect to Twitch chat', error);
      this.scheduleReconnect();
    }
  }

  private async getConnectionConfig(): Promise<ConnectionConfig> {
    const accessToken = await this.twitchAuthService.getAccessToken();
    const channel = this.configService.get<string>('NEST_TWITCH_CHANNEL');
    const username = this.configService.get<string>('NEST_TWITCH_USERNAME');

    if (!channel || !username) {
      throw new Error('Twitch channel and username must be configured');
    }

    this.currentAccessToken = accessToken;
    return { accessToken, channel, username };
  }

  private async establishWebSocketConnection(config: ConnectionConfig): Promise<void> {
    this.ws = new WebSocket(TWITCH_IRC_URL);

    this.ws.on('open', () => this.handleConnectionOpen(config));
    this.ws.on('message', (event: RawData) => this.handleMessage(event));
    this.ws.on('close', () => this.handleConnectionClose());
    this.ws.on('error', (error: Error) => this.handleConnectionError(error));
  }

  private handleConnectionOpen(config: ConnectionConfig): void {
    this.isConnected = true;
    this.lastMessageTime = Date.now();

    this.logger.log('WebSocket connection established');
    this.sendInitialCommands(config);
  }

  private sendInitialCommands(config: ConnectionConfig): void {
    this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    this.send(`PASS oauth:${config.accessToken}`);
    this.send(`NICK ${config.username}`);
    this.send(`JOIN #${config.channel}`);
  }

  private handleMessage(rawData: RawData): void {
    this.buffer += rawData.toString('utf-8');
    const lines = this.buffer.split('\r\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.handleReceivedLine(line);
    }
  }

  private handleConnectionClose(): void {
    this.logger.warn('WebSocket connection closed');
    this.isConnected = false;
    this.scheduleReconnect();
  }

  private handleConnectionError(error: Error): void {
    this.logger.error('WebSocket error occurred', error);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimeout) {
      this.logger.log(`Scheduling reconnection in ${RECONNECT_DELAY / 1000} seconds`);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        void this.connect();
      }, RECONNECT_DELAY);
    }
  }

  private disconnect(): void {
    this.logger.debug('Disconnecting from Twitch chat');

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.resetConnectionState();
    this.clearTimeouts();
  }

  private resetConnectionState(): void {
    this.isConnected = false;
    this.currentAccessToken = null;
    this.pendingPing = false;
    this.buffer = '';
  }

  private clearTimeouts(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  private send(message: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(message);
      this.logger.debug(`Sent: ${message}`);
    } else {
      this.logger.warn(`Attempted to send message while disconnected: ${message}`);
    }
  }

  private handleReceivedLine(line: string): void {
    if (!line.length) return;

    this.lastMessageTime = Date.now();
    this.logger.debug(`Received: ${line}`);

    if (this.isPingMessage(line)) {
      this.handlePingMessage(line);
      return;
    }

    if (this.isPongMessage(line)) {
      this.handlePongMessage();
      return;
    }

    if (this.isChatMessage(line)) {
      this.handleChatMessage(line);
      return;
    }

    if (this.isNoticeMessage(line)) {
      this.handleNoticeMessage(line);
      return;
    }

    this.logger.debug(`Unhandled message type: ${line}`);
  }

  private isPingMessage(line: string): boolean {
    return line.startsWith('PING');
  }

  private isPongMessage(line: string): boolean {
    return line.startsWith('PONG');
  }

  private isChatMessage(line: string): boolean {
    return line.includes('PRIVMSG');
  }

  private isNoticeMessage(line: string): boolean {
    return line.includes('NOTICE');
  }

  private handlePingMessage(line: string): void {
    const pongMessage = line.replace('PING', 'PONG');
    this.send(pongMessage);
  }

  private handlePongMessage(): void {
    if (this.pendingPing) {
      this.logger.debug('Received PONG response - connection is healthy');
      this.pendingPing = false;
      if (this.pingTimeout) {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = null;
      }
    }
  }

  private handleChatMessage(line: string): void {
    try {
      this.chatService.sendTwitchChatMessage(line);
    } catch (error) {
      this.logger.error('Failed to parse chat message', error, { line });
    }
  }

  private handleNoticeMessage(line: string): void {
    this.logger.warn(`Received notice: ${line}`);

    if (this.isAuthenticationFailure(line)) {
      this.logger.error('Twitch authentication failed - forcing reconnection with fresh token');
      void this.forceReconnectWithNewToken();
    }
  }

  private isAuthenticationFailure(line: string): boolean {
    return line.includes('Login authentication failed') || line.includes('Invalid credentials');
  }

  private getTags(message: string): TwitchTags {
    if (!message.startsWith('@')) {
      return {};
    }

    const endIndex = message.indexOf(' ');
    if (endIndex === -1) {
      return {};
    }

    const tagsString = message.substring(1, endIndex);
    const tags: TwitchTags = {};

    for (const tag of tagsString.split(';')) {
      const [key, ...valueParts] = tag.split('=');
      if (key) {
        tags[key] = valueParts.length > 0 ? valueParts.join('=') : '';
      }
    }

    return tags;
  }

  private getTag(message: string, key: string): string | null {
    const tags = this.getTags(message);
    return tags[key] ?? null;
  }

  private startPeriodicTokenCheck(): void {
    this.tokenRefreshInterval = setInterval(async () => {
      await this.checkTokenValidity();
    }, TOKEN_CHECK_INTERVAL);
  }

  private async checkTokenValidity(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const newToken = await this.twitchAuthService.getAccessToken();

      if (this.hasTokenChanged(newToken)) {
        this.logger.log('Token has been refreshed, reconnecting with new token');
        await this.forceReconnectWithNewToken();
      }
    } catch (error) {
      this.logger.error('Failed to check token validity', error);
      await this.forceReconnectWithNewToken();
    }
  }

  private hasTokenChanged(newToken: string): boolean {
    return newToken !== this.currentAccessToken;
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_INTERVAL);
  }

  private performHealthCheck(): void {
    if (!this.isConnected) {
      return;
    }

    const timeSinceLastMessage = Date.now() - this.lastMessageTime;

    if (this.isConnectionIdle(timeSinceLastMessage)) {
      if (!this.pendingPing) {
        this.logger.debug(
          `No activity for ${Math.round(timeSinceLastMessage / 1000)}s, sending health check ping`,
        );
        this.sendHealthCheckPing();
      }
    }
  }

  private isConnectionIdle(timeSinceLastMessage: number): boolean {
    return timeSinceLastMessage > IDLE_THRESHOLD;
  }

  private clearIntervals(): void {
    const intervals = [
      { interval: this.tokenRefreshInterval, name: 'tokenRefreshInterval' },
      { interval: this.healthCheckInterval, name: 'healthCheckInterval' },
    ];

    for (const { interval, name } of intervals) {
      if (interval) {
        clearInterval(interval);
        this.logger.debug(`Cleared ${name}`);
      }
    }

    this.tokenRefreshInterval = null;
    this.healthCheckInterval = null;
  }

  private async forceReconnectWithNewToken(): Promise<void> {
    this.logger.log('Forcing reconnection with fresh token');
    this.disconnect();

    // Clear the current token to force a fresh fetch
    this.currentAccessToken = null;

    // Wait a bit before reconnecting to avoid rapid reconnection loops
    setTimeout(async () => {
      await this.connect();
    }, FORCE_RECONNECT_DELAY);
  }

  private sendHealthCheckPing(): void {
    if (!this.canSendPing()) {
      return;
    }

    this.pendingPing = true;
    const pingMessage = 'PING :tmi.twitch.tv';
    this.send(pingMessage);

    this.setPingTimeout();
  }

  private canSendPing(): boolean {
    return this.isConnected && !this.pendingPing;
  }

  private setPingTimeout(): void {
    this.pingTimeout = setTimeout(() => {
      if (this.pendingPing) {
        this.logger.warn(
          'Health check ping timeout - connection appears dead, forcing reconnection',
        );
        this.pendingPing = false;
        void this.forceReconnectWithNewToken();
      }
    }, PING_TIMEOUT);
  }
}
