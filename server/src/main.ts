import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Allow frontend (Vite on 5173) to access backend (NestJS on 4000)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // ✅ All routes start with /api
  app.setGlobalPrefix('api');

  // ✅ Serve static files from /uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(4000);
  console.log('✅ Server running on http://localhost:4000');
  console.log('🖼️  Images available at http://localhost:4000/uploads/');
}

bootstrap();
