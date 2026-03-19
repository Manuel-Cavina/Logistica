import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
  console.log(`API is running on http://localhost:${process.env.PORT ?? 3001}`);
}

void bootstrap();
