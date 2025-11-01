import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // ✅ Allow frontend (Vite on 5173) to access backend (NestJS on 4000)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // ✅ All routes start with /api (so your frontend hits /api/auth/login etc.)
  app.setGlobalPrefix('api');

  await app.listen(4000);
  console.log('✅ Server running on http://localhost:4000');
}
bootstrap();
