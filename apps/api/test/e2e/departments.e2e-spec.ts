import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';
import { createAuthenticatedUser } from '../helpers/auth-helper';
import { testDepartments } from '../fixtures/test-data';

describe('DepartmentsController (e2e)', () => {
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

  describe('GET /departments', () => {
    type ResponseBody = {
      id: number;
      name: string;
      slug: string;
      shortDescription: string;
      longDescription: string;
      createdAt: string;
      updatedAt: string;
    };

    it('should return all departments without authentication', async () => {
      await prisma.department.create({ data: testDepartments.football });

      return request(app.getHttpServer() as http.Server)
        .get('/departments')
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody[];

          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /departments/:slug', () => {
    it('should return a department by slug', async () => {
      await prisma.department.create({ data: testDepartments.football });

      return request(app.getHttpServer() as http.Server)
        .get(`/departments/${testDepartments.football.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'slug',
            testDepartments.football.slug,
          );
          expect(res.body).toHaveProperty(
            'name',
            testDepartments.football.name,
          );
        });
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/departments/non-existent')
        .expect(404);
    });
  });

  describe('POST /departments', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/departments')
        .send(testDepartments.football)
        .expect(401);
    });

    it('should create a department when authenticated', async () => {
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/departments')
        .set('Cookie', cookie)
        .send(testDepartments.football)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty(
            'slug',
            testDepartments.football.slug,
          );
        });
    });
  });

  describe('PATCH /departments/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.department.create({ data: testDepartments.football });

      return request(app.getHttpServer() as http.Server)
        .patch(`/departments/${testDepartments.football.slug}`)
        .send({ shortDescription: 'Updated' })
        .expect(401);
    });

    it('should update a department when authenticated', async () => {
      await prisma.department.create({ data: testDepartments.football });
      const { cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .patch(`/departments/${testDepartments.football.slug}`)
        .set('Cookie', cookie)
        .send({ shortDescription: 'Updated description' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'shortDescription',
            'Updated description',
          );
        });
    });
  });

  describe('DELETE /departments/:slug', () => {
    it('should return 401 without authentication', async () => {
      await prisma.department.create({ data: testDepartments.football });

      return request(app.getHttpServer() as http.Server)
        .delete(`/departments/${testDepartments.football.slug}`)
        .expect(401);
    });

    it('should delete a department when authenticated', async () => {
      const dept = await prisma.department.create({
        data: testDepartments.football,
      });
      const { cookie } = await createAuthenticatedUser(app);

      await request(app.getHttpServer() as http.Server)
        .delete(`/departments/${testDepartments.football.slug}`)
        .set('Cookie', cookie)
        .expect(200);

      const deleted = await prisma.department.findUnique({
        where: { id: dept.id },
      });

      expect(deleted).toBeNull();
    });
  });
});
