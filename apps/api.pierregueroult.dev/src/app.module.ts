import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@repo/db/entities/token';
import { User } from '@repo/db/entities/user';

import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { UserModule } from './auth/user/user.module';
import { ChatModule } from './chat/chat.module';
import { validateEnvironment } from './env.validation';
import { MailerModule } from './mailer/mailer.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('NEST_DATABASE_URL'),
        entities: [Token, User],
        logging: true,
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AnalyticsModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>('NEST_POSTHOG_API_KEY'),
        options: {
          host: configService.get<string>('NEST_POSTHOG_HOST'),
        },
      }),
    }),
    ChatModule,
    PlatformModule,
    AuthModule,
    UserModule,
    AnalyticsModule,
    MailerModule,
    JwtModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
