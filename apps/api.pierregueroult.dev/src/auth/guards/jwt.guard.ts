import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserService } from '../user/user.service';

Injectable();
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['auth-token'] as string | undefined;

    if (!token) throw new UnauthorizedException('No authentication token provided');

    let payload: { email: string } | undefined;

    try {
      payload = await this.jwtService.verifyAsync<{ email: string }>(token, {
        secret: this.configService.get<string>('NEST_JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.userService.findUserByEmail(payload.email);

    if (!user) throw new UnauthorizedException('User not found');

    request.user = user;

    return true;
  }
}
