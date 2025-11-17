import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status OK', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/health')
        .expect(200)
        .expect({ status: 'ok' });
    });

    it('should be publicly accessible without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });
});
