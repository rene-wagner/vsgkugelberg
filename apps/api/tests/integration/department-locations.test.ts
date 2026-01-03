import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Department Locations API Integration Tests', () => {
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

  describe('POST /api/departments/:slug/locations', () => {
    it('should create a location with amenities', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .set('Cookie', cookies)
        .send({
          name: 'Sporthalle Kugelberg',
          badge: 'HAUPTHALLE',
          badgeVariant: 'primary',
          street: 'Kugelbergstraße 15',
          city: '06667 Weißenfels',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [
            { text: '8 Tischtennisplatten' },
            { text: 'Umkleiden vorhanden' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Sporthalle Kugelberg',
        badge: 'HAUPTHALLE',
        badgeVariant: 'primary',
        street: 'Kugelbergstraße 15',
        city: '06667 Weißenfels',
        sort: 0,
      });
      expect(response.body.amenities).toHaveLength(2);
    });

    it('should create a location with empty amenities', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .set('Cookie', cookies)
        .send({
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'secondary',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [],
        });

      expect(response.status).toBe(201);
      expect(response.body.amenities).toEqual([]);
    });

    it('should return 400 for more than 3 amenities', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .set('Cookie', cookies)
        .send({
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'primary',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [
            { text: 'One' },
            { text: 'Two' },
            { text: 'Three' },
            { text: 'Four' },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid mapsUrl', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .set('Cookie', cookies)
        .send({
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'primary',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'not-a-url',
          amenities: [],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid badgeVariant', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .set('Cookie', cookies)
        .send({
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'invalid',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [],
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();

      const response = await request(app)
        .post(`/api/departments/${department.slug}/locations`)
        .send({
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'primary',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/departments/:slug/locations/:id', () => {
    it('should update a location', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const location = await prisma.departmentLocation.create({
        data: {
          departmentId: department.id,
          name: 'Original Hall',
          badge: 'ORIGINAL',
          badgeVariant: 'primary',
          street: 'Original Street',
          city: 'Original City',
          mapsUrl: 'https://maps.google.com/?q=original',
          amenities: [],
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department.slug}/locations/${location.id}`)
        .set('Cookie', cookies)
        .send({
          name: 'Updated Hall',
          amenities: [{ text: 'New amenity' }],
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Hall');
      expect(response.body.amenities).toEqual([{ text: 'New amenity' }]);
    });

    it('should return 404 for location from different department', async () => {
      const cookies = await createAuthenticatedUser();
      const department1 = await createTestDepartment('dept-1');
      const department2 = await createTestDepartment('dept-2');
      const location = await prisma.departmentLocation.create({
        data: {
          departmentId: department1.id,
          name: 'Test Hall',
          badge: 'TEST',
          badgeVariant: 'primary',
          street: 'Test Street',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [],
        },
      });

      const response = await request(app)
        .patch(`/api/departments/${department2.slug}/locations/${location.id}`)
        .set('Cookie', cookies)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/departments/:slug/locations/:id', () => {
    it('should delete a location', async () => {
      const cookies = await createAuthenticatedUser();
      const department = await createTestDepartment();
      const location = await prisma.departmentLocation.create({
        data: {
          departmentId: department.id,
          name: 'To Delete',
          badge: 'DELETE',
          badgeVariant: 'primary',
          street: 'Delete Street',
          city: 'Delete City',
          mapsUrl: 'https://maps.google.com/?q=delete',
          amenities: [],
        },
      });

      const response = await request(app)
        .delete(`/api/departments/${department.slug}/locations/${location.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);

      const deleted = await prisma.departmentLocation.findUnique({
        where: { id: location.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const department = await createTestDepartment();
      const location = await prisma.departmentLocation.create({
        data: {
          departmentId: department.id,
          name: 'Test',
          badge: 'TEST',
          badgeVariant: 'primary',
          street: 'Test Street',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [],
        },
      });

      const response = await request(app).delete(
        `/api/departments/${department.slug}/locations/${location.id}`,
      );

      expect(response.status).toBe(401);
    });
  });
});
