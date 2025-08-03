import { Controller, Get, HttpCode, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Request, Response } from 'express';

import { User } from '@repo/db/entities/user';

import { EnvironmentVariables } from '../env.validation';
import { TwitchAuthService } from '../platform/twitch/auth/auth.service';
import { Public } from './decorators/public.decorator';
import { GithubGuard } from './guards/github.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly twitchAuthService: TwitchAuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(GithubGuard)
  @Public()
  @Get('github')
  async github() {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(GithubGuard)
  @Public()
  @Get('github/callback')
  githubCallback(@Req() req: Request, @Res() res: Response) {
    if (req.user) {
      const token = this.jwtService.sign({ email: (req.user as User).email });

      return res.redirect(
        `${this.configService.get<string>('NEST_CORS_ORIGIN')}/auth/github/callback?token=${token}`,
      );
    } else {
      return res.redirect(`${this.configService.get<string>('NEST_CORS_ORIGIN')}/auth/sigin-in`);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Get('twitch/callback')
  async twitch(@Query('code') code: string, @Res() res: Response, @Req() req: Request) {
    if (!code)
      res.redirect(`${this.configService.get<string>('NEST_CORS_ORIGIN')}/?twitch=no_code`);
    try {
      await this.twitchAuthService.setAccessToken(code);
      return res.redirect(`${this.configService.get<string>('NEST_CORS_ORIGIN')}/?twitch=success`);
    } catch {
      return res.redirect(`${this.configService.get<string>('NEST_CORS_ORIGIN')}/?twitch=error`);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('twitch')
  async twitchAuth(@Res() res: Response) {
    const searchParams = new URLSearchParams({
      client_id: this.configService.get<string>('NEST_TWITCH_CLIENT_ID'),
      redirect_uri: this.configService.get<string>('NEST_TWITCH_REDIRECT_URI'),
      response_type: 'code',
      scope: 'user:read:email chat:read chat:edit',
    });

    const url = `https://id.twitch.tv/oauth2/authorize?${searchParams.toString()}`;

    return res.redirect(url);
  }
}
