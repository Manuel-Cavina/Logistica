import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

const DEFAULT_ALLOWED_CORS_ORIGINS = ['http://localhost:3000'];

function resolveAllowedCorsOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (!configuredOrigins || configuredOrigins.length === 0) {
    return DEFAULT_ALLOWED_CORS_ORIGINS;
  }

  return configuredOrigins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: resolveAllowedCorsOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`API is running on http://localhost:${process.env.PORT ?? 3001}`);
}

void bootstrap();
