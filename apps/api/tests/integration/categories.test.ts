import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

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
    it('should return all categories as tree structure', async () => {
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
      expect(response.body[0]).toHaveProperty('children');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('should return empty array when no categories exist', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
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

    it('should return nested tree structure', async () => {
      // Create parent category
      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      // Create child category with hierarchical slug
      const child = await prisma.category.create({
        data: {
          name: 'Ball Sports',
          slug: 'sports/ball-sports',
          description: null,
          parentId: parent.id,
        },
      });

      // Create grandchild category with hierarchical slug
      await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/ball-sports/volleyball',
          description: null,
          parentId: child.id,
        },
      });

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      // Should have 1 root category
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Sports');
      expect(response.body[0].children.length).toBe(1);
      expect(response.body[0].children[0].name).toBe('Ball Sports');
      expect(response.body[0].children[0].children.length).toBe(1);
      expect(response.body[0].children[0].children[0].name).toBe('Volleyball');
      expect(response.body[0].children[0].children[0].children).toEqual([]);
    });
  });

  describe('GET /api/categories/*', () => {
    it('should return a single category by slug with children array', async () => {
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
      expect(response.body).toHaveProperty('children');
      expect(response.body.children).toEqual([]);
    });

    it('should return nested category by hierarchical slug', async () => {
      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      const response = await request(app).get('/api/categories/sports/volleyball');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(child.id);
      expect(response.body.name).toBe('Volleyball');
      expect(response.body.slug).toBe('sports/volleyball');
    });

    it('should include direct children in response', async () => {
      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      await prisma.category.createMany({
        data: [
          {
            name: 'Volleyball',
            slug: 'sports/volleyball',
            description: null,
            parentId: parent.id,
          },
          {
            name: 'Badminton',
            slug: 'sports/badminton',
            description: null,
            parentId: parent.id,
          },
          {
            name: 'Gymnastics',
            slug: 'sports/gymnastics',
            description: null,
            parentId: parent.id,
          },
        ],
      });

      const response = await request(app).get('/api/categories/sports');

      expect(response.status).toBe(200);
      expect(response.body.children.length).toBe(3);
      // Should be sorted alphabetically
      expect(response.body.children[0].name).toBe('Badminton');
      expect(response.body.children[1].name).toBe('Gymnastics');
      expect(response.body.children[2].name).toBe('Volleyball');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app).get('/api/categories/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for non-existent nested category', async () => {
      await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const response = await request(app).get('/api/categories/sports/swimming');

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
    it('should create a root category with authentication', async () => {
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
      expect(response.body.parentId).toBeNull();
    });

    it('should create a child category with hierarchical slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const newCategory = {
        name: 'Volleyball',
        parentId: parent.id,
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Volleyball');
      expect(response.body.parentId).toBe(parent.id);
      expect(response.body.slug).toBe('sports/volleyball');
    });

    it('should create deeply nested category with full hierarchical slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Ball Sports',
          slug: 'sports/ball-sports',
          description: null,
          parentId: parent.id,
        },
      });

      const newCategory = {
        name: 'Volleyball',
        parentId: child.id,
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.slug).toBe('sports/ball-sports/volleyball');
    });

    it('should allow same name under different parents', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent1 = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const parent2 = await prisma.category.create({
        data: { name: 'Club Events', slug: 'club-events', description: null },
      });

      // Create "News" under Sports
      const response1 = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send({ name: 'News', parentId: parent1.id });

      expect(response1.status).toBe(201);
      expect(response1.body.slug).toBe('sports/news');

      // Create "News" under Club Events - should succeed
      const response2 = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send({ name: 'News', parentId: parent2.id });

      expect(response2.status).toBe(201);
      expect(response2.body.slug).toBe('club-events/news');
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

    it('should return 409 for duplicate name under same parent (case insensitive)', async () => {
      const { cookies } = await createAuthenticatedUser();

      await prisma.category.create({
        data: {
          name: 'Technology',
          slug: 'technology',
        },
      });

      const newCategory = {
        name: 'TECHNOLOGY', // Different case, same parent (root)
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for invalid parentId', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newCategory = {
        name: 'Orphan Category',
        parentId: 99999, // Non-existent
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Cookie', cookies)
        .send(newCategory);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PATCH /api/categories/*', () => {
    it('should update category name and regenerate hierarchical slug', async () => {
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

    it('should update nested category name and regenerate hierarchical slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      const response = await request(app)
        .patch('/api/categories/sports/volleyball')
        .set('Cookie', cookies)
        .send({ name: 'Indoor Volleyball' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Indoor Volleyball');
      expect(response.body.slug).toBe('sports/indoor-volleyball');
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

    it('should move category to new parent and update slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'volleyball',
          description: null,
        },
      });

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send({ parentId: parent.id });

      expect(response.status).toBe(200);
      expect(response.body.parentId).toBe(parent.id);
      expect(response.body.slug).toBe('sports/volleyball');
    });

    it('should move category to root and update slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      const response = await request(app)
        .patch('/api/categories/sports/volleyball')
        .set('Cookie', cookies)
        .send({ parentId: null });

      expect(response.status).toBe(200);
      expect(response.body.parentId).toBeNull();
      expect(response.body.slug).toBe('volleyball');
    });

    it('should update descendant slugs when parent changes', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent1 = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent1.id,
        },
      });

      const grandchild = await prisma.category.create({
        data: {
          name: 'Beach',
          slug: 'sports/volleyball/beach',
          description: null,
          parentId: category.id,
        },
      });

      const parent2 = await prisma.category.create({
        data: { name: 'Activities', slug: 'activities', description: null },
      });

      // Move Volleyball to Activities
      const response = await request(app)
        .patch('/api/categories/sports/volleyball')
        .set('Cookie', cookies)
        .send({ parentId: parent2.id });

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe('activities/volleyball');

      // Check that grandchild slug was updated
      const updatedGrandchild = await prisma.category.findUnique({
        where: { id: grandchild.id },
      });
      expect(updatedGrandchild?.slug).toBe('activities/volleyball/beach');
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

    it('should return 409 for duplicate name under same parent', async () => {
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

    it('should return 400 when moving to self', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send({ parentId: category.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('own parent');
    });

    it('should return 400 when moving to descendant (circular reference)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      const response = await request(app)
        .patch(`/api/categories/${parent.slug}`)
        .set('Cookie', cookies)
        .send({ parentId: child.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('circular');
    });

    it('should return 400 for non-existent parent', async () => {
      const { cookies } = await createAuthenticatedUser();

      const category = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const response = await request(app)
        .patch(`/api/categories/${category.slug}`)
        .set('Cookie', cookies)
        .send({ parentId: 99999 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not found');
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

  describe('DELETE /api/categories/*', () => {
    it('should delete a root category with authentication', async () => {
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
      const deletedCategory = await prisma.category.findFirst({
        where: { slug: 'category-to-delete' },
      });
      expect(deletedCategory).toBeNull();
    });

    it('should delete nested category by hierarchical slug', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      const response = await request(app)
        .delete('/api/categories/sports/volleyball')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(child.id);

      // Verify parent still exists
      const remainingParent = await prisma.category.findFirst({
        where: { slug: 'sports' },
      });
      expect(remainingParent).toBeTruthy();
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
      const existingCategory = await prisma.category.findFirst({
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

    it('should cascade delete to children', async () => {
      const { cookies } = await createAuthenticatedUser();

      const parent = await prisma.category.create({
        data: { name: 'Sports', slug: 'sports', description: null },
      });

      const child = await prisma.category.create({
        data: {
          name: 'Volleyball',
          slug: 'sports/volleyball',
          description: null,
          parentId: parent.id,
        },
      });

      await prisma.category.create({
        data: {
          name: 'Beach Volleyball',
          slug: 'sports/volleyball/beach-volleyball',
          description: null,
          parentId: child.id,
        },
      });

      const response = await request(app)
        .delete(`/api/categories/${parent.slug}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);

      // Verify all descendants are deleted
      const remaining = await prisma.category.findMany();
      expect(remaining.length).toBe(0);
    });
  });
});
