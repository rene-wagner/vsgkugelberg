import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function main() {
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable CORS with credentials support
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

main().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
