import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import cookieParser from 'cookie-parser';

/**
 * Creates and initializes a NestJS test application with the same configuration as production
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same middleware as production
  app.use(cookieParser());

  // Apply the same global pipes as production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  return app;
}
