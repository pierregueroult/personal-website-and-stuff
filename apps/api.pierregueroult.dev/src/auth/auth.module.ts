import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TwitchModule } from 'src/platform/twitch/twitch.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubGuard } from './guards/github.guard';
import { JwtGuard } from './guards/jwt.guard';
import { GithubStrategy } from './strategies/github.stategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    HttpModule,
    UserModule,
    TwitchModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('NEST_JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('NEST_JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GithubStrategy, JwtGuard, GithubGuard],
  controllers: [AuthController],
})
export class AuthModule { }
