import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { getPrismaClient } from '../helpers'

const prisma = getPrismaClient()

describe('API Integration Tests', () => {
  // Test data
  let testUser: any
  let testPost: any

  beforeEach(async () => {
    // Seed test data before each test
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
      },
    })

    testPost = await prisma.post.create({
      data: {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        published: true,
        authorId: testUser.id,
      },
    })
  })

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/api/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      })
      expect(response.body[0]).not.toHaveProperty('password')
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'Password123',
      }

      const response = await request(app).post('/api/users').send(newUser)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        username: 'alice',
        email: 'alice@example.com',
      })
      expect(response.body).toHaveProperty('id')
      expect(response.body).not.toHaveProperty('password')
    })

    it('should return 400 for invalid user data', async () => {
      const newUser = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: 'weak',
      }

      const response = await request(app).post('/api/users').send(newUser)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post for existing user', async () => {
      const newPost = {
        title: 'New Post',
        slug: 'new-post',
        content: 'New content',
        authorEmail: testUser.email,
      }

      const response = await request(app).post('/api/posts').send(newPost)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'New Post',
        slug: 'new-post',
        content: 'New content',
        authorId: testUser.id,
      })
    })
  })

  describe('GET /api/posts/:id', () => {
    it('should return a specific post', async () => {
      const response = await request(app).get(`/api/posts/${testPost.id}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'Test Post',
        content: 'Test content',
      })
    })

    it('should return null for non-existent post', async () => {
      const response = await request(app).get('/api/posts/99999')

      expect(response.status).toBe(200)
      expect(response.body).toBeNull()
    })
  })

  describe('PUT /api/posts/:id/views', () => {
    it('should increment post view count', async () => {
      const response = await request(app).put(`/api/posts/${testPost.id}/views`)

      expect(response.status).toBe(200)
      expect(response.body.viewCount).toBe(1)

      // Increment again
      const response2 = await request(app).put(`/api/posts/${testPost.id}/views`)
      expect(response2.body.viewCount).toBe(2)
    })

    it('should return error for non-existent post', async () => {
      const response = await request(app).put('/api/posts/99999/views')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('does not exist')
    })
  })

  describe('PUT /api/posts/:id/publish', () => {
    it('should toggle post published status', async () => {
      // Initially published
      expect(testPost.published).toBe(true)

      // Toggle to unpublished
      const response = await request(app).put(`/api/posts/${testPost.id}/publish`)
      expect(response.status).toBe(200)
      expect(response.body.published).toBe(false)

      // Toggle back to published
      const response2 = await request(app).put(`/api/posts/${testPost.id}/publish`)
      expect(response2.body.published).toBe(true)
    })

    it('should return error for non-existent post', async () => {
      const response = await request(app).put('/api/posts/99999/publish')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/users/:id/drafts', () => {
    it('should return user drafts', async () => {
      // Create a draft post
      await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Draft content',
          published: false,
          authorId: testUser.id,
        },
      })

      const response = await request(app).get(`/api/users/${testUser.id}/drafts`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Draft Post')
      expect(response.body[0].published).toBe(false)
    })

    it('should not return published posts', async () => {
      const response = await request(app).get(`/api/users/${testUser.id}/drafts`)

      expect(response.status).toBe(200)
      // Should not include the published testPost
      expect(response.body).toHaveLength(0)
    })
  })

  describe('GET /api/posts/feed', () => {
    it('should return published posts', async () => {
      const response = await request(app).get('/api/posts/feed')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toHaveProperty('author')
      expect(response.body[0].author.username).toBe('testuser')
    })

    it('should filter posts by search string', async () => {
      await prisma.post.create({
        data: {
          title: 'Unique Title',
          slug: 'unique-title',
          content: 'Content',
          published: true,
          authorId: testUser.id,
        },
      })

      const response = await request(app).get('/api/posts/feed?searchString=Unique')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Unique Title')
    })

    it('should support pagination', async () => {
      // Create additional posts
      await prisma.post.createMany({
        data: [
          {
            title: 'Post 2',
            slug: 'post-2',
            content: 'Content 2',
            published: true,
            authorId: testUser.id,
          },
          {
            title: 'Post 3',
            slug: 'post-3',
            content: 'Content 3',
            published: true,
            authorId: testUser.id,
          },
        ],
      })

      const response = await request(app).get('/api/posts/feed?take=2&skip=1')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
    })
  })

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const response = await request(app).delete(`/api/posts/${testPost.id}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(testPost.id)

      // Verify post was deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: testPost.id },
      })
      expect(deletedPost).toBeNull()
    })
  })
})
