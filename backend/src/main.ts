import { type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { ADMIN_KEY_HEADER } from './common/admin-key.guard.js';
import { SESSION_COOKIE } from './auth/session-cookie.js';
import { ADMIN_SECURITY } from './common/admin.decorator.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';
import { AppConfigService } from './config/app-config.service.js';

const API_PREFIX = 'api';

function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Smetachi API')
      .setDescription('Renovation estimates, accounts and construction prices for Tashkent')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', in: 'header', name: ADMIN_KEY_HEADER }, ADMIN_SECURITY)
      .addCookieAuth(SESSION_COOKIE)
      .build(),
  );
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(AppConfigService);

  app.useLogger(app.get(Logger));
  app.set('trust proxy', 1);
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.corsOrigins, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();

  if (!config.isProduction) setupSwagger(app);

  await app.listen(config.port);
}

await bootstrap();
