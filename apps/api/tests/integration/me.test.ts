import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestUserWithPassword } from '../helpers';

describe('Auth API Integration Tests', () => {
  const testPassword = 'Password123';
  const authUsername = 'auth_testuser';
  const authEmail = 'auth_test@example.com';

  describe('GET /api/me', () => {
    it('should return current user when authenticated via cookie', async () => {
      const user = await createTestUserWithPassword(
        authUsername,
        authEmail,
        testPassword,
      );

      const loginResponse = await request(app).post('/api/auth/login').send({
        username: authUsername,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const meResponse = await request(app)
        .get('/api/me')
        .set('Cookie', cookies as string[]);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toHaveProperty('user');
      expect(meResponse.body.user).toMatchObject({
        id: user.id,
        username: authUsername,
        email: authEmail,
      });
      expect(meResponse.body.user).toHaveProperty('createdAt');
      expect(meResponse.body.user).toHaveProperty('updatedAt');
      expect(meResponse.body.user).not.toHaveProperty('password');
    });

    it('should return 401 when no cookie is provided', async () => {
      const response = await request(app).get('/api/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const invalidToken = 'invalid.token.value';

      const response = await request(app)
        .get('/api/me')
        .set('Cookie', [`access_token=${invalidToken}`]);

      expect(response.status).toBe(401);
    });
  });
});
