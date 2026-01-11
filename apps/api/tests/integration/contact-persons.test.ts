import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Contact Persons API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testadmin';
  const testEmail = 'testadmin@example.com';

  // Helper to create authenticated request
  async function createAuthenticatedUser() {
    const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

    // Login to get JWT token
    const loginResponse = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: testPassword,
    });

    const cookies = loginResponse.headers['set-cookie'];
    return { user, cookies };
  }

  describe('GET /api/contact-persons', () => {
    it('should return all contact persons', async () => {
      await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      await prisma.contactPerson.create({
        data: {
          firstName: 'Anna',
          lastName: 'Schmidt',
          type: 'Schatzmeister',
          email: 'anna@example.com',
          phone: '+49 987 654321',
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('firstName');
      expect(response.body.data[0]).toHaveProperty('lastName');
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('phone');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
      expect(response.body.meta).toMatchObject({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return contact persons ordered by lastName alphabetically', async () => {
      await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Zimmermann',
          type: 'Trainer',
          email: 'max.z@example.com',
          phone: '+49 123 456789',
        },
      });

      await prisma.contactPerson.create({
        data: {
          firstName: 'Anna',
          lastName: 'Albrecht',
          type: 'Schriftführer',
          email: 'anna.a@example.com',
          phone: '+49 987 654321',
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body.data[0].lastName).toBe('Albrecht');
      expect(response.body.data[1].lastName).toBe('Zimmermann');
    });

    it('should return empty data when no contact persons exist', async () => {
      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should support pagination', async () => {
      // Create 15 contact persons
      for (let i = 1; i <= 15; i++) {
        await prisma.contactPerson.create({
          data: {
            firstName: 'First',
            lastName: `Last ${i.toString().padStart(2, '0')}`,
            type: 'Trainer',
            email: `test${i}@example.com`,
            phone: `+49 123 ${i}`,
          },
        });
      }

      // Page 1
      let response = await request(app).get('/api/contact-persons?page=1&limit=10');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });

      // Page 2
      response = await request(app).get('/api/contact-persons?page=2&limit=10');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
    });
  });

  describe('GET /api/contact-persons/:id', () => {
    it('should return a single contact person by ID', async () => {
      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          address: 'Musterstraße 1, 12345 Musterstadt',
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).get(`/api/contact-persons/${contactPerson.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        address: 'Musterstraße 1, 12345 Musterstadt',
        phone: '+49 123 456789',
      });
    });

    it('should return 404 for non-existent contact person', async () => {
      const response = await request(app).get('/api/contact-persons/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/contact-persons/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('POST /api/contact-persons', () => {
    it('should create a contact person with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        address: 'Musterstraße 1, 12345 Musterstadt',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        address: 'Musterstraße 1, 12345 Musterstadt',
        phone: '+49 123 456789',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Verify in database
      const contactPerson = await prisma.contactPerson.findUnique({
        where: { id: response.body.id },
      });
      expect(contactPerson).toBeTruthy();
    });

    it('should create a contact person with only required fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Anna',
        lastName: 'Schmidt',
        type: 'Schatzmeister',
        email: 'anna.schmidt@example.com',
        phone: '+49 987 654321',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('anna.schmidt@example.com');
      expect(response.body.address).toBeNull();
    });

    it('should return 400 for missing email', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').send(newContactPerson);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing firstName', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing lastName', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing type', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing phone', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for firstName too short (less than 2 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'M',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'invalid-email',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/contact-persons/:id', () => {
    it('should update contact person with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Maximilian');
      expect(response.body.lastName).toBe('Mustermann');
    });

    it('should update multiple fields at once', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'Maximilian',
        lastName: 'Schmidt',
        type: 'Schatzmeister',
        email: 'max@newdomain.com',
        address: 'Neue Straße 5, 54321 Neustadt',
        phone: '+49 999 888777',
      };

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        firstName: 'Maximilian',
        lastName: 'Schmidt',
        type: 'Schatzmeister',
        email: 'max@newdomain.com',
        address: 'Neue Straße 5, 54321 Neustadt',
        phone: '+49 999 888777',
      });
    });

    it('should return 401 without authentication', async () => {
      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).send(update);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent contact person', async () => {
      const { cookies } = await createAuthenticatedUser();

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app).patch('/api/contact-persons/99999').set('Cookie', cookies).send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should allow partial updates', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const update = {
        phone: '+49 999 888777',
      };

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Max');
      expect(response.body.email).toBe('max@example.com');
      expect(response.body.phone).toBe('+49 999 888777');
    });

    it('should return 400 for validation errors on update', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'M', // Too short
      };

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/contact-persons/:id', () => {
    it('should delete a contact person with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).delete(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: contactPerson.id,
        firstName: 'Max',
        lastName: 'Mustermann',
      });

      // Verify deletion in database
      const deletedContactPerson = await prisma.contactPerson.findUnique({
        where: { id: contactPerson.id },
      });
      expect(deletedContactPerson).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).delete(`/api/contact-persons/${contactPerson.id}`);

      expect(response.status).toBe(401);

      // Verify contact person still exists
      const existingContactPerson = await prisma.contactPerson.findUnique({
        where: { id: contactPerson.id },
      });
      expect(existingContactPerson).toBeTruthy();
    });

    it('should return 404 for non-existent contact person', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).delete('/api/contact-persons/99999').set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).delete('/api/contact-persons/invalid').set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Profile Image Support', () => {
    // Helper to create a valid image media record
    async function createImageMedia(mimetype = 'image/jpeg') {
      return prisma.media.create({
        data: {
          filename: `test-image-${Date.now()}.jpg`,
          originalName: 'profile.jpg',
          path: '/uploads/test-image.jpg',
          mimetype,
          size: 1024,
          type: 'IMAGE',
        },
      });
    }

    it('should return profileImage field in GET /api/contact-persons', async () => {
      const media = await createImageMedia();
      await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media.id,
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('profileImage');
      expect(response.body.data[0].profileImage).toMatchObject({
        id: media.id,
        filename: media.filename,
        mimetype: 'image/jpeg',
      });
    });

    it('should return profileImage as null when not set', async () => {
      await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('profileImage');
      expect(response.body.data[0].profileImage).toBeNull();
    });

    it('should return profileImage in GET /api/contact-persons/:id', async () => {
      const media = await createImageMedia();
      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media.id,
        },
      });

      const response = await request(app).get(`/api/contact-persons/${contactPerson.id}`);

      expect(response.status).toBe(200);
      expect(response.body.profileImage).toMatchObject({
        id: media.id,
        filename: media.filename,
      });
    });

    it('should create contact person with profileImageId', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media = await createImageMedia();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
        profileImageId: media.id,
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.profileImageId).toBe(media.id);
      expect(response.body.profileImage).toMatchObject({
        id: media.id,
        filename: media.filename,
      });
    });

    it('should return 404 when creating with non-existent profileImageId', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
        profileImageId: 99999,
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Media');
    });

    it('should return 400 when creating with non-image media (SVG)', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media = await createImageMedia('image/svg+xml');

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
        profileImageId: media.id,
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('JPEG, PNG, or WebP');
    });

    it('should allow JPEG, PNG, and WebP for profile images', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Test JPEG
      const jpegMedia = await createImageMedia('image/jpeg');
      const response1 = await request(app).post('/api/contact-persons').set('Cookie', cookies).send({
        firstName: 'Test',
        lastName: 'JPEG',
        type: 'Tester',
        email: 'test.jpeg@example.com',
        phone: '+49 111 111111',
        profileImageId: jpegMedia.id,
      });
      expect(response1.status).toBe(201);

      // Test PNG
      const pngMedia = await createImageMedia('image/png');
      const response2 = await request(app).post('/api/contact-persons').set('Cookie', cookies).send({
        firstName: 'Test',
        lastName: 'PNG',
        type: 'Tester',
        email: 'test.png@example.com',
        phone: '+49 222 222222',
        profileImageId: pngMedia.id,
      });
      expect(response2.status).toBe(201);

      // Test WebP
      const webpMedia = await createImageMedia('image/webp');
      const response3 = await request(app).post('/api/contact-persons').set('Cookie', cookies).send({
        firstName: 'Test',
        lastName: 'WebP',
        type: 'Tester',
        email: 'test.webp@example.com',
        phone: '+49 333 333333',
        profileImageId: webpMedia.id,
      });
      expect(response3.status).toBe(201);
    });

    it('should update contact person to set profileImageId', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media = await createImageMedia();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send({ profileImageId: media.id });

      expect(response.status).toBe(200);
      expect(response.body.profileImageId).toBe(media.id);
      expect(response.body.profileImage).toMatchObject({
        id: media.id,
      });
    });

    it('should update contact person to change profileImageId', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media1 = await createImageMedia();
      const media2 = await createImageMedia();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media1.id,
        },
      });

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies)
        .send({ profileImageId: media2.id });

      expect(response.status).toBe(200);
      expect(response.body.profileImageId).toBe(media2.id);

      // Verify old media still exists (not deleted)
      const oldMedia = await prisma.media.findUnique({
        where: { id: media1.id },
      });
      expect(oldMedia).toBeTruthy();
    });

    it('should update contact person to remove profileImageId by setting to null', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media = await createImageMedia();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media.id,
        },
      });

      const response = await request(app).patch(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies).send({ profileImageId: null });

      expect(response.status).toBe(200);
      expect(response.body.profileImageId).toBeNull();
      expect(response.body.profileImage).toBeNull();

      // Verify media still exists (not deleted)
      const existingMedia = await prisma.media.findUnique({
        where: { id: media.id },
      });
      expect(existingMedia).toBeTruthy();
    });

    it('should NOT delete media when contact person is deleted', async () => {
      const { cookies } = await createAuthenticatedUser();
      const media = await createImageMedia();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media.id,
        },
      });

      const response = await request(app).delete(`/api/contact-persons/${contactPerson.id}`).set('Cookie', cookies);

      expect(response.status).toBe(200);

      // Verify media still exists
      const existingMedia = await prisma.media.findUnique({
        where: { id: media.id },
      });
      expect(existingMedia).toBeTruthy();
    });

    it('should set profileImageId to NULL when media is deleted', async () => {
      const media = await createImageMedia();

      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Mustermann',
          type: 'Vorstandsvorsitzender',
          email: 'max@example.com',
          phone: '+49 123 456789',
          profileImageId: media.id,
        },
      });

      // Delete the media directly
      await prisma.media.delete({
        where: { id: media.id },
      });

      // Verify contact person still exists but profileImageId is null
      const updatedContactPerson = await prisma.contactPerson.findUnique({
        where: { id: contactPerson.id },
      });
      expect(updatedContactPerson).toBeTruthy();
      expect(updatedContactPerson?.profileImageId).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in names', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Müller',
        lastName: 'Bäcker',
        type: 'Geschäftsführer',
        email: 'mueller.baecker@example.com',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe('Müller');
      expect(response.body.lastName).toBe('Bäcker');
      expect(response.body.type).toBe('Geschäftsführer');
    });

    it('should trim whitespace from fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: '  Max  ',
        lastName: '  Mustermann  ',
        type: '  Vorstandsvorsitzender  ',
        email: '  max@example.com  ',
        phone: '+49 123 456789',
      };

      const response = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe('Max');
      expect(response.body.lastName).toBe('Mustermann');
      expect(response.body.type).toBe('Vorstandsvorsitzender');
      expect(response.body.email).toBe('max@example.com');
    });

    it('should allow multiple contact persons with the same type', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson1 = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Trainer',
        email: 'max.trainer@example.com',
        phone: '+49 123 456789',
      };

      const contactPerson2 = {
        firstName: 'Anna',
        lastName: 'Schmidt',
        type: 'Trainer',
        email: 'anna.trainer@example.com',
        phone: '+49 987 654321',
      };

      const response1 = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(contactPerson1);

      const response2 = await request(app).post('/api/contact-persons').set('Cookie', cookies).send(contactPerson2);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      const allContactPersons = await prisma.contactPerson.findMany({
        where: { type: 'Trainer' },
      });
      expect(allContactPersons).toHaveLength(2);
    });
  });
});
