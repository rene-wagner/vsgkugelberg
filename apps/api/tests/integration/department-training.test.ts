import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Department Training API Integration Tests', () => {
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
      },
    });
  }

  describe('Training Groups', () => {
    describe('POST /api/departments/:slug/training-groups', () => {
      it('should create a training group', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .set('Cookie', cookies)
          .send({
            name: 'Kinder & Jugend',
            ageRange: '6 - 17 Jahre',
            icon: 'youth',
            variant: 'primary',
          });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          name: 'Kinder & Jugend',
          ageRange: '6 - 17 Jahre',
          icon: 'youth',
          variant: 'primary',
          sort: 0,
        });
        expect(response.body.sessions).toEqual([]);
      });

      it('should create a training group without ageRange (optional)', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .set('Cookie', cookies)
          .send({
            name: 'Erwachsene',
            icon: 'adults',
            variant: 'secondary',
          });

        expect(response.status).toBe(201);
        expect(response.body.ageRange).toBeNull();
      });

      it('should create a training group with empty ageRange', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .set('Cookie', cookies)
          .send({
            name: 'Erwachsene',
            ageRange: '',
            icon: 'adults',
            variant: 'secondary',
          });

        expect(response.status).toBe(201);
        expect(response.body.ageRange).toBe('');
      });

      it('should return 400 for invalid icon value', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .set('Cookie', cookies)
          .send({
            name: 'Test',
            ageRange: '6 - 17',
            icon: 'invalid',
            variant: 'primary',
          });

        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid variant value', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .set('Cookie', cookies)
          .send({
            name: 'Test',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'invalid',
          });

        expect(response.status).toBe(400);
      });

      it('should return 401 without authentication', async () => {
        const department = await createTestDepartment();

        const response = await request(app)
          .post(`/api/departments/${department.slug}/training-groups`)
          .send({
            name: 'Test',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          });

        expect(response.status).toBe(401);
      });
    });

    describe('PATCH /api/departments/:slug/training-groups/:groupId', () => {
      it('should update a training group', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Original',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department.slug}/training-groups/${group.id}`,
          )
          .set('Cookie', cookies)
          .send({
            name: 'Updated',
            variant: 'secondary',
          });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated');
        expect(response.body.variant).toBe('secondary');
      });

      it('should return 404 for group from different department', async () => {
        const cookies = await createAuthenticatedUser();
        const department1 = await createTestDepartment('dept-1');
        const department2 = await createTestDepartment('dept-2');
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department1.id,
            name: 'Test',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department2.slug}/training-groups/${group.id}`,
          )
          .set('Cookie', cookies)
          .send({ name: 'Updated' });

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/departments/:slug/training-groups/:groupId', () => {
      it('should delete a training group and cascade to sessions', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'To Delete',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });
        await prisma.departmentTrainingSession.create({
          data: {
            trainingGroupId: group.id,
            day: 'Montag',
            time: '16:00 - 17:30',
          },
        });

        const response = await request(app)
          .delete(
            `/api/departments/${department.slug}/training-groups/${group.id}`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(200);

        const deleted = await prisma.departmentTrainingGroup.findUnique({
          where: { id: group.id },
        });
        expect(deleted).toBeNull();

        const sessions = await prisma.departmentTrainingSession.findMany({
          where: { trainingGroupId: group.id },
        });
        expect(sessions).toHaveLength(0);
      });
    });
  });

  describe('Training Sessions', () => {
    describe('POST /api/departments/:slug/training-groups/:groupId/sessions', () => {
      it('should create a session', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const response = await request(app)
          .post(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions`,
          )
          .set('Cookie', cookies)
          .send({
            day: 'Montag',
            time: '16:00 - 17:30',
          });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          day: 'Montag',
          time: '16:00 - 17:30',
          sort: 0,
        });
      });

      it('should return 404 for non-existent group', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();

        const response = await request(app)
          .post(
            `/api/departments/${department.slug}/training-groups/99999/sessions`,
          )
          .set('Cookie', cookies)
          .send({
            day: 'Montag',
            time: '16:00 - 17:30',
          });

        expect(response.status).toBe(404);
      });

      it('should return 400 for missing day', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const response = await request(app)
          .post(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions`,
          )
          .set('Cookie', cookies)
          .send({
            time: '16:00 - 17:30',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('PATCH /api/departments/:slug/training-groups/:groupId/sessions/:id', () => {
      it('should update a session', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });
        const session = await prisma.departmentTrainingSession.create({
          data: {
            trainingGroupId: group.id,
            day: 'Montag',
            time: '16:00 - 17:30',
          },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions/${session.id}`,
          )
          .set('Cookie', cookies)
          .send({
            day: 'Dienstag',
            time: '18:00 - 19:30',
          });

        expect(response.status).toBe(200);
        expect(response.body.day).toBe('Dienstag');
        expect(response.body.time).toBe('18:00 - 19:30');
      });
    });

    describe('DELETE /api/departments/:slug/training-groups/:groupId/sessions/:id', () => {
      it('should delete a session', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });
        const session = await prisma.departmentTrainingSession.create({
          data: {
            trainingGroupId: group.id,
            day: 'Montag',
            time: '16:00 - 17:30',
          },
        });

        const response = await request(app)
          .delete(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions/${session.id}`,
          )
          .set('Cookie', cookies);

        expect(response.status).toBe(200);

        const deleted = await prisma.departmentTrainingSession.findUnique({
          where: { id: session.id },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('PATCH /api/departments/:slug/training-groups/:groupId/sessions/reorder', () => {
      it('should reorder sessions within a group', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const session1 = await prisma.departmentTrainingSession.create({
          data: {
            trainingGroupId: group.id,
            day: 'Montag',
            time: '16:00',
            sort: 0,
          },
        });
        const session2 = await prisma.departmentTrainingSession.create({
          data: {
            trainingGroupId: group.id,
            day: 'Dienstag',
            time: '17:00',
            sort: 1,
          },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions/reorder`,
          )
          .set('Cookie', cookies)
          .send({ ids: [session2.id, session1.id] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].id).toBe(session2.id);
        expect(response.body[0].sort).toBe(0);
        expect(response.body[1].id).toBe(session1.id);
        expect(response.body[1].sort).toBe(1);
      });

      it('should return 404 for session from different group', async () => {
        const cookies = await createAuthenticatedUser();
        const department = await createTestDepartment();
        const group1 = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Group 1',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });
        const group2 = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Group 2',
            ageRange: '18+',
            icon: 'adults',
            variant: 'secondary',
          },
        });

        const session1 = await prisma.departmentTrainingSession.create({
          data: { trainingGroupId: group1.id, day: 'Montag', time: '16:00' },
        });
        const session2 = await prisma.departmentTrainingSession.create({
          data: { trainingGroupId: group2.id, day: 'Dienstag', time: '17:00' },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department.slug}/training-groups/${group1.id}/sessions/reorder`,
          )
          .set('Cookie', cookies)
          .send({ ids: [session1.id, session2.id] });

        expect(response.status).toBe(404);
      });

      it('should return 401 without authentication', async () => {
        const department = await createTestDepartment();
        const group = await prisma.departmentTrainingGroup.create({
          data: {
            departmentId: department.id,
            name: 'Test Group',
            ageRange: '6 - 17',
            icon: 'youth',
            variant: 'primary',
          },
        });

        const response = await request(app)
          .patch(
            `/api/departments/${department.slug}/training-groups/${group.id}/sessions/reorder`,
          )
          .send({ ids: [1, 2] });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /api/departments/:slug/training-groups/reorder', () => {
    it('should reorder training groups', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const group1 = await prisma.departmentTrainingGroup.create({
        data: {
          departmentId: department.id,
          name: 'First',
          ageRange: '6 - 17',
          icon: 'youth',
          variant: 'primary',
          sort: 0,
        },
      });
      const group2 = await prisma.departmentTrainingGroup.create({
        data: {
          departmentId: department.id,
          name: 'Second',
          ageRange: '18+',
          icon: 'adults',
          variant: 'secondary',
          sort: 1,
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/training-groups/reorder`)
        .set('Cookie', cookies)
        .send({ ids: [group2.id, group1.id] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(group2.id);
      expect(response.body[0].sort).toBe(0);
      expect(response.body[1].id).toBe(group1.id);
      expect(response.body[1].sort).toBe(1);
    });

    it('should return 404 for group from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');

      const group1 = await prisma.departmentTrainingGroup.create({
        data: {
          departmentId: department1.id,
          name: 'Group1',
          ageRange: '6 - 17',
          icon: 'youth',
          variant: 'primary',
        },
      });
      const group2 = await prisma.departmentTrainingGroup.create({
        data: {
          departmentId: department2.id,
          name: 'Group2',
          ageRange: '18+',
          icon: 'adults',
          variant: 'secondary',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department1.slug}/training-groups/reorder`)
        .set('Cookie', cookies)
        .send({ ids: [group1.id, group2.id] });

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/training-groups/reorder`)
        .send({ ids: [1, 2] });

      expect(response.status).toBe(401);
    });
  });
});
