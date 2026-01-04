import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Department Trainers API Integration Tests', () => {
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

  async function createTestContactPerson(email: string = 'trainer@test.com') {
    return prisma.contactPerson.create({
      data: {
        firstName: 'Michael',
        lastName: 'Weber',
        type: 'Trainer',
        email,
        phone: '+49 123 456789',
      },
    });
  }

  describe('POST /api/departments/:slug/trainers', () => {
    it('should create a trainer association', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Abteilungsleiter & Cheftrainer',
          licenses: [{ name: 'DTTB C-Lizenz', variant: 'gold' }],
          experience: '25 Jahre Spielerfahrung',
          quote: 'Tischtennis ist mehr als nur ein Sport.',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        role: 'Abteilungsleiter & Cheftrainer',
        experience: '25 Jahre Spielerfahrung',
        quote: 'Tischtennis ist mehr als nur ein Sport.',
        sort: 0,
      });
      expect(response.body.licenses).toEqual([
        { name: 'DTTB C-Lizenz', variant: 'gold' },
      ]);
      expect(response.body.contactPerson).toMatchObject({
        firstName: 'Michael',
        lastName: 'Weber',
      });
    });

    it('should create a trainer with multiple licenses', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Jugendtrainerin',
          licenses: [
            { name: 'DTTB D-Lizenz', variant: 'gold' },
            { name: 'Jugendwart', variant: 'blue' },
          ],
          experience: 'Spezialisiert auf Jugendtraining',
          quote: 'Bei mir lernen die Kinder spielerisch.',
        });

      expect(response.status).toBe(201);
      expect(response.body.licenses).toHaveLength(2);
    });

    it('should create a trainer without quote (optional)', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [{ name: 'C-Lizenz', variant: 'gold' }],
          experience: '10 Jahre Erfahrung',
        });

      expect(response.status).toBe(201);
      expect(response.body.quote).toBeNull();
    });

    it('should create a trainer with empty quote', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [{ name: 'C-Lizenz', variant: 'gold' }],
          experience: '10 Jahre Erfahrung',
          quote: '',
        });

      expect(response.status).toBe(201);
      expect(response.body.quote).toBe('');
    });

    it('should return 409 for duplicate trainer association', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      // Create first trainer
      await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'First Role',
          licenses: [],
          experience: 'Some experience',
          quote: 'Some quote',
        });

      // Try to create duplicate
      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Second Role',
          licenses: [],
          experience: 'Other experience',
          quote: 'Other quote',
        });

      expect(response.status).toBe(409);
    });

    it('should return 404 for non-existent contact person', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: 99999,
          role: 'Trainer',
          licenses: [],
          experience: 'Some experience',
          quote: 'Some quote',
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid license variant', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [{ name: 'Test License', variant: 'invalid' }],
          experience: 'Some experience',
          quote: 'Some quote',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for too many licenses', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const licenses = Array.from({ length: 11 }, (_, i) => ({
        name: `License ${i}`,
        variant: 'gold' as const,
      }));

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .set('Cookie', cookies)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses,
          experience: 'Some experience',
          quote: 'Some quote',
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/trainers`)
        .send({
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [],
          experience: 'Some experience',
          quote: 'Some quote',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/departments/:slug/trainers/:id', () => {
    it('should update trainer details', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();
      const trainer = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson.id,
          role: 'Original Role',
          licenses: [],
          experience: 'Original experience',
          quote: 'Original quote',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/trainers/${trainer.id}`)
        .set('Cookie', cookies)
        .send({
          role: 'Updated Role',
          licenses: [{ name: 'New License', variant: 'blue' }],
        });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Updated Role');
      expect(response.body.licenses).toEqual([
        { name: 'New License', variant: 'blue' },
      ]);
      expect(response.body.experience).toBe('Original experience');
    });

    it('should return 404 for trainer from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');
      const contactPerson = await createTestContactPerson();
      const trainer = await prisma.departmentTrainer.create({
        data: {
          departmentId: department1.id,
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department2.slug}/trainers/${trainer.id}`)
        .set('Cookie', cookies)
        .send({ role: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/departments/:slug/trainers/:id', () => {
    it('should delete trainer association but preserve contact person', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();
      const trainer = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson.id,
          role: 'To Delete',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });

      const response = await request(app)
        .delete(`/api/departments/${department.slug}/trainers/${trainer.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);

      // Trainer should be deleted
      const deletedTrainer = await prisma.departmentTrainer.findUnique({
        where: { id: trainer.id },
      });
      expect(deletedTrainer).toBeNull();

      // Contact person should still exist
      const existingContactPerson = await prisma.contactPerson.findUnique({
        where: { id: contactPerson.id },
      });
      expect(existingContactPerson).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();
      const trainer = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });

      const response = await request(app).delete(
        `/api/departments/${department.slug}/trainers/${trainer.id}`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/departments/:slug/trainers/reorder', () => {
    it('should reorder trainers successfully', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson1 = await createTestContactPerson('person1');
      const contactPerson2 = await createTestContactPerson('person2');

      const trainer1 = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson1.id,
          role: 'First Trainer',
          licenses: [],
          experience: 'Experience 1',
          quote: 'Quote 1',
          sort: 0,
        },
      });
      const trainer2 = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson2.id,
          role: 'Second Trainer',
          licenses: [],
          experience: 'Experience 2',
          quote: 'Quote 2',
          sort: 1,
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/trainers/reorder`)
        .set('Cookie', cookies)
        .send({ ids: [trainer2.id, trainer1.id] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(trainer2.id);
      expect(response.body[0].sort).toBe(0);
      expect(response.body[0].contactPerson).toBeDefined();
      expect(response.body[1].id).toBe(trainer1.id);
      expect(response.body[1].sort).toBe(1);
    });

    it('should return 404 for trainer from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');
      const contactPerson1 = await createTestContactPerson('person1');
      const contactPerson2 = await createTestContactPerson('person2');

      const trainer1 = await prisma.departmentTrainer.create({
        data: {
          departmentId: department1.id,
          contactPersonId: contactPerson1.id,
          role: 'Trainer 1',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });
      const trainer2 = await prisma.departmentTrainer.create({
        data: {
          departmentId: department2.id,
          contactPersonId: contactPerson2.id,
          role: 'Trainer 2',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department1.slug}/trainers/reorder`)
        .set('Cookie', cookies)
        .send({ ids: [trainer1.id, trainer2.id] });

      expect(response.status).toBe(404);
    });

    it('should return 400 for duplicate ids', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const contactPerson = await createTestContactPerson();

      const trainer = await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson.id,
          role: 'Trainer',
          licenses: [],
          experience: 'Experience',
          quote: 'Quote',
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/trainers/reorder`)
        .set('Cookie', cookies)
        .send({ ids: [trainer.id, trainer.id] });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/trainers/reorder`)
        .send({ ids: [1, 2] });

      expect(response.status).toBe(401);
    });
  });
});
