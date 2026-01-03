import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Department Stats API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testadmin';
  const testEmail = 'testadmin@example.com';

  async function createAuthenticatedUser() {
    await createTestUserWithPassword(testUsername, testEmail, testPassword);

    const loginResponse = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: testPassword,
    });

    return loginResponse.headers['set-cookie'];
  }

  async function createTestDepartment(slug: string = 'tischtennis') {
    return prisma.department.create({
      data: {
        name: `Department ${slug}`,
        slug,
        shortDescription: 'Test department',
        longDescription: 'This is a test department',
      },
    });
  }

  describe('POST /api/departments/:slug/stats', () => {
    it('should create a stat with authentication', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .set('Cookie', cookies)
        .send({
          label: 'Aktive Spieler',
          value: '45',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        label: 'Aktive Spieler',
        value: '45',
        sort: 0,
      });
      expect(response.body).toHaveProperty('id');
    });

    it('should create a stat with custom sort', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .set('Cookie', cookies)
        .send({
          label: 'Mannschaften',
          value: '3',
          sort: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body.sort).toBe(5);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .send({
          label: 'Test',
          value: '10',
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent department', async () => {
      const cookies = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/departments/non-existent/stats')
        .set('Cookie', cookies)
        .send({
          label: 'Test',
          value: '10',
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for missing label', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .set('Cookie', cookies)
        .send({
          value: '10',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing value', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .set('Cookie', cookies)
        .send({
          label: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative sort', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/stats`)
        .set('Cookie', cookies)
        .send({
          label: 'Test',
          value: '10',
          sort: -1,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/departments/:slug/stats/:id', () => {
    it('should update a stat', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'Original',
          value: '10',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/stats/${stat.id}`)
        .set('Cookie', cookies)
        .send({
          label: 'Updated',
          value: '20',
        });

      expect(response.status).toBe(200);
      expect(response.body.label).toBe('Updated');
      expect(response.body.value).toBe('20');
    });

    it('should allow partial update', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'Original',
          value: '10',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/stats/${stat.id}`)
        .set('Cookie', cookies)
        .send({
          value: '99',
        });

      expect(response.status).toBe(200);
      expect(response.body.label).toBe('Original');
      expect(response.body.value).toBe('99');
    });

    it('should return 404 for stat from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department1.id,
          label: 'Test',
          value: '10',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department2.slug}/stats/${stat.id}`)
        .set('Cookie', cookies)
        .send({
          label: 'Updated',
        });

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'Test',
          value: '10',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/stats/${stat.id}`)
        .send({
          label: 'Updated',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/departments/:slug/stats/:id', () => {
    it('should delete a stat', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'To Delete',
          value: '10',
        },
      });

      const response = await request(app)
        .delete(`/api/departments/${department.slug}/stats/${stat.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);

      const deleted = await prisma.departmentStat.findUnique({
        where: { id: stat.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for stat from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department1.id,
          label: 'Test',
          value: '10',
        },
      });

      const response = await request(app)
        .delete(`/api/departments/${department2.slug}/stats/${stat.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();
      const stat = await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'Test',
          value: '10',
        },
      });

      const response = await request(app).delete(
        `/api/departments/${department.slug}/stats/${stat.id}`,
      );

      expect(response.status).toBe(401);
    });
  });
});
