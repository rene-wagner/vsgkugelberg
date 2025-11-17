import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';
import { createAuthenticatedUser } from '../helpers/auth-helper';
import { testTags } from '../fixtures/test-data';

describe('TagsController (e2e)', () => {
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

  describe('GET /tags', () => {
    type ResponseBody = {
      id: number;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
      posts?: any[];
    };

    it('should return all tags without authentication', async () => {
      await prisma.tag.create({ data: testTags.javascript });

      return request(app.getHttpServer() as http.Server)
        .get('/tags')
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody[];

          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /tags/:slug', () => {
    it('should return a tag by slug', async () => {
      await prisma.tag.create({ data: testTags.javascript });

      return request(app.getHttpServer() as http.Server)
        .get(`/tags/${testTags.javascript.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('slug', testTags.javascript.slug);
          expect(res.body).toHaveProperty('name', testTags.javascript.name);
        });
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/tags/non-existent')
        .expect(404);
    });
  });

  describe('POST /tags', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/tags')
        .send(testTags.javascript)
        .expect(401);
    });

    it('should create a tag when authenticated', async () => {
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/tags')
        .set('Cookie', cookie)
        .send(testTags.javascript)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('slug', testTags.javascript.slug);
        });
    });
  });

  describe('PATCH /tags/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.tag.create({ data: testTags.javascript });

      return request(app.getHttpServer() as http.Server)
        .patch(`/tags/${testTags.javascript.slug}`)
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should update a tag when authenticated', async () => {
      await prisma.tag.create({ data: testTags.javascript });
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .patch(`/tags/${testTags.javascript.slug}`)
        .set('Cookie', cookie)
        .send({ name: 'JavaScript Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'JavaScript Updated');
        });
    });
  });

  describe('DELETE /tags/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.tag.create({ data: testTags.javascript });

      return request(app.getHttpServer() as http.Server)
        .delete(`/tags/${testTags.javascript.slug}`)
        .expect(401);
    });

    it('should delete a tag when authenticated', async () => {
      const tag = await prisma.tag.create({ data: testTags.javascript });
      const { cookie } = await createAuthenticatedUser(app);

      await request(app.getHttpServer() as http.Server)
        .delete(`/tags/${testTags.javascript.slug}`)
        .set('Cookie', cookie)
        .expect(200);

      const deleted = await prisma.tag.findUnique({ where: { id: tag.id } });
      expect(deleted).toBeNull();
    });
  });
});
