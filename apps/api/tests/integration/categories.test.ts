import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { getPrismaClient, createTestUserWithPassword } from '../helpers';

const prisma = getPrismaClient();

describe('Categories API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testuser';
  const testEmail = 'testuser@example.com';

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

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      await prisma.category.createMany({
        data: [
          {
            name: 'Technology',
            slug: 'technology',
            description: 'Tech articles',
          },
          {
            name: 'Science',
            slug: 'science',
            description: 'Science articles',
          },
        ],
      });

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('should return empty array when no categories exist', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return categories sorted alphabetically by name', async () => {
      await prisma.category.createMany({
        data: [
          { name: 'Zebra', slug: 'zebra', description: null },
          { name: 'Alpha', slug: 'alpha', description: null },
          { name: 'Beta', slug: 'beta', description: null },
        ],
      });

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Alpha');
      expect(response.body[1].name).toBe('Beta');
      expect(response.body[2].name).toBe('Zebra');
    });
  });

  describe('GET /api/categories/:slug', () => {
    it('should return a single category by slug', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Programming',
          slug: 'programming',
          description: 'Programming articles',
        },
      });

      const response = await request(app).get('/api/categories/programming');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: category.id,
        name: 'Programming',
        slug: 'programming',
        description: 'Programming articles',
      });
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app).get('/api/categories/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app).get('/api/categories/invalid slug!');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a category with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        name: 'Web Development',
        description: 'Articles about web development',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Web Development',
        description: 'Articles about web development',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('slug');
      expect(response.body.slug).toBe('web-development');

      // Verify in database
      const category = await prisma.category.findUnique({
        where: { slug: 'web-development' },
      });
      expect(category).toBeTruthy();
    });

    it('should create a category without description', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        name: 'Minimal Category',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Minimal Category');
      expect(response.body.description).toBeNull();
    });

    it('should generate unique slug from name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category1 = {
        name: 'Test Category',
      };

      const response1 = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(category1);

      expect(response1.status).toBe(201);
      expect(response1.body.slug).toBe('test-category');

      // Create another category with same name
      const category2 = {
        name: 'Test Category',
      };

      const response2 = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(category2);

      expect(response2.status).toBe(409);
      expect(response2.body.message).toContain('already exists');
    });

    it('should handle special characters in name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        name: 'C++ & Python!',
        description: 'Programming languages',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.slug).toMatch(/^c-python/);
    });

    it('should return 401 without authentication', async () => {
      const newCategory = {
        name: 'Unauthorized Category',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        description: 'Missing name',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(400);
    });

    it('should return 400 for name too short', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        name: 'A', // Only 1 character
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(400);
    });

    it('should return 400 for name too long', async () => {
      const { cookies } = await createAuthenticatedUser();

      const longName = 'a'.repeat(101);
      const newCategory = {
        name: longName,
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(400);
    });

    it('should return 400 for description too long', async () => {
      const { cookies } = await createAuthenticatedUser();

      const longDescription = 'a'.repeat(501);
      const newCategory = {
        name: 'Valid Name',
        description: longDescription,
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate name (case insensitive)', async () => {
      const { cookies } = await createAuthenticatedUser();

      await prisma.category.create({
        data: {
          name: 'Technology',
          slug: 'technology',
        },
      });

      const newCategory = {
        name: 'TECHNOLOGY', // Different case
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('PATCH /api/categories/:slug', () => {
    it('should update category name with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
          description: 'Description',
        },
      });

      const update = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.slug).toBe('updated-name');
    });

    it('should update category description', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Category',
          slug: 'category',
          description: 'Original description',
        },
      });

      const update = {
        description: 'Updated description',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
      expect(response.body.name).toBe('Category');
      expect(response.body.slug).toBe('category');
    });

    it('should update both name and description', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Original',
          slug: 'original',
          description: 'Original description',
        },
      });

      const update = {
        name: 'Updated',
        description: 'Updated description',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Updated',
        description: 'Updated description',
      });
      expect(response.body.slug).toBe('updated');
    });

    it('should regenerate slug when name changes', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
        },
      });

      const update = {
        name: 'Completely New Name',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe('completely-new-name');

      // Verify old slug doesn't exist
      const oldCategory = await prisma.category.findUnique({
        where: { slug: 'original-name' },
      });
      expect(oldCategory).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test',
          slug: 'test',
        },
      });

      const update = {
        name: 'Updated',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .send(update);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent category', async () => {
      const { cookies } = await createAuthenticatedUser();

      const update = {
        name: 'Updated',
      };

      const response = await request(app)
        .patch('/api/categories/non-existent')
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 409 for duplicate name', async () => {
      const { cookies } = await createAuthenticatedUser();

      await prisma.category.create({
        data: {
          name: 'Existing Category',
          slug: 'existing-category',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Another Category',
          slug: 'another-category',
        },
      });

      const update = {
        name: 'Existing Category',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should allow partial updates', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
          description: 'Original description',
        },
      });

      const update = {
        description: 'Only description changed',
      };

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Original Name');
      expect(response.body.slug).toBe('original-name');
      expect(response.body.description).toBe('Only description changed');
    });
  });

  describe('DELETE /api/categories/:slug', () => {
    it('should delete a category with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: {
          name: 'Category to Delete',
          slug: 'category-to-delete',
          description: 'Description',
        },
      });

      const response = await request(app)
        .delete(`/api/categories/${category.slug}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: category.id,
        name: 'Category to Delete',
        slug: 'category-to-delete',
      });

      // Verify deletion in database
      const deletedCategory = await prisma.category.findUnique({
        where: { slug: 'category-to-delete' },
      });
      expect(deletedCategory).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Protected Category',
          slug: 'protected-category',
        },
      });

      const response = await request(app).delete(
        `/api/categories/${category.slug}`,
      );

      expect(response.status).toBe(401);

      // Verify category still exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug: 'protected-category' },
      });
      expect(existingCategory).toBeTruthy();
    });

    it('should return 404 for non-existent category', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/categories/non-existent-slug')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/categories/invalid slug!')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });
});
