import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Settings API Integration Tests', () => {
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

  describe('GET /api/settings', () => {
    it('should return settings (creating default if none exist)', async () => {
      const response = await request(app).get('/api/settings');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('address');
      expect(response.body).toHaveProperty('memberCount');
      expect(response.body).toHaveProperty('contactEmail');
      expect(response.body).toHaveProperty('contactPhone');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return existing settings if they exist', async () => {
      await prisma.clubSettings.create({
        data: {
          id: 1,
          address: '123 Sport Street',
          memberCount: 500,
          contactEmail: 'info@club.de',
          contactPhone: '+49 123 456789',
        },
      });

      const response = await request(app).get('/api/settings');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        address: '123 Sport Street',
        memberCount: 500,
        contactEmail: 'info@club.de',
        contactPhone: '+49 123 456789',
      });
    });

    it('should be publicly accessible without authentication', async () => {
      const response = await request(app).get('/api/settings');

      expect(response.status).toBe(200);
      // Should not return 401
    });
  });

  describe('PATCH /api/settings', () => {
    it('should update settings with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const updateData = {
        address: 'Sportplatz 1, 12345 Berlin',
        memberCount: 1200,
        contactEmail: 'kontakt@vsg-kugelberg.de',
        contactPhone: '+49 30 123456',
      };

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateData);
      expect(response.body).toHaveProperty('updatedAt');

      // Verify in database
      const settings = await prisma.clubSettings.findUnique({
        where: { id: 1 },
      });
      expect(settings?.memberCount).toBe(1200);
    });

    it('should return 401 without authentication', async () => {
      const updateData = {
        address: 'Address 1',
      };

      const response = await request(app).patch('/api/settings').send(updateData);

      expect(response.status).toBe(401);
    });

    it('should allow partial updates', async () => {
      const { cookies } = await createAuthenticatedUser();

      // First set some initial data
      await prisma.clubSettings.create({
        data: {
          id: 1,
          address: 'Original Address',
          memberCount: 500,
        },
      });

      // Update only the member count
      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ memberCount: 750 });

      expect(response.status).toBe(200);
      expect(response.body.memberCount).toBe(750);
      expect(response.body.address).toBe('Original Address');
    });

    it('should allow setting fields to null', async () => {
      const { cookies } = await createAuthenticatedUser();

      // First set some initial data
      await prisma.clubSettings.create({
        data: {
          id: 1,
          address: 'Original Address',
        },
      });

      // Set address to null
      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ address: null });

      expect(response.status).toBe(200);
      expect(response.body.address).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should reject invalid email format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ contactEmail: 'not-an-email' });

      expect(response.status).toBe(400);
    });

    it('should accept valid email format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ contactEmail: 'valid@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.contactEmail).toBe('valid@example.com');
    });

    it('should reject member count below 1', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ memberCount: 0 });

      expect(response.status).toBe(400);
    });

    it('should reject member count above 100000', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ memberCount: 100001 });

      expect(response.status).toBe(400);
    });

    it('should accept member count at boundaries', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Test minimum boundary
      let response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ memberCount: 1 });

      expect(response.status).toBe(200);
      expect(response.body.memberCount).toBe(1);

      // Test maximum boundary
      response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ memberCount: 100000 });

      expect(response.status).toBe(200);
      expect(response.body.memberCount).toBe(100000);
    });

    it('should reject address longer than 500 characters', async () => {
      const { cookies } = await createAuthenticatedUser();
      const longAddress = 'a'.repeat(501);

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ address: longAddress });

      expect(response.status).toBe(400);
    });

    it('should accept address at maximum length', async () => {
      const { cookies } = await createAuthenticatedUser();
      const maxAddress = 'a'.repeat(500);

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ address: maxAddress });

      expect(response.status).toBe(200);
      expect(response.body.address).toBe(maxAddress);
    });

    it('should reject phone number longer than 30 characters', async () => {
      const { cookies } = await createAuthenticatedUser();
      const longPhone = '1'.repeat(31);

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ contactPhone: longPhone });

      expect(response.status).toBe(400);
    });

    it('should accept phone number at maximum length', async () => {
      const { cookies } = await createAuthenticatedUser();
      const maxPhone = '+49 30 1234567890123456789';

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ contactPhone: maxPhone });

      expect(response.status).toBe(200);
      expect(response.body.contactPhone).toBe(maxPhone);
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating all fields at once', async () => {
      const { cookies } = await createAuthenticatedUser();

      const fullUpdate = {
        address: 'Hauptstraße 42, 10115 Berlin',
        memberCount: 850,
        contactEmail: 'info@sportverein.de',
        contactPhone: '+49 30 9876543',
      };

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send(fullUpdate);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(fullUpdate);
    });

    it('should trim whitespace from string fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({
        address: '  Trimmed Address  ',
        contactEmail: '  email@test.com  ',
        contactPhone: '  +49 123  ',
      });

      expect(response.status).toBe(200);
      expect(response.body.address).toBe('Trimmed Address');
      expect(response.body.contactEmail).toBe('email@test.com');
      expect(response.body.contactPhone).toBe('+49 123');
    });

    it('should create settings if they do not exist during update', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Ensure no settings exist
      await prisma.clubSettings.deleteMany();

      const response = await request(app).patch('/api/settings').set('Cookie', cookies).send({ address: 'Address 1' });

      expect(response.status).toBe(200);
      expect(response.body.address).toBe('Address 1');

      // Verify created in database
      const settings = await prisma.clubSettings.findUnique({
        where: { id: 1 },
      });
      expect(settings).toBeTruthy();
      expect(settings?.address).toBe('Address 1');
    });
  });
});
