import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';
import { createAuthenticatedUser } from '../helpers/auth-helper';
import { testCategories } from '../fixtures/test-data';

describe('CategoriesController (e2e)', () => {
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

  describe('GET /categories', () => {
    type ResponseBody = {
      id: number;
      name: string;
      slug: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      posts?: any[];
    };

    it('should return all categories without authentication', async () => {
      await prisma.category.create({ data: testCategories.technology });

      return request(app.getHttpServer() as http.Server)
        .get('/categories')
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody[];

          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /categories/:slug', () => {
    it('should return a category by slug', async () => {
      await prisma.category.create({ data: testCategories.technology });

      return request(app.getHttpServer() as http.Server)
        .get(`/categories/${testCategories.technology.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'slug',
            testCategories.technology.slug,
          );
          expect(res.body).toHaveProperty(
            'name',
            testCategories.technology.name,
          );
        });
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/categories/non-existent')
        .expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/categories')
        .send(testCategories.technology)
        .expect(401);
    });

    it('should create a category when authenticated', async () => {
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/categories')
        .set('Cookie', cookie)
        .send(testCategories.technology)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty(
            'slug',
            testCategories.technology.slug,
          );
        });
    });
  });

  describe('PATCH /categories/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.category.create({ data: testCategories.technology });

      return request(app.getHttpServer() as http.Server)
        .patch(`/categories/${testCategories.technology.slug}`)
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should update a category when authenticated', async () => {
      await prisma.category.create({ data: testCategories.technology });
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .patch(`/categories/${testCategories.technology.slug}`)
        .set('Cookie', cookie)
        .send({ description: 'Updated description' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('description', 'Updated description');
        });
    });
  });

  describe('DELETE /categories/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.category.create({ data: testCategories.technology });

      return request(app.getHttpServer() as http.Server)
        .delete(`/categories/${testCategories.technology.slug}`)
        .expect(401);
    });

    it('should delete a category when authenticated', async () => {
      const category = await prisma.category.create({
        data: testCategories.technology,
      });
      const { cookie } = await createAuthenticatedUser(app);

      await request(app.getHttpServer() as http.Server)
        .delete(`/categories/${testCategories.technology.slug}`)
        .set('Cookie', cookie)
        .expect(200);

      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
