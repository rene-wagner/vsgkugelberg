import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { getPrismaClient, createTestUserWithPassword } from '../helpers';

const prisma = getPrismaClient();

describe('Blocks API Integration Tests', () => {
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

  // Helper to create a block directly in DB
  async function createTestBlock(
    page: string,
    type: string,
    sort: number = 0,
    data?: object | null,
    parentId?: string | null,
  ) {
    return prisma.block.create({
      data: {
        page,
        type,
        sort,
        data: data ?? undefined,
        parentId: parentId ?? undefined,
      },
    });
  }

  describe('GET /api/blocks', () => {
    it('should return blocks for a specific page', async () => {
      await createTestBlock('/test-page', 'ParagraphBlock', 0, {
        text: 'Hello',
      });
      await createTestBlock('/test-page', 'ImageBlock', 1, {
        src: '/image.jpg',
      });
      await createTestBlock('/other-page', 'ParagraphBlock', 0, {
        text: 'Other',
      });

      const response = await request(app).get('/api/blocks?page=/test-page');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].type).toBe('ParagraphBlock');
      expect(response.body[1].type).toBe('ImageBlock');
    });

    it('should return blocks sorted by sort field', async () => {
      await createTestBlock('/test-page', 'BlockC', 2);
      await createTestBlock('/test-page', 'BlockA', 0);
      await createTestBlock('/test-page', 'BlockB', 1);

      const response = await request(app).get('/api/blocks?page=/test-page');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].type).toBe('BlockA');
      expect(response.body[1].type).toBe('BlockB');
      expect(response.body[2].type).toBe('BlockC');
    });

    it('should return blocks with nested children', async () => {
      const parent = await createTestBlock('/test-page', 'ColumnBlock', 0, {
        columns: 2,
      });
      await createTestBlock(
        '/test-page',
        'ParagraphBlock',
        0,
        { text: 'Child 1' },
        parent.id,
      );
      await createTestBlock(
        '/test-page',
        'ParagraphBlock',
        1,
        { text: 'Child 2' },
        parent.id,
      );

      const response = await request(app).get('/api/blocks?page=/test-page');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('ColumnBlock');
      expect(response.body[0].children).toHaveLength(2);
      expect(response.body[0].children[0].type).toBe('ParagraphBlock');
      expect(response.body[0].children[0].data).toEqual({ text: 'Child 1' });
      expect(response.body[0].children[1].data).toEqual({ text: 'Child 2' });
    });

    it('should return empty array for non-existent page', async () => {
      const response = await request(app).get(
        '/api/blocks?page=/non-existent-page',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 400 when page query parameter is missing', async () => {
      const response = await request(app).get('/api/blocks');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/blocks/:id', () => {
    it('should return a single block by ID', async () => {
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0, {
        text: 'Test',
      });

      const response = await request(app).get(`/api/blocks/${block.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(block.id);
      expect(response.body.type).toBe('ParagraphBlock');
      expect(response.body.data).toEqual({ text: 'Test' });
    });

    it('should return block with children', async () => {
      const parent = await createTestBlock('/test-page', 'ColumnBlock', 0);
      await createTestBlock(
        '/test-page',
        'ParagraphBlock',
        0,
        { text: 'Child' },
        parent.id,
      );

      const response = await request(app).get(`/api/blocks/${parent.id}`);

      expect(response.status).toBe(200);
      expect(response.body.children).toHaveLength(1);
      expect(response.body.children[0].type).toBe('ParagraphBlock');
    });

    it('should return 404 for non-existent block', async () => {
      const response = await request(app).get(
        '/api/blocks/00000000-0000-0000-0000-000000000000',
      );

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/blocks/invalid-uuid');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/blocks', () => {
    it('should create blocks for a page', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [
            { type: 'ParagraphBlock', data: { text: 'Hello' } },
            { type: 'ImageBlock', data: { src: '/image.jpg' } },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].type).toBe('ParagraphBlock');
      expect(response.body[0].sort).toBe(0);
      expect(response.body[1].type).toBe('ImageBlock');
      expect(response.body[1].sort).toBe(1);
    });

    it('should create nested blocks', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [
            {
              type: 'ColumnBlock',
              data: { columns: 2 },
              children: [
                { type: 'ParagraphBlock', data: { text: 'Left' } },
                { type: 'ParagraphBlock', data: { text: 'Right' } },
              ],
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('ColumnBlock');
      expect(response.body[0].children).toHaveLength(2);
      expect(response.body[0].children[0].type).toBe('ParagraphBlock');
      expect(response.body[0].children[0].data).toEqual({ text: 'Left' });
      expect(response.body[0].children[0].sort).toBe(0);
      expect(response.body[0].children[1].sort).toBe(1);
    });

    it('should replace existing blocks for the page', async () => {
      const { cookies } = await createAuthenticatedUser();

      // Create initial blocks
      await createTestBlock('/test-page', 'OldBlock', 0);
      await createTestBlock('/test-page', 'OldBlock2', 1);

      // Replace with new blocks
      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [{ type: 'NewBlock', data: { text: 'New' } }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('NewBlock');

      // Verify old blocks are gone
      const getResponse = await request(app).get('/api/blocks?page=/test-page');
      expect(getResponse.body).toHaveLength(1);
      expect(getResponse.body[0].type).toBe('NewBlock');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/blocks')
        .send({
          page: '/test-page',
          blocks: [{ type: 'ParagraphBlock' }],
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when page is missing', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          blocks: [{ type: 'ParagraphBlock' }],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when blocks array is empty', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when block type is missing', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [{ data: { text: 'No type' } }],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/blocks/:id', () => {
    it('should update block type', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0);

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .set('Cookie', cookies)
        .send({ type: 'HeadingBlock' });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('HeadingBlock');
    });

    it('should update block sort', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0);

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .set('Cookie', cookies)
        .send({ sort: 5 });

      expect(response.status).toBe(200);
      expect(response.body.sort).toBe(5);
    });

    it('should update block data', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0, {
        text: 'Old',
      });

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .set('Cookie', cookies)
        .send({ data: { text: 'New' } });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ text: 'New' });
    });

    it('should update block page', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/old-page', 'ParagraphBlock', 0);

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .set('Cookie', cookies)
        .send({ page: '/new-page' });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe('/new-page');
    });

    it('should perform partial update', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 5, {
        text: 'Original',
      });

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .set('Cookie', cookies)
        .send({ type: 'HeadingBlock' });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('HeadingBlock');
      expect(response.body.sort).toBe(5);
      expect(response.body.data).toEqual({ text: 'Original' });
    });

    it('should return 401 without authentication', async () => {
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0);

      const response = await request(app)
        .patch(`/api/blocks/${block.id}`)
        .send({ type: 'NewType' });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent block', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/blocks/00000000-0000-0000-0000-000000000000')
        .set('Cookie', cookies)
        .send({ type: 'NewType' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/blocks/invalid-uuid')
        .set('Cookie', cookies)
        .send({ type: 'NewType' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/blocks/:id', () => {
    it('should delete a block', async () => {
      const { cookies } = await createAuthenticatedUser();
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0);

      const response = await request(app)
        .delete(`/api/blocks/${block.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(block.id);

      // Verify block is deleted
      const getResponse = await request(app).get(`/api/blocks/${block.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should cascade delete to children', async () => {
      const { cookies } = await createAuthenticatedUser();
      const parent = await createTestBlock('/test-page', 'ColumnBlock', 0);
      const child = await createTestBlock(
        '/test-page',
        'ParagraphBlock',
        0,
        null,
        parent.id,
      );

      const response = await request(app)
        .delete(`/api/blocks/${parent.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);

      // Verify child is also deleted
      const childResponse = await request(app).get(`/api/blocks/${child.id}`);
      expect(childResponse.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const block = await createTestBlock('/test-page', 'ParagraphBlock', 0);

      const response = await request(app).delete(`/api/blocks/${block.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent block', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/blocks/00000000-0000-0000-0000-000000000000')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/blocks/invalid-uuid')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle blocks with null data', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [{ type: 'DividerBlock' }],
        });

      expect(response.status).toBe(201);
      expect(response.body[0].data).toBeNull();
    });

    it('should handle deeply nested blocks', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [
            {
              type: 'Level1',
              children: [
                {
                  type: 'Level2',
                  children: [{ type: 'Level3' }],
                },
              ],
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body[0].type).toBe('Level1');
      expect(response.body[0].children[0].type).toBe('Level2');
      expect(response.body[0].children[0].children[0].type).toBe('Level3');
    });

    it('should handle special characters in page URL', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/über-uns',
          blocks: [{ type: 'ParagraphBlock' }],
        });

      expect(response.status).toBe(201);
      expect(response.body[0].page).toBe('/über-uns');

      const getResponse = await request(app).get('/api/blocks?page=/über-uns');
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveLength(1);
    });

    it('should handle complex JSON in data field', async () => {
      const { cookies } = await createAuthenticatedUser();
      const complexData = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        settings: {
          enabled: true,
          config: {
            nested: {
              value: 42,
            },
          },
        },
      };

      const response = await request(app)
        .post('/api/blocks')
        .set('Cookie', cookies)
        .send({
          page: '/test-page',
          blocks: [{ type: 'ComplexBlock', data: complexData }],
        });

      expect(response.status).toBe(201);
      expect(response.body[0].data).toEqual(complexData);
    });
  });
});
