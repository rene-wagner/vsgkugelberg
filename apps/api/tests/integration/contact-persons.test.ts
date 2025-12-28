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
    const user = await createTestUserWithPassword(
      testUsername,
      testEmail,
      testPassword,
    );

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
          phone: '+49 987 654321',
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('firstName');
      expect(response.body[0]).toHaveProperty('lastName');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('phone');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('should return contact persons ordered by lastName alphabetically', async () => {
      await prisma.contactPerson.create({
        data: {
          firstName: 'Max',
          lastName: 'Zimmermann',
          type: 'Trainer',
          phone: '+49 123 456789',
        },
      });

      await prisma.contactPerson.create({
        data: {
          firstName: 'Anna',
          lastName: 'Albrecht',
          type: 'Schriftführer',
          phone: '+49 987 654321',
        },
      });

      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body[0].lastName).toBe('Albrecht');
      expect(response.body[1].lastName).toBe('Zimmermann');
    });

    it('should return empty array when no contact persons exist', async () => {
      const response = await request(app).get('/api/contact-persons');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
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

      const response = await request(app).get(
        `/api/contact-persons/${contactPerson.id}`,
      );

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

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

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
        phone: '+49 987 654321',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.email).toBeNull();
      expect(response.body.address).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .send(newContactPerson);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing firstName', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing lastName', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        type: 'Vorstandsvorsitzender',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing type', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing phone', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(400);
    });

    it('should return 400 for firstName too short (less than 2 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'M',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

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

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

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
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies)
        .send(update);

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

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies)
        .send(update);

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
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .send(update);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent contact person', async () => {
      const { cookies } = await createAuthenticatedUser();

      const update = {
        firstName: 'Maximilian',
      };

      const response = await request(app)
        .patch('/api/contact-persons/99999')
        .set('Cookie', cookies)
        .send(update);

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

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies)
        .send(update);

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
          phone: '+49 123 456789',
        },
      });

      const update = {
        firstName: 'M', // Too short
      };

      const response = await request(app)
        .patch(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies)
        .send(update);

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
          phone: '+49 123 456789',
        },
      });

      const response = await request(app)
        .delete(`/api/contact-persons/${contactPerson.id}`)
        .set('Cookie', cookies);

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
          phone: '+49 123 456789',
        },
      });

      const response = await request(app).delete(
        `/api/contact-persons/${contactPerson.id}`,
      );

      expect(response.status).toBe(401);

      // Verify contact person still exists
      const existingContactPerson = await prisma.contactPerson.findUnique({
        where: { id: contactPerson.id },
      });
      expect(existingContactPerson).toBeTruthy();
    });

    it('should return 404 for non-existent contact person', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/contact-persons/99999')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/contact-persons/invalid')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in names', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newContactPerson = {
        firstName: 'Müller',
        lastName: 'Bäcker',
        type: 'Geschäftsführer',
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

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
        phone: '+49 123 456789',
      };

      const response = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(newContactPerson);

      expect(response.status).toBe(201);
      expect(response.body.firstName).toBe('Max');
      expect(response.body.lastName).toBe('Mustermann');
      expect(response.body.type).toBe('Vorstandsvorsitzender');
    });

    it('should allow multiple contact persons with the same type', async () => {
      const { cookies } = await createAuthenticatedUser();

      const contactPerson1 = {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Trainer',
        phone: '+49 123 456789',
      };

      const contactPerson2 = {
        firstName: 'Anna',
        lastName: 'Schmidt',
        type: 'Trainer',
        phone: '+49 987 654321',
      };

      const response1 = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(contactPerson1);

      const response2 = await request(app)
        .post('/api/contact-persons')
        .set('Cookie', cookies)
        .send(contactPerson2);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      const allContactPersons = await prisma.contactPerson.findMany({
        where: { type: 'Trainer' },
      });
      expect(allContactPersons).toHaveLength(2);
    });
  });
});
