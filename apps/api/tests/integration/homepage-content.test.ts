import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Homepage Content API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'homeadmin';
  const testEmail = 'homeadmin@example.com';

  async function createAuthenticatedUser() {
    await createTestUserWithPassword(testUsername, testEmail, testPassword);

    const loginResponse = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: testPassword,
    });

    const cookies = loginResponse.headers['set-cookie'];
    return { cookies };
  }

  beforeEach(async () => {
    await prisma.homepageContent.deleteMany();
    await prisma.homepageStat.deleteMany();

    await prisma.homepageContent.create({
      data: {
        id: 1,
        heroTag: 'Original tag',
        departmentsHeadline: 'ABTEILUNGEN',
        departmentsDescription: 'Depts desc',
        departmentsSubtitle: 'Depts subtitle',
        postsHeadline: 'NEWS',
        postsDescription: 'News desc',
        postsSubtitle: 'News subtitle',
        postsCount: 5,
        ctaHeadline: 'CTA HEADLINE',
        ctaDescription: 'CTA desc',
        stats: {
          create: [
            { label: 'Label 1', value: 'Value 1', sort: 2 },
            { label: 'Label 2', value: 'Value 2', sort: 0 },
            { label: 'Label 3', value: 'Value 3', sort: 1 },
          ],
        },
      },
    });
  });

  describe('GET /api/homepage-content', () => {
    it('should return homepage content', async () => {
      const response = await request(app).get('/api/homepage-content');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('heroTag', 'Original tag');
      expect(response.body).toHaveProperty('postsCount', 5);
    });

    it('should return stats ordered by sort', async () => {
      const response = await request(app).get('/api/homepage-content');

      expect(response.status).toBe(200);
      expect(response.body.stats).toHaveLength(3);
      expect(response.body.stats[0].label).toBe('Label 2');
      expect(response.body.stats[1].label).toBe('Label 3');
      expect(response.body.stats[2].label).toBe('Label 1');
    });

    it('should be publicly accessible', async () => {
      const response = await request(app).get('/api/homepage-content');
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/homepage-content', () => {
    it('should update homepage content with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const updateData = {
        heroTag: 'NEW TAG',
        postsCount: 10,
      };

      const response = await request(app).patch('/api/homepage-content').set('Cookie', cookies).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.heroTag).toBe('NEW TAG');
      expect(response.body.postsCount).toBe(10);

      const updated = await prisma.homepageContent.findUnique({
        where: { id: 1 },
      });
      expect(updated?.heroTag).toBe('NEW TAG');
      expect(updated?.postsCount).toBe(10);
    });

    it('should update stats and preserve order', async () => {
      const { cookies } = await createAuthenticatedUser();

      const updateData = {
        stats: [
          { label: 'New Label 1', value: 'New Value 1', sort: 2 },
          { label: 'New Label 2', value: 'New Value 2', sort: 0 },
          { label: 'New Label 3', value: 'New Value 3', sort: 1 },
        ],
      };

      const response = await request(app).patch('/api/homepage-content').set('Cookie', cookies).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.stats).toHaveLength(3);
      expect(response.body.stats[0].label).toBe('New Label 2');
      expect(response.body.stats[1].label).toBe('New Label 3');
      expect(response.body.stats[2].label).toBe('New Label 1');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).patch('/api/homepage-content').send({ heroTag: 'UNAUTHORIZED' });
      expect(response.status).toBe(401);
    });

    it('should validate postsCount is positive', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).patch('/api/homepage-content').set('Cookie', cookies).send({ postsCount: 0 });

      expect(response.status).toBe(400);
    });

    it('should preserve existing fields on partial update', async () => {
      const { cookies } = await createAuthenticatedUser();

      const initialData = {
        stats: [{ label: 'Initial Stat', value: '123', sort: 0 }],
      };

      await request(app).patch('/api/homepage-content').set('Cookie', cookies).send(initialData);

      const partialUpdate = {
        heroTag: 'PARTIAL UPDATE TAG',
      };

      const response = await request(app).patch('/api/homepage-content').set('Cookie', cookies).send(partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.heroTag).toBe('PARTIAL UPDATE TAG');
      expect(response.body.stats).toHaveLength(1);
      expect(response.body.stats[0].label).toBe('Initial Stat');
    });

    it('should create content if missing via upsert', async () => {
      const { cookies } = await createAuthenticatedUser();

      await prisma.homepageContent.deleteMany();
      await prisma.homepageStat.deleteMany();

      const updateData = {
        heroTag: 'Tag',
        departmentsHeadline: 'ABTEILUNGEN',
        departmentsDescription: 'Desc',
        departmentsSubtitle: 'Sub',
        postsHeadline: 'NEWS',
        postsDescription: 'News desc',
        postsSubtitle: 'News sub',
        postsCount: 5,
        ctaHeadline: 'CTA',
        ctaDescription: 'CTA desc',
      };

      const response = await request(app).patch('/api/homepage-content').set('Cookie', cookies).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.heroTag).toBe('Tag');

      const created = await prisma.homepageContent.findUnique({
        where: { id: 1 },
      });
      expect(created).not.toBeNull();
      expect(created?.heroTag).toBe('Tag');
    });
  });
});
