import './env';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT, VERSION } from '@/constants/env';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
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
