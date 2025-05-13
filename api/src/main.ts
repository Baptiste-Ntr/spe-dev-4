import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: process.env.FRONT_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Ajouter Cookie
    exposedHeaders: ['Set-Cookie'] // Important pour les coo,
  });

  logger.log('CORS configured');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  logger.log('Cookie parser enabled');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
