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
        name: 'Test User',
        email: 'test@example.com',
      },
    })

    testPost = await prisma.post.create({
      data: {
        title: 'Test Post',
        content: 'Test content',
        published: true,
        authorId: testUser.id,
      },
    })
  })

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
      })
    })
  })

  describe('POST /signup', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Alice',
        email: 'alice@example.com',
      }

      const response = await request(app).post('/signup').send(newUser)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(newUser)
      expect(response.body).toHaveProperty('id')
    })

    it('should create a new user with posts', async () => {
      const newUser = {
        name: 'Bob',
        email: 'bob@example.com',
        posts: [
          {
            title: 'Bob First Post',
            content: 'Hello world',
          },
        ],
      }

      const response = await request(app).post('/signup').send(newUser)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'Bob',
        email: 'bob@example.com',
      })

      // Verify post was created
      const posts = await prisma.post.findMany({
        where: { authorId: response.body.id },
      })
      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Bob First Post')
    })
  })

  describe('POST /post', () => {
    it('should create a new post for existing user', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        authorEmail: testUser.email,
      }

      const response = await request(app).post('/post').send(newPost)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'New Post',
        content: 'New content',
        authorId: testUser.id,
      })
    })
  })

  describe('GET /post/:id', () => {
    it('should return a specific post', async () => {
      const response = await request(app).get(`/post/${testPost.id}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'Test Post',
        content: 'Test content',
      })
    })

    it('should return null for non-existent post', async () => {
      const response = await request(app).get('/post/99999')

      expect(response.status).toBe(200)
      expect(response.body).toBeNull()
    })
  })

  describe('PUT /post/:id/views', () => {
    it('should increment post view count', async () => {
      const response = await request(app).put(`/post/${testPost.id}/views`)

      expect(response.status).toBe(200)
      expect(response.body.viewCount).toBe(1)

      // Increment again
      const response2 = await request(app).put(`/post/${testPost.id}/views`)
      expect(response2.body.viewCount).toBe(2)
    })

    it('should return error for non-existent post', async () => {
      const response = await request(app).put('/post/99999/views')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('does not exist')
    })
  })

  describe('PUT /publish/:id', () => {
    it('should toggle post published status', async () => {
      // Initially published
      expect(testPost.published).toBe(true)

      // Toggle to unpublished
      const response = await request(app).put(`/publish/${testPost.id}`)
      expect(response.status).toBe(200)
      expect(response.body.published).toBe(false)

      // Toggle back to published
      const response2 = await request(app).put(`/publish/${testPost.id}`)
      expect(response2.body.published).toBe(true)
    })

    it('should return error for non-existent post', async () => {
      const response = await request(app).put('/publish/99999')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /user/:id/drafts', () => {
    it('should return user drafts', async () => {
      // Create a draft post
      await prisma.post.create({
        data: {
          title: 'Draft Post',
          content: 'Draft content',
          published: false,
          authorId: testUser.id,
        },
      })

      const response = await request(app).get(`/user/${testUser.id}/drafts`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Draft Post')
      expect(response.body[0].published).toBe(false)
    })

    it('should not return published posts', async () => {
      const response = await request(app).get(`/user/${testUser.id}/drafts`)

      expect(response.status).toBe(200)
      // Should not include the published testPost
      expect(response.body).toHaveLength(0)
    })
  })

  describe('GET /feed', () => {
    it('should return published posts', async () => {
      const response = await request(app).get('/feed')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toHaveProperty('author')
      expect(response.body[0].author.name).toBe('Test User')
    })

    it('should filter posts by search string', async () => {
      await prisma.post.create({
        data: {
          title: 'Unique Title',
          content: 'Content',
          published: true,
          authorId: testUser.id,
        },
      })

      const response = await request(app).get('/feed?searchString=Unique')

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
            content: 'Content 2',
            published: true,
            authorId: testUser.id,
          },
          {
            title: 'Post 3',
            content: 'Content 3',
            published: true,
            authorId: testUser.id,
          },
        ],
      })

      const response = await request(app).get('/feed?take=2&skip=1')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
    })
  })

  describe('DELETE /post/:id', () => {
    it('should delete a post', async () => {
      const response = await request(app).delete(`/post/${testPost.id}`)

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
