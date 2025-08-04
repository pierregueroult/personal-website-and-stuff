import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { EnvironmentVariables } from './env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables>);

  app.enableCors({
    origin: config.get<string>('NEST_FRONTEND_URL'),
    credentials: true,
  });
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.set('trust proxy', 'loopback');

  await app.listen(config.get<number>('NEST_PORT'));
}

void bootstrap();
