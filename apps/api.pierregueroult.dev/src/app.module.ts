import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@repo/db/entities/auth/token';
import { User } from '@repo/db/entities/auth/user';
import { Post } from '@repo/db/entities/blog/post';
import { AnonymousProfile } from '@repo/db/entities/blog/profile';
import { Recommendation } from '@repo/db/entities/blog/recommendation';
import { Tag } from '@repo/db/entities/blog/tag';
import { UserInteraction } from '@repo/db/entities/blog/user-interaction';

import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { UserModule } from './auth/user/user.module';
import { BlogModule } from './blog/blog.module';
import { ChatModule } from './chat/chat.module';
import { EnvironmentVariables, validateEnvironment } from './env.validation';
import { HealthModule } from './health/health.module';
import { LanguageModule } from './language/language.module';
import { MailerModule } from './mailer/mailer.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnvironment }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 50,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 250,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
        type: 'mongodb',
        url: configService.get('NEST_DATABASE_URL'),
        entities: [Token, User, Post, Tag, AnonymousProfile, UserInteraction, Recommendation],
        logging: true,
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AnalyticsModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        apiKey: configService.get('NEST_POSTHOG_API_KEY'),
        options: {
          host: configService.get('NEST_POSTHOG_HOST'),
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
    HealthModule,
    BlogModule,
    AiModule,
    LanguageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
