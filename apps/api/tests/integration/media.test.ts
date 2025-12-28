import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs/promises';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';
import { UPLOAD_DIR } from '@/config/upload.config';

describe('Media API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testadmin';
  const testEmail = 'testadmin@example.com';

  // Track uploaded files for cleanup
  const uploadedFiles: string[] = [];

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

  // Helper to create a test image buffer
  function createTestImageBuffer(): Buffer {
    // Create a minimal valid JPEG (1x1 pixel red image)
    return Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
      0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
      0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
      0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
      0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
      0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd5, 0xdb, 0x20, 0xa8, 0xf1, 0x85, 0xb8,
      0x47, 0x1e, 0x94, 0x01, 0xff, 0xd9,
    ]);
  }

  // Helper to create a minimal PNG buffer
  function createTestPngBuffer(): Buffer {
    // 1x1 red PNG
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe, 0xd4, 0xef, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  }

  // Cleanup uploaded files after each test
  afterEach(async () => {
    for (const filename of uploadedFiles) {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, filename));
      } catch {
        // Ignore if file doesn't exist
      }
    }
    uploadedFiles.length = 0;
  });

  describe('GET /api/media', () => {
    it('should return empty list when no media exists', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/media')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta).toMatchObject({
        total: 0,
        page: 1,
        totalPages: 0,
      });
    });

    it('should return paginated media list', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Create test media entries
      await prisma.media.create({
        data: {
          filename: 'test1.jpg',
          originalName: 'image1.jpg',
          path: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          type: 'IMAGE',
        },
      });

      await prisma.media.create({
        data: {
          filename: 'test2.png',
          originalName: 'image2.png',
          path: 'test2.png',
          mimetype: 'image/png',
          size: 2048,
          type: 'IMAGE',
        },
      });

      const response = await request(app)
        .get('/api/media')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('filename');
      expect(response.body.data[0]).toHaveProperty('originalName');
      expect(response.body.data[0]).toHaveProperty('mimetype');
      expect(response.body.data[0]).toHaveProperty('size');
    });

    it('should support pagination parameters', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Create 5 media entries
      for (let i = 1; i <= 5; i++) {
        await prisma.media.create({
          data: {
            filename: `test${i}.jpg`,
            originalName: `image${i}.jpg`,
            path: `test${i}.jpg`,
            mimetype: 'image/jpeg',
            size: 1024 * i,
            type: 'IMAGE',
          },
        });
      }

      const response = await request(app)
        .get('/api/media?page=2&limit=2')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        total: 5,
        page: 2,
        limit: 2,
        totalPages: 3,
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/media');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/media/:id', () => {
    it('should return a single media by ID', async () => {
      const { cookies } = await createAuthenticatedUser();

      const media = await prisma.media.create({
        data: {
          filename: 'test-single.jpg',
          originalName: 'single-image.jpg',
          path: 'test-single.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          type: 'IMAGE',
        },
      });

      const response = await request(app)
        .get(`/api/media/${media.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: media.id,
        filename: 'test-single.jpg',
        originalName: 'single-image.jpg',
        mimetype: 'image/jpeg',
      });
    });

    it('should return 404 for non-existent media', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/media/99999')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/media/1');

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid ID format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/media/invalid')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/media', () => {
    it('should upload a valid JPEG image', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', createTestImageBuffer(), 'test-image.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.originalName).toBe('test-image.jpg');
      expect(response.body.mimetype).toBe('image/jpeg');
      expect(response.body.type).toBe('IMAGE');

      // Track for cleanup
      uploadedFiles.push(response.body.filename);

      // Verify file exists on disk
      const filePath = path.join(UPLOAD_DIR, response.body.filename);
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
    });

    it('should upload a valid PNG image', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', createTestPngBuffer(), 'test-image.png');

      expect(response.status).toBe(201);
      expect(response.body.originalName).toBe('test-image.png');
      expect(response.body.mimetype).toBe('image/png');

      uploadedFiles.push(response.body.filename);
    });

    it('should upload a valid SVG image', async () => {
      const { cookies } = await createAuthenticatedUser();

      const svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="red" width="100" height="100"/></svg>';

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', Buffer.from(svgContent), {
          filename: 'test-image.svg',
          contentType: 'image/svg+xml',
        });

      expect(response.status).toBe(201);
      expect(response.body.originalName).toBe('test-image.svg');
      expect(response.body.mimetype).toBe('image/svg+xml');

      uploadedFiles.push(response.body.filename);
    });

    it('should reject invalid file type', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid file type');
    });

    it('should return 400 when no file is uploaded', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/media')
        .attach('file', createTestImageBuffer(), 'test-image.jpg');

      expect(response.status).toBe(401);
    });

    it('should generate UUID-based filename for security', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', createTestImageBuffer(), '../../../etc/passwd.jpg');

      expect(response.status).toBe(201);
      // Filename should be UUID-based, not the original malicious name
      expect(response.body.filename).not.toContain('..');
      expect(response.body.filename).toMatch(/^[a-f0-9-]+\.jpg$/i);
      // Original name is sanitized by multer (removes path components)
      expect(response.body.originalName).toBe('passwd.jpg');

      uploadedFiles.push(response.body.filename);
    });
  });

  describe('DELETE /api/media/:id', () => {
    it('should delete media and file', async () => {
      const { cookies } = await createAuthenticatedUser();

      // First upload a file
      const uploadResponse = await request(app)
        .post('/api/media')
        .set('Cookie', cookies)
        .attach('file', createTestImageBuffer(), 'to-delete.jpg');

      expect(uploadResponse.status).toBe(201);
      const mediaId = uploadResponse.body.id;
      const filename = uploadResponse.body.filename;

      // Verify file exists
      const filePath = path.join(UPLOAD_DIR, filename);
      const statsBeforeDelete = await fs.stat(filePath);
      expect(statsBeforeDelete.isFile()).toBe(true);

      // Delete the media
      const deleteResponse = await request(app)
        .delete(`/api/media/${mediaId}`)
        .set('Cookie', cookies);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.id).toBe(mediaId);

      // Verify file is deleted
      await expect(fs.stat(filePath)).rejects.toThrow();

      // Verify database record is deleted
      const media = await prisma.media.findUnique({ where: { id: mediaId } });
      expect(media).toBeNull();
    });

    it('should return 404 for non-existent media', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/media/99999')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete('/api/media/1');

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid ID format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/media/invalid')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });
});
