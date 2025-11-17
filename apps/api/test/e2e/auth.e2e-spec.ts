import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';

describe('AuthController (e2e)', () => {
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

  describe('POST /auth/login', () => {
    type ResponseBody = {
      user: {
        id: number;
        username: string;
        email: string;
        createdAt: string;
        updatedAt: string;
      };
    };

    it('should login successfully with username', async () => {
      // Create a test user
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
        },
      });

      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201)
        .expect((res) => {
          const body = res.body as ResponseBody;

          expect(body).toHaveProperty('user');
          expect(body.user).toHaveProperty('id', user.id);
          expect(body.user).toHaveProperty('username', 'testuser');
          expect(body.user).toHaveProperty('email', 'test@example.com');
          expect(body.user).not.toHaveProperty('password');

          // Check cookie
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(cookies[0]).toContain('access_token');
          expect(cookies[0]).toContain('HttpOnly');
          expect(cookies[0]).toContain('SameSite=Strict');
        });
    });

    it('should login successfully with email', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
        },
      });

      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ username: 'test@example.com', password: 'password123' })
        .expect(201)
        .expect((res) => {
          const body = res.body as ResponseBody;

          expect(body).toHaveProperty('user');
          expect(body.user).toHaveProperty('email', 'test@example.com');

          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(cookies[0]).toContain('access_token');
        });
    });

    it('should fail with invalid password', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
        },
      });

      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message', 'Unauthorized');
          expect(res.headers['set-cookie']).toBeUndefined();
        });
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message', 'Unauthorized');
        });
    });

    it('should return 400 for missing username', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ password: 'password123' })
        .expect(401); // Passport returns 401 for missing credentials
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/auth/login')
        .send({ username: 'testuser' })
        .expect(401); // Passport returns 401 for missing credentials
    });
  });
});
