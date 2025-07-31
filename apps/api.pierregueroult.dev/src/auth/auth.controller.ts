import { Controller, Get, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Request, Response } from 'express';

import { User } from '@repo/db/entities/user';

import { Public } from './decorators/public.decorator';
import { GithubGuard } from './guards/github.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
}
