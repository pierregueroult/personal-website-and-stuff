import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';

import { Token } from '@repo/db/entities/token';

import { EnvironmentVariables } from '../../../env.validation';
import { TwitchTokenResponse } from './auth.interface';

@Injectable()
export class TwitchAuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
  ) {}

  private readonly REFRESH_MARGIN = 5 * 60 * 1000;

  async getAccessToken(): Promise<string> {
    const token = await this.tokenRepository.findOne({
      where: { name: 'twitch' },
    });
    if (!token) throw new Error('Twitch token not found');

    const now = new Date();
    const timeLeft = token.expiresAt.getTime() - now.getTime();

    if (timeLeft > this.REFRESH_MARGIN) {
      return token.accessToken;
    }

    console.log('Refreshing Twitch access token');

    return await this.refreshAccessToken(token);
  }

  private async refreshAccessToken(token: Token): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: this.configService.get<string>('NEST_TWITCH_CLIENT_ID'),
        client_secret: this.configService.get<string>('NEST_TWITCH_CLIENT_SECRET'),
      });

      const response: AxiosResponse<TwitchTokenResponse> = await this.httpService.axiosRef.post(
        'https://id.twitch.tv/oauth2/token',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token, refresh_token, expires_in } = response.data;

      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.tokenRepository.save(token);

      return access_token;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to refresh Twitch access token: ${error.message}`);
      } else {
        throw new Error('Failed to refresh Twitch access token due to an unknown error');
      }
    }
  }

  async setAccessToken(code: string) {
    const formParams = new URLSearchParams({
      client_id: this.configService.get<string>('NEST_TWITCH_CLIENT_ID'),
      client_secret: this.configService.get<string>('NEST_TWITCH_CLIENT_SECRET'),
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.configService.get<string>('NEST_TWITCH_REDIRECT_URI'),
    });

    const response: AxiosResponse<TwitchTokenResponse> = await this.httpService.axiosRef.post(
      'https://id.twitch.tv/oauth2/token',
      formParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Failed to set Twitch access token: ${response.statusText}`);
    }

    const { access_token, refresh_token, expires_in } = response.data;

    const token = await this.tokenRepository.findOne({ where: { name: 'twitch' } });

    if (!token) {
      const newToken = this.tokenRepository.create({
        name: 'twitch',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
      });
      await this.tokenRepository.save(newToken);
    } else {
      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = new Date(Date.now() + expires_in * 1000);
      await this.tokenRepository.save(token);
    }
  }
}
