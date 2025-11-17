import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';
import {
  createAuthenticatedUser,
  createTestUser,
} from '../helpers/auth-helper';

describe('UsersController', () => {
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

  describe('GET /users', () => {
    type ResponseBody = {
      id: number;
      username: string;
      email: string;
    };

    it('should return all users without authentication', async () => {
      await createTestUser(prisma, {
        username: 'user1',
        email: 'user1@example.com',
      });
      await createTestUser(prisma, {
        username: 'user2',
        email: 'user2@example.com',
      });

      return request(app.getHttpServer() as http.Server)
        .get('/users')
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody[];

          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
          expect(body[0]).not.toHaveProperty('password');
        });
    });
  });

  describe('GET /users/:id', () => {
    type ResponseBody = {
      id: number;
      username: string;
      email: string;
    };

    it('should return a user by ID without authentication', async () => {
      const user = await createTestUser(prisma);

      return request(app.getHttpServer() as http.Server)
        .get(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody;

          expect(body).toHaveProperty('id', user.id);
          expect(body).toHaveProperty('username', user.username);
          expect(body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/users/99999')
        .expect(404);
    });
  });

  describe('POST /users', () => {
    type ResponseBody = {
      id: number;
      username: string;
      email: string;
    };

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/users')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should create a user when authenticated', async () => {
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/users')
        .set('Cookie', cookie)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ResponseBody;

          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('username', 'newuser');
          expect(body).toHaveProperty('email', 'newuser@example.com');
          expect(body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid email', async () => {
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/users')
        .set('Cookie', cookie)
        .send({
          username: 'newuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    type ResponseBody = {
      id: number;
      username: string;
      email: string;
    };

    it('should return 401 without authentication', async () => {
      const user = await createTestUser(prisma);

      return request(app.getHttpServer() as http.Server)
        .patch(`/users/${user.id}`)
        .send({ username: 'updated' })
        .expect(401);
    });

    it('should update a user when authenticated', async () => {
      const user = await createTestUser(prisma);
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .patch(`/users/${user.id}`)
        .set('Cookie', cookie)
        .send({ username: 'updateduser' })
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody;

          expect(body).toHaveProperty('id', user.id);
          expect(body).toHaveProperty('username', 'updateduser');
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 401 without authentication', async () => {
      const user = await createTestUser(prisma);

      return request(app.getHttpServer() as http.Server)
        .delete(`/users/${user.id}`)
        .expect(401);
    });

    it('should delete a user when authenticated', async () => {
      const user = await createTestUser(prisma);
      const { cookie } = await createAuthenticatedUser(app);

      await request(app.getHttpServer() as http.Server)
        .delete(`/users/${user.id}`)
        .set('Cookie', cookie)
        .expect(200);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });
  });
});
