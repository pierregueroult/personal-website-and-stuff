import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { EnvironmentVariables } from './env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables>);

  const document = new DocumentBuilder()
    .setTitle('api.pierregueroult.dev')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('api', app, documentFactory());

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
