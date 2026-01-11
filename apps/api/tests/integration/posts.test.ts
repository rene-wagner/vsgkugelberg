import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Posts API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testauthor';
  const testEmail = 'testauthor@example.com';

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

  // Helper to create test categories
  async function createTestCategories() {
    const category1 = await prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech articles',
      },
    });

    const category2 = await prisma.category.create({
      data: {
        name: 'Science',
        slug: 'science',
        description: 'Science articles',
      },
    });

    return { category1, category2 };
  }

  // Helper to create test media
  async function createTestMedia(filename: string = 'test-image.jpg') {
    return await prisma.media.create({
      data: {
        filename,
        originalName: filename,
        path: `/uploads/${filename}`,
        mimetype: 'image/jpeg',
        size: 1024,
        type: 'IMAGE',
      },
    });
  }

  describe('GET /api/posts', () => {
    it('should return paginated posts with metadata', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Test Post 1',
          slug: 'test-post-1',
          content: 'Content 1',
          published: true,
          authorId: user.id,
        },
      });

      await prisma.post.create({
        data: {
          title: 'Test Post 2',
          slug: 'test-post-2',
          content: 'Content 2',
          published: false,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('slug');
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('published');
      expect(response.body.data[0]).toHaveProperty('hits');
      expect(response.body.data[0]).toHaveProperty('oldPost');
      expect(response.body.data[0]).toHaveProperty('author');
      expect(response.body.data[0]).toHaveProperty('categories');
      expect(response.body.data[0]).toHaveProperty('thumbnail');
      expect(response.body.data[0].author).not.toHaveProperty('password');
      expect(response.body.meta).toMatchObject({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter posts by published status (true)', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Published Post',
          slug: 'published-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      });

      await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts?published=true');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].published).toBe(true);
      expect(response.body.data[0].title).toBe('Published Post');
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter posts by published status (false)', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Published Post',
          slug: 'published-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      });

      await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts?published=false');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].published).toBe(false);
      expect(response.body.data[0].title).toBe('Draft Post');
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter posts by category slug', async () => {
      const { user } = await createAuthenticatedUser();
      const { category1, category2 } = await createTestCategories();

      await prisma.post.create({
        data: {
          title: 'Tech Post',
          slug: 'tech-post',
          content: 'Content',
          published: true,
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      await prisma.post.create({
        data: {
          title: 'Science Post',
          slug: 'science-post',
          content: 'Content',
          published: true,
          authorId: user.id,
          categories: {
            connect: [{ id: category2.id }],
          },
        },
      });

      const response = await request(app).get('/api/posts?category=technology');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Tech Post');
    });

    it('should combine filters (published + category)', async () => {
      const { user } = await createAuthenticatedUser();
      const { category1 } = await createTestCategories();

      await prisma.post.create({
        data: {
          title: 'Matching Post',
          slug: 'matching-post',
          content: 'Content',
          published: true,
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      await prisma.post.create({
        data: {
          title: 'Non-Matching Post',
          slug: 'non-matching-post',
          content: 'Content',
          published: false,
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      const response = await request(app).get('/api/posts?published=true&category=technology');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Matching Post');
    });

    it('should return empty array when no posts match filters', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts?category=nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should paginate posts with custom page and limit', async () => {
      const { user } = await createAuthenticatedUser();

      // Create 15 posts
      for (let i = 1; i <= 15; i++) {
        await prisma.post.create({
          data: {
            title: `Post ${i}`,
            slug: `post-${i}`,
            content: `Content ${i}`,
            published: true,
            authorId: user.id,
          },
        });
      }

      // Request page 2 with limit 5
      const response = await request(app).get('/api/posts?page=2&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });

    it('should return correct totalPages calculation', async () => {
      const { user } = await createAuthenticatedUser();

      // Create 7 posts
      for (let i = 1; i <= 7; i++) {
        await prisma.post.create({
          data: {
            title: `Post ${i}`,
            slug: `post-${i}`,
            content: `Content ${i}`,
            published: true,
            authorId: user.id,
          },
        });
      }

      const response = await request(app).get('/api/posts?limit=3');

      expect(response.status).toBe(200);
      expect(response.body.meta.totalPages).toBe(3); // ceil(7/3) = 3
    });

    it('should return 400 for invalid page value (0)', async () => {
      const response = await request(app).get('/api/posts?page=0');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid page value (negative)', async () => {
      const response = await request(app).get('/api/posts?page=-1');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid limit value (0)', async () => {
      const response = await request(app).get('/api/posts?limit=0');

      expect(response.status).toBe(400);
    });

    it('should return 400 for limit exceeding maximum (51)', async () => {
      const response = await request(app).get('/api/posts?limit=51');

      expect(response.status).toBe(400);
    });

    it('should apply pagination to filtered results', async () => {
      const { user } = await createAuthenticatedUser();

      // Create 10 published and 5 draft posts
      for (let i = 1; i <= 10; i++) {
        await prisma.post.create({
          data: {
            title: `Published Post ${i}`,
            slug: `published-post-${i}`,
            content: `Content ${i}`,
            published: true,
            authorId: user.id,
          },
        });
      }
      for (let i = 1; i <= 5; i++) {
        await prisma.post.create({
          data: {
            title: `Draft Post ${i}`,
            slug: `draft-post-${i}`,
            content: `Content ${i}`,
            published: false,
            authorId: user.id,
          },
        });
      }

      const response = await request(app).get('/api/posts?published=true&page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta).toMatchObject({
        total: 10,
        page: 1,
        limit: 5,
        totalPages: 2,
      });
      // All returned posts should be published
      response.body.data.forEach((post: { published: boolean }) => {
        expect(post.published).toBe(true);
      });
    });

    it('should include thumbnail data in posts list', async () => {
      const { user } = await createAuthenticatedUser();
      const media = await createTestMedia('thumbnail-list.jpg');

      await prisma.post.create({
        data: {
          title: 'Post with Thumbnail',
          slug: 'post-with-thumbnail',
          content: 'Content',
          published: true,
          authorId: user.id,
          thumbnailId: media.id,
        },
      });

      await prisma.post.create({
        data: {
          title: 'Post without Thumbnail',
          slug: 'post-without-thumbnail',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);

      const postWithThumb = response.body.data.find((p: { slug: string }) => p.slug === 'post-with-thumbnail');
      const postWithoutThumb = response.body.data.find((p: { slug: string }) => p.slug === 'post-without-thumbnail');

      expect(postWithThumb.thumbnail).toBeTruthy();
      expect(postWithThumb.thumbnail.id).toBe(media.id);
      expect(postWithThumb.thumbnail.filename).toBe('thumbnail-list.jpg');
      expect(postWithoutThumb.thumbnail).toBeNull();
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('should return a single post by slug', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Single Post',
          slug: 'single-post',
          content: 'Test content',
          published: true,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts/single-post');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Single Post',
        slug: 'single-post',
        content: 'Test content',
        published: true,
        hits: 0,
        oldPost: false,
      });
      expect(response.body).toHaveProperty('author');
      expect(response.body.author).toMatchObject({
        id: user.id,
        username: testUsername,
        email: testEmail,
      });
      expect(response.body.author).not.toHaveProperty('password');
    });

    it('should return post with categories', async () => {
      const { user } = await createAuthenticatedUser();
      const { category1 } = await createTestCategories();

      await prisma.post.create({
        data: {
          title: 'Post with Relations',
          slug: 'post-with-relations',
          content: 'Content',
          published: true,
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      const response = await request(app).get('/api/posts/post-with-relations');

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(1);
      expect(response.body.categories[0]).toMatchObject({
        name: 'Technology',
        slug: 'technology',
      });
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/api/posts/non-existent-slug');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app).get('/api/posts/invalid slug!');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return post with thumbnail data', async () => {
      const { user } = await createAuthenticatedUser();
      const media = await createTestMedia('post-thumbnail.jpg');

      await prisma.post.create({
        data: {
          title: 'Post with Thumbnail',
          slug: 'post-with-thumbnail',
          content: 'Content',
          published: true,
          authorId: user.id,
          thumbnailId: media.id,
        },
      });

      const response = await request(app).get('/api/posts/post-with-thumbnail');

      expect(response.status).toBe(200);
      expect(response.body.thumbnail).toBeTruthy();
      expect(response.body.thumbnail.id).toBe(media.id);
      expect(response.body.thumbnail.filename).toBe('post-thumbnail.jpg');
      expect(response.body.thumbnail.mimetype).toBe('image/jpeg');
    });

    it('should return post with null thumbnail when none set', async () => {
      const { user } = await createAuthenticatedUser();

      await prisma.post.create({
        data: {
          title: 'Post without Thumbnail',
          slug: 'post-without-thumbnail',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      });

      const response = await request(app).get('/api/posts/post-without-thumbnail');

      expect(response.status).toBe(200);
      expect(response.body.thumbnail).toBeNull();
    });
  });

  describe('POST /api/posts', () => {
    it('should create a post with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'New Post',
        content: 'New content',
        published: true,
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'New Post',
        content: 'New content',
        published: true,
      });
      expect(response.body).toHaveProperty('slug');
      expect(response.body.slug).toBe('new-post');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('categories');

      // Verify in database
      const post = await prisma.post.findUnique({
        where: { slug: 'new-post' },
      });
      expect(post).toBeTruthy();
    });

    it('should create a post with categories', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const { category1, category2 } = await createTestCategories();

      const newPost = {
        title: 'Post with Relations',
        content: 'Content',
        published: false,
        authorId: user.id,
        categoryIds: [category1.id, category2.id],
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.categories).toHaveLength(2);
    });

    it('should generate unique slug from title', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post1 = {
        title: 'Test Post',
        content: 'Content 1',
        authorId: user.id,
      };

      const response1 = await request(app).post('/api/posts').set('Cookie', cookies).send(post1);

      expect(response1.status).toBe(201);
      expect(response1.body.slug).toBe('test-post');

      // Create another post with same title
      const post2 = {
        title: 'Test Post',
        content: 'Content 2',
        authorId: user.id,
      };

      const response2 = await request(app).post('/api/posts').set('Cookie', cookies).send(post2);

      expect(response2.status).toBe(201);
      expect(response2.body.slug).toMatch(/^test-post-\w+$/);
      expect(response2.body.slug).not.toBe('test-post');
    });

    it('should default published to false when not provided', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Draft Post',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.published).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser();

      const newPost = {
        title: 'Unauthorized Post',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').send(newPost);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing title', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should allow missing content (content is optional)', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'No Content Post',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.content).toBeNull();
    });

    it('should return 400 for missing authorId', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'No Author Post',
        content: 'Content',
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent author', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Invalid Author',
        content: 'Content',
        authorId: 99999,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Author');
    });

    it('should return 404 for non-existent category', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Invalid Category',
        content: 'Content',
        authorId: user.id,
        categoryIds: [99999],
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Category');
    });

    it('should return 400 for invalid published type', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Invalid Published',
        content: 'Content',
        authorId: user.id,
        published: 'not-a-boolean',
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should create a post with custom hits value', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Post with Hits',
        content: 'Content',
        authorId: user.id,
        hits: 100,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.hits).toBe(100);
    });

    it('should create a post with oldPost set to true', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Old Post',
        content: 'Content',
        authorId: user.id,
        oldPost: true,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.oldPost).toBe(true);
    });

    it('should default hits to 0 when not provided', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Default Hits Post',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.hits).toBe(0);
    });

    it('should default oldPost to false when not provided', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Default OldPost Post',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.oldPost).toBe(false);
    });

    it('should return 400 for negative hits value', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Negative Hits',
        content: 'Content',
        authorId: user.id,
        hits: -5,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid hits type', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Invalid Hits',
        content: 'Content',
        authorId: user.id,
        hits: 'not-a-number',
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid oldPost type', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Invalid OldPost',
        content: 'Content',
        authorId: user.id,
        oldPost: 'not-a-boolean',
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
    });

    it('should create a post with valid thumbnailId', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const media = await createTestMedia('create-thumbnail.jpg');

      const newPost = {
        title: 'Post with Thumbnail',
        content: 'Content',
        authorId: user.id,
        thumbnailId: media.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.thumbnailId).toBe(media.id);
      expect(response.body.thumbnail).toBeTruthy();
      expect(response.body.thumbnail.id).toBe(media.id);
      expect(response.body.thumbnail.filename).toBe('create-thumbnail.jpg');
    });

    it('should create a post without thumbnailId (null)', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Post without Thumbnail',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.thumbnailId).toBeNull();
      expect(response.body.thumbnail).toBeNull();
    });

    it('should return 404 for non-existent thumbnailId', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Post with Invalid Thumbnail',
        content: 'Content',
        authorId: user.id,
        thumbnailId: 99999,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Media');
    });
  });

  describe('PATCH /api/posts/:slug', () => {
    it('should update post title with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        title: 'Updated Title',
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.slug).toBe('updated-title');
    });

    it('should update post content', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Original content',
          authorId: user.id,
        },
      });

      const update = {
        content: 'Updated content',
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated content');
      expect(response.body.slug).toBe('test-post');
    });

    it('should update post published status', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      });

      const update = {
        published: true,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.published).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Original Post',
          slug: 'original-post',
          content: 'Original content',
          published: false,
          authorId: user.id,
        },
      });

      const update = {
        title: 'Updated Post',
        content: 'Updated content',
        published: true,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Updated Post',
        content: 'Updated content',
        published: true,
      });
      expect(response.body.slug).toBe('updated-post');
    });

    it('should update categories', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const { category1, category2 } = await createTestCategories();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      const update = {
        categoryIds: [category2.id],
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(1);
      expect(response.body.categories[0].id).toBe(category2.id);
    });

    it('should regenerate slug when title changes', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        title: 'Completely New Title',
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe('completely-new-title');

      // Verify old slug doesn't exist
      const oldPost = await prisma.post.findUnique({
        where: { slug: 'original-title' },
      });
      expect(oldPost).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        title: 'Updated Title',
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).send(update);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const { cookies } = await createAuthenticatedUser();

      const update = {
        title: 'Updated Title',
      };

      const response = await request(app).patch('/api/posts/non-existent-slug').set('Cookie', cookies).send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for non-existent category in update', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        categoryIds: [99999],
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Category');
    });

    it('should allow partial updates', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Original content',
          published: false,
          authorId: user.id,
        },
      });

      const update = {
        published: true,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original Title');
      expect(response.body.content).toBe('Original content');
      expect(response.body.published).toBe(true);
    });

    it('should update hits field', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          hits: 10,
          authorId: user.id,
        },
      });

      const update = {
        hits: 50,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.hits).toBe(50);
    });

    it('should update oldPost field', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          oldPost: false,
          authorId: user.id,
        },
      });

      const update = {
        oldPost: true,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.oldPost).toBe(true);
    });

    it('should update multiple fields including hits and oldPost', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Original Post',
          slug: 'original-post',
          content: 'Original content',
          published: false,
          hits: 0,
          oldPost: false,
          authorId: user.id,
        },
      });

      const update = {
        title: 'Updated Post',
        published: true,
        hits: 100,
        oldPost: true,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Updated Post',
        published: true,
        hits: 100,
        oldPost: true,
      });
    });

    it('should return 400 for negative hits in update', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        hits: -10,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid oldPost type in update', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        oldPost: 'not-a-boolean',
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(400);
    });

    it('should update post to add thumbnail', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const media = await createTestMedia('add-thumbnail.jpg');

      const post = await prisma.post.create({
        data: {
          title: 'Post without Thumbnail',
          slug: 'post-without-thumbnail',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        thumbnailId: media.id,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.thumbnailId).toBe(media.id);
      expect(response.body.thumbnail).toBeTruthy();
      expect(response.body.thumbnail.filename).toBe('add-thumbnail.jpg');
    });

    it('should update post to remove thumbnail (set null)', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const media = await createTestMedia('remove-thumbnail.jpg');

      const post = await prisma.post.create({
        data: {
          title: 'Post with Thumbnail',
          slug: 'post-with-thumbnail',
          content: 'Content',
          authorId: user.id,
          thumbnailId: media.id,
        },
      });

      const update = {
        thumbnailId: null,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.thumbnailId).toBeNull();
      expect(response.body.thumbnail).toBeNull();
    });

    it('should update post to change thumbnail', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const media1 = await createTestMedia('old-thumbnail.jpg');
      const media2 = await createTestMedia('new-thumbnail.jpg');

      const post = await prisma.post.create({
        data: {
          title: 'Post with Thumbnail',
          slug: 'post-with-thumbnail',
          content: 'Content',
          authorId: user.id,
          thumbnailId: media1.id,
        },
      });

      const update = {
        thumbnailId: media2.id,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(200);
      expect(response.body.thumbnailId).toBe(media2.id);
      expect(response.body.thumbnail.filename).toBe('new-thumbnail.jpg');

      // Verify old media still exists
      const oldMedia = await prisma.media.findUnique({
        where: { id: media1.id },
      });
      expect(oldMedia).toBeTruthy();
    });

    it('should return 404 for non-existent thumbnailId in update', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const update = {
        thumbnailId: 99999,
      };

      const response = await request(app).patch(`/api/posts/${post.slug}`).set('Cookie', cookies).send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Media');
    });
  });

  describe('DELETE /api/posts/:slug', () => {
    it('should delete a post with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Post to Delete',
          slug: 'post-to-delete',
          content: 'Content',
          authorId: user.id,
        },
      });

      const response = await request(app).delete(`/api/posts/${post.slug}`).set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: post.id,
        title: 'Post to Delete',
        slug: 'post-to-delete',
      });

      // Verify deletion in database
      const deletedPost = await prisma.post.findUnique({
        where: { slug: 'post-to-delete' },
      });
      expect(deletedPost).toBeNull();
    });

    it('should delete post with categories', async () => {
      const { user, cookies } = await createAuthenticatedUser();
      const { category1 } = await createTestCategories();

      const post = await prisma.post.create({
        data: {
          title: 'Post with Relations',
          slug: 'post-with-relations',
          content: 'Content',
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
        },
      });

      const response = await request(app).delete(`/api/posts/${post.slug}`).set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(1);

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();

      // Verify category still exists
      const category = await prisma.category.findUnique({
        where: { id: category1.id },
      });
      expect(category).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser();

      const post = await prisma.post.create({
        data: {
          title: 'Protected Post',
          slug: 'protected-post',
          content: 'Content',
          authorId: user.id,
        },
      });

      const response = await request(app).delete(`/api/posts/${post.slug}`);

      expect(response.status).toBe(401);

      // Verify post still exists
      const existingPost = await prisma.post.findUnique({
        where: { slug: 'protected-post' },
      });
      expect(existingPost).toBeTruthy();
    });

    it('should return 404 for non-existent post', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).delete('/api/posts/non-existent-slug').set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app).delete('/api/posts/invalid slug!').set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 for title exceeding max length (200 chars)', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const longTitle = 'a'.repeat(201);
      const newPost = {
        title: longTitle,
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
    });

    it('should handle special characters in title', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Test Post: Special & Characters!',
        content: 'Content',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.slug).toMatch(/^test-post-special-characters/);
    });

    it('should allow empty content (content is optional)', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Empty Content Post',
        content: '',
        authorId: user.id,
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('');
    });

    it('should handle empty array for categoryIds', async () => {
      const { user, cookies } = await createAuthenticatedUser();

      const newPost = {
        title: 'Post with Empty Arrays',
        content: 'Content',
        authorId: user.id,
        categoryIds: [],
      };

      const response = await request(app).post('/api/posts').set('Cookie', cookies).send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.categories).toHaveLength(0);
    });
  });
});
