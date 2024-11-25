import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logApplicationDetails, logServerReady } from './logger';
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { setupSecurity } from './helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { configureCors } from './cors';
import { AllExceptionsFilter } from './error';

const port: number = 3333;
const prefix: string = 'Q';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  setupSecurity(app);
  app.use(cookieParser());
  app.setGlobalPrefix(prefix);
  const configService = app.get(ConfigService);
  configureCors(app, configService);
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(configService.get('PORT') || port);
  return configService;
}

bootstrap().then((configService) => {
  logServerReady(configService.get('PORT') || port);
  logApplicationDetails(configService);
});
