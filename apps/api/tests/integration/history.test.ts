import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('History API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'historyadmin';
  const testEmail = 'historyadmin@example.com';

  // Helper to create authenticated request
  async function createAuthenticatedUser() {
    await createTestUserWithPassword(testUsername, testEmail, testPassword);

    // Login to get JWT token
    const loginResponse = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: testPassword,
    });

    const cookies = loginResponse.headers['set-cookie'];
    return { cookies };
  }

  beforeEach(async () => {
    // Clean up and seed minimal data if needed
    await prisma.historyContent.deleteMany();
    await prisma.department.deleteMany();

    // Create a department for validation tests
    await prisma.department.create({
      data: {
        name: 'Badminton',
        slug: 'badminton',
        shortDescription: 'Test',
      },
    });

    // Seed initial history
    await prisma.historyContent.create({
      data: {
        id: 1,
        heroHeadline: 'ORIGINAL HEADLINE',
        heroSubHeadline: 'Subheadline',
        foundingHeadline: 'Founding',
        foundingDescription: 'Description',
        foundingFactCardHeadline: 'Facts',
        foundingMilestonesHeadline: 'Milestones',
        developmentHeadline: 'Dev',
        developmentDescription: 'Dev Description',
        festivalsHeadline: 'Festivals',
        festivalsDescription: 'Desc',
        achievementsHeadline: 'Achievements',
        ctaHeadline: 'CTA',
        ctaDescription: 'CTA Desc',
      },
    });
  });

  describe('GET /api/history', () => {
    it('should return history content', async () => {
      const response = await request(app).get('/api/history');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('heroHeadline', 'ORIGINAL HEADLINE');
      expect(response.body).toHaveProperty(
        'foundingDescription',
        'Description',
      );
    });

    it('should be publicly accessible', async () => {
      const response = await request(app).get('/api/history');
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/history/admin', () => {
    it('should update history content with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const updateData = {
        heroHeadline: 'NEW HEADLINE',
        foundingDescription: 'NEW DESCRIPTION',
      };

      const response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.heroHeadline).toBe('NEW HEADLINE');
      expect(response.body.foundingDescription).toBe('NEW DESCRIPTION');

      // Verify in db
      const updated = await prisma.historyContent.findUnique({
        where: { id: 1 },
      });
      expect(updated?.heroHeadline).toBe('NEW HEADLINE');
      expect(updated?.foundingDescription).toBe('NEW DESCRIPTION');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/history/admin')
        .send({ heroHeadline: 'UNAUTHORIZED' });

      expect(response.status).toBe(401);
    });

    it('should validate achievement categories', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Valid category "Alle"
      let response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send({
          achievementsItems: [
            {
              year: '2020',
              headline: 'T',
              description: 'D',
              category: 'Alle',
            },
          ],
        });
      expect(response.status).toBe(200);

      // Valid department slug
      response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send({
          achievementsItems: [
            {
              year: '2020',
              headline: 'T',
              description: 'D',
              category: 'badminton',
            },
          ],
        });
      expect(response.status).toBe(200);

      // Invalid category
      response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send({
          achievementsItems: [
            {
              year: '2020',
              headline: 'T',
              description: 'D',
              category: 'invalid-dept',
            },
          ],
        });
      expect(response.status).toBe(400);
      const errorMsg = JSON.parse(response.body.message);
      expect(errorMsg.errors[0].message).toContain(
        'Invalid achievement category',
      );
    });

    it('should handle complex relational fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const complexData = {
        developmentChartData: {
          labels: ['2020', '2021'],
          datasets: [{ label: 'Members', data: [100, 110] }],
        },
        festivalsItems: [{ headline: 'Fest', text: 'Text' }],
        foundingFacts: [
          { year: '1985', headline: 'Fact', description: 'Desc' },
        ],
      };

      const response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send(complexData);

      expect(response.status).toBe(200);
      expect(response.body.developmentChartData).toMatchObject(
        complexData.developmentChartData,
      );
      expect(response.body.festivalsItems).toMatchObject(
        complexData.festivalsItems,
      );
      expect(response.body.foundingFacts).toMatchObject(
        complexData.foundingFacts,
      );
    });

    it('should preserve existing relations on partial update', async () => {
      const { cookies } = await createAuthenticatedUser();

      // 1. Initial full setup
      const initialData = {
        foundingFacts: [
          { year: '1985', headline: 'Fact 1', description: 'Desc 1' },
        ],
        festivalsItems: [{ headline: 'Fest 1', text: 'Text 1' }],
      };

      await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send(initialData);

      // 2. Partial update (only Hero headline)
      const partialUpdate = {
        heroHeadline: 'NEW HERO HEADLINE',
      };

      const response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send(partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.heroHeadline).toBe('NEW HERO HEADLINE');

      // 3. Verify relations are still there
      expect(response.body.foundingFacts).toHaveLength(1);
      expect(response.body.foundingFacts[0].headline).toBe('Fact 1');
      expect(response.body.festivalsItems).toHaveLength(1);
      expect(response.body.festivalsItems[0].headline).toBe('Fest 1');
    });
  });
});
