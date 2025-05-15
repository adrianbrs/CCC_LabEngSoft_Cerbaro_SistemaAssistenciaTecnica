import './env';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  IS_PROD,
  PORT,
  COOKIE_SECRET,
  VERSION,
  CORS_ORIGIN,
} from '@/constants/env';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as ms from 'ms';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from './modules/auth/models/session.entity';
import { Repository } from 'typeorm';
import { Config } from './constants/config';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      credentials: true,
      origin: CORS_ORIGIN,
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const sessionRepository = app.get<Repository<Session>>(
    getRepositoryToken(Session),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  app.use(
    session({
      secret: COOKIE_SECRET,
      name: Config.cookies.session.name,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: ms('1d'),
        httpOnly: true,
        sameSite: 'lax',
        secure: IS_PROD,
        signed: true,
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(cookieParser(COOKIE_SECRET));

  const config = new DocumentBuilder()
    .setTitle('Musat API')
    .setDescription('Core API for the Musat application')
    .setVersion(VERSION)
    .build();

  SwaggerModule.setup(
    'swagger',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: 'swagger/json',
      swaggerOptions: {
        requestInterceptor: async (req: RequestInit) => {
          const { csrfToken } = await fetch('/csrf').then(
            (res) => res.json() as Promise<{ csrfToken: string }>,
          );
          req.headers!['x-csrf-token'] = csrfToken;
          return req;
        },
      },
    },
  );

  await app.listen(PORT);
  logger.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap().catch((err) => {
  logger.error('Error starting the application:', err);
  process.exit(1);
});
