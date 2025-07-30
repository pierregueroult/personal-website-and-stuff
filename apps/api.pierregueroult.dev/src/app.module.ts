import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@repo/db/entities/token';

import { validateEnvironment } from './env.validation';
import { ChatModule } from './chat/chat.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.getOrThrow<string>('NEST_DATABASE_URL'),
        entities: [Token],
        logging: true,
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<string>('NODE_ENV') !== 'production',
      }),
    }),
    ChatModule,
    PlatformModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
