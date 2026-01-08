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
        foundingNarrative: [],
        foundingFactCardHeadline: 'Facts',
        foundingFacts: [],
        foundingMilestonesHeadline: 'Milestones',
        foundingMilestones: [],
        developmentHeadline: 'Dev',
        developmentNarrative: [],
        developmentChartData: { labels: [], datasets: [] },
        developmentChronicleGroups: [],
        festivalsHeadline: 'Festivals',
        festivalsDescription: 'Desc',
        festivalsItems: [],
        achievementsHeadline: 'Achievements',
        achievementsItems: [],
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
      };

      const response = await request(app)
        .patch('/api/history/admin')
        .set('Cookie', cookies)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.heroHeadline).toBe('NEW HEADLINE');

      // Verify in db
      const updated = await prisma.historyContent.findUnique({
        where: { id: 1 },
      });
      expect(updated?.heroHeadline).toBe('NEW HEADLINE');
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
            { year: '2020', title: 'T', description: 'D', category: 'Alle' },
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
              title: 'T',
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
              title: 'T',
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

    it('should handle complex Json fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const complexData = {
        developmentChartData: {
          labels: ['2020', '2021'],
          datasets: [{ label: 'Members', data: [100, 110] }],
        },
        festivalsItems: [
          { title: 'Fest', subtitle: 'Sub', text: 'Text', icon: 'star' },
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
    });
  });
});
