import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/setup-test-db';
import { createAuthenticatedUser } from '../helpers/auth-helper';
import { testPosts } from '../fixtures/test-data';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts', () => {
    type ResponseBody = {
      id: number;
      title: string;
      slug: string;
      content: string;
      published: boolean;
      createdAt: string;
      updatedAt: string;
      authorId?: number;
      author?: any;
      categories?: any[];
      tags?: any[];
    };

    it('should return all posts without authentication', async () => {
      const { user } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      return request(app.getHttpServer() as http.Server)
        .get('/posts')
        .expect(200)
        .expect((res) => {
          const body = res.body as ResponseBody[];

          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });

    it('should filter posts by published status', async () => {
      const { user } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });
      await prisma.post.create({
        data: { ...testPosts.draft, authorId: user.id },
      });

      const response: { body: ResponseBody[] } = await request(
        app.getHttpServer() as http.Server,
      )
        .get('/posts?published=true')
        .expect(200);

      expect(
        response.body.every((post: ResponseBody) => post.published === true),
      ).toBe(true);
    });
  });

  describe('GET /posts/:slug', () => {
    it('should return a post by slug', async () => {
      const { user } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      return request(app.getHttpServer() as http.Server)
        .get(`/posts/${testPosts.published.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('slug', testPosts.published.slug);
          expect(res.body).toHaveProperty('title', testPosts.published.title);
        });
    });

    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/posts/non-existent-slug')
        .expect(404);
    });
  });

  describe('POST /posts', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/posts')
        .send({
          title: 'New Post',
          slug: 'new-post',
          content: 'Content',
          published: true,
          authorId: 1,
        })
        .expect(401);
    });

    it('should create a post when authenticated', async () => {
      const { user, cookie } = await createAuthenticatedUser(app);

      return request(app.getHttpServer() as http.Server)
        .post('/posts')
        .set('Cookie', cookie)
        .send({
          title: 'New Post',
          slug: 'new-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('slug', 'new-post');
          expect(res.body).toHaveProperty('title', 'New Post');
        });
    });
  });

  describe('PATCH /posts/:slug', () => {
    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      return request(app.getHttpServer() as http.Server)
        .patch(`/posts/${testPosts.published.slug}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should update a post when authenticated', async () => {
      const { user, cookie } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      return request(app.getHttpServer() as http.Server)
        .patch(`/posts/${testPosts.published.slug}`)
        .set('Cookie', cookie)
        .send({ title: 'Updated Title' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Updated Title');
        });
    });
  });

  describe('DELETE /posts/:slug', () => {
    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser(app);

      await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      return request(app.getHttpServer() as http.Server)
        .delete(`/posts/${testPosts.published.slug}`)
        .expect(401);
    });

    it('should delete a post when authenticated', async () => {
      const { user, cookie } = await createAuthenticatedUser(app);

      const post = await prisma.post.create({
        data: { ...testPosts.published, authorId: user.id },
      });

      await request(app.getHttpServer() as http.Server)
        .delete(`/posts/${testPosts.published.slug}`)
        .set('Cookie', cookie)
        .expect(200);

      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();
    });
  });
});
