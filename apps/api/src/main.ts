import './env';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT, COOKIE_SECRET, VERSION, CORS_ORIGIN } from '@/constants/env';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { SessionMiddleware } from './modules/auth/session.middleware';
import { ApiWebSocketAdapter } from './shared/websocket/websocket.adapter';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      credentials: true,
      origin: CORS_ORIGIN,
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const sessionMiddleware = app.get(SessionMiddleware);
  app.use(sessionMiddleware.use.bind(sessionMiddleware));

  app.use(cookieParser(COOKIE_SECRET));

  // Allows complex query strings in URLs
  // https://docs.nestjs.com/controllers#query-parameters
  app.set('query parser', 'extended');

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

  app.useWebSocketAdapter(new ApiWebSocketAdapter(app));

  await app.listen(PORT);
  logger.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap().catch((err) => {
  logger.error('Error starting the application:', err);
  process.exit(1);
});
