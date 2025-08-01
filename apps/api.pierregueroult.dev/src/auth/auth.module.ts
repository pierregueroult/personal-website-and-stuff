import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './strategies/github.stategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    HttpModule,
    UserModule,
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
  providers: [AuthService, JwtStrategy, GithubStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
