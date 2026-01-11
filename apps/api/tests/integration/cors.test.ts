import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';

const HEALTH_ENDPOINT = '/api/health';
const DEV_ORIGIN = 'http://localhost:5173';
const OTHER_ORIGIN = 'https://example.com';

describe('CORS Integration Tests', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  beforeEach(() => {
    // Reset CORS-related env between tests to avoid cross-test leakage
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CORS_ORIGINS = originalCorsOrigins;
  });

  describe('Development defaults', () => {
    it('should allow default dev origin when no CORS_ORIGINS is set', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.CORS_ORIGINS;

      const response = await request(app).get(HEALTH_ENDPOINT).set('Origin', DEV_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(DEV_ORIGIN);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Configured allowlist', () => {
    it('should allow origins configured via CORS_ORIGINS', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = `${OTHER_ORIGIN}, ${DEV_ORIGIN}`;

      const response = await request(app).get(HEALTH_ENDPOINT).set('Origin', OTHER_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(OTHER_ORIGIN);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should reject origins not in CORS_ORIGINS allowlist', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = OTHER_ORIGIN;

      const response = await request(app).get(HEALTH_ENDPOINT).set('Origin', DEV_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
      expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    });
  });

  describe('Preflight requests with credentials', () => {
    it('should handle OPTIONS preflight for allowed origin with credentials', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.CORS_ORIGINS;

      const response = await request(app).options(HEALTH_ENDPOINT).set('Origin', DEV_ORIGIN).set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
      expect(response.headers['access-control-allow-origin']).toBe(DEV_ORIGIN);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
