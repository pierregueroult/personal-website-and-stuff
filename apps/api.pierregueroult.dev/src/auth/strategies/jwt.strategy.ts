import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EnvironmentVariables } from '../../env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies['auth-token'] as string | undefined,
      ]),
      secretOrKey: configService.get<string>('NEST_JWT_SECRET'),
    });
  }

  validate(payload: { email: string }) {
    return { email: payload.email };
  }
}
