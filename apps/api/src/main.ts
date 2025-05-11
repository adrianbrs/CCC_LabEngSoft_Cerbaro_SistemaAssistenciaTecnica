import './env';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  IS_PROD,
  PORT,
  SESSION_NAME,
  SESSION_SECRET,
  VERSION,
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

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const sessionRepository = app.get<Repository<Session>>(
    getRepositoryToken(Session),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(
    session({
      secret: SESSION_SECRET,
      name: SESSION_NAME,
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
    },
  );

  await app.listen(PORT);
  logger.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap().catch((err) => {
  logger.error('Error starting the application:', err);
  process.exit(1);
});
