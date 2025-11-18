import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { getPrismaClient, createTestUserWithPassword } from '../helpers'

const prisma = getPrismaClient()

describe('Tags API Integration Tests', () => {
  const testPassword = 'Password123'
  const testUsername = 'testuser'
  const testEmail = 'testuser@example.com'

  // Helper to create authenticated request
  async function createAuthenticatedUser() {
    const user = await createTestUserWithPassword(
      testUsername,
      testEmail,
      testPassword,
    )

    // Login to get JWT token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUsername,
        password: testPassword,
      })

    const cookies = loginResponse.headers['set-cookie']
    return { user, cookies }
  }

  describe('GET /api/tags', () => {
    it('should return all tags with post counts', async () => {
      await prisma.tag.createMany({
        data: [
          { name: 'JavaScript', slug: 'javascript' },
          { name: 'Python', slug: 'python' },
        ],
      })

      const response = await request(app).get('/api/tags')

      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('slug')
      expect(response.body[0]).toHaveProperty('createdAt')
      expect(response.body[0]).toHaveProperty('updatedAt')
      expect(response.body[0]).toHaveProperty('_count')
      expect(response.body[0]._count).toHaveProperty('posts')
      expect(typeof response.body[0]._count.posts).toBe('number')
    })

    it('should return empty array when no tags exist', async () => {
      const response = await request(app).get('/api/tags')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should return tags sorted alphabetically by name', async () => {
      await prisma.tag.createMany({
        data: [
          { name: 'Zebra', slug: 'zebra' },
          { name: 'Alpha', slug: 'alpha' },
          { name: 'Beta', slug: 'beta' },
        ],
      })

      const response = await request(app).get('/api/tags')

      expect(response.status).toBe(200)
      expect(response.body[0].name).toBe('Alpha')
      expect(response.body[1].name).toBe('Beta')
      expect(response.body[2].name).toBe('Zebra')
    })

    it('should include correct post counts', async () => {
      const { user } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: { name: 'Popular', slug: 'popular' },
      })

      // Create posts with this tag
      await prisma.post.createMany({
        data: [
          { title: 'Post 1', slug: 'post-1', authorId: user.id },
          { title: 'Post 2', slug: 'post-2', authorId: user.id },
        ],
      })

      // Link posts to tag
      const posts = await prisma.post.findMany({
        where: { authorId: user.id },
      })
      await prisma.tag.update({
        where: { id: tag.id },
        data: {
          posts: {
            connect: posts.map(p => ({ id: p.id })),
          },
        },
      })

      const response = await request(app).get('/api/tags')

      const popularTag = response.body.find((t: any) => t.slug === 'popular')
      expect(popularTag).toBeTruthy()
      expect(popularTag._count.posts).toBe(2)
    })
  })

  describe('GET /api/tags/:slug', () => {
    it('should return a single tag with posts array', async () => {
      const tag = await prisma.tag.create({
        data: {
          name: 'TypeScript',
          slug: 'typescript',
        },
      })

      const response = await request(app).get('/api/tags/typescript')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: tag.id,
        name: 'TypeScript',
        slug: 'typescript',
      })
      expect(response.body).toHaveProperty('posts')
      expect(Array.isArray(response.body.posts)).toBe(true)
    })

    it('should include author details in posts', async () => {
      const { user } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: { name: 'Testing', slug: 'testing' },
      })

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          authorId: user.id,
          tags: {
            connect: { id: tag.id },
          },
        },
      })

      const response = await request(app).get('/api/tags/testing')

      expect(response.status).toBe(200)
      expect(response.body.posts).toHaveLength(1)
      expect(response.body.posts[0]).toMatchObject({
        id: post.id,
        title: 'Test Post',
        slug: 'test-post',
        published: false,
      })
      expect(response.body.posts[0]).toHaveProperty('author')
      expect(response.body.posts[0].author).toMatchObject({
        id: user.id,
        username: testUsername,
        email: testEmail,
      })
    })

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app).get('/api/tags/non-existent')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('statusCode', 404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app).get('/api/tags/invalid slug!')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('statusCode', 400)
    })

    it('should return empty posts array when tag has no posts', async () => {
      await prisma.tag.create({
        data: { name: 'Empty', slug: 'empty' },
      })

      const response = await request(app).get('/api/tags/empty')

      expect(response.status).toBe(200)
      expect(response.body.posts).toEqual([])
    })
  })

  describe('POST /api/tags', () => {
    it('should create a tag with authentication', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newTag = {
        name: 'React',
      }

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'React',
      })
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('slug')
      expect(response.body.slug).toBe('react')

      // Verify in database
      const tag = await prisma.tag.findUnique({
        where: { slug: 'react' },
      })
      expect(tag).toBeTruthy()
    })

    it('should generate unique slug from name', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag1 = { name: 'Vue.js' }

      const response1 = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(tag1)

      expect(response1.status).toBe(201)
      expect(response1.body.slug).toBe('vuejs')
    })

    it('should handle special characters in name', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newTag = {
        name: 'C++ Programming!',
      }

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(201)
      expect(response.body.slug).toMatch(/^c-programming/)
    })

    it('should return 401 without authentication', async () => {
      const newTag = {
        name: 'Unauthorized Tag',
      }

      const response = await request(app)
        .post('/api/tags')
        .send(newTag)

      expect(response.status).toBe(401)
    })

    it('should return 400 for missing name', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newTag = {}

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(400)
    })

    it('should return 400 for name too short', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newTag = {
        name: 'A', // Only 1 character
      }

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(400)
    })

    it('should return 400 for name too long', async () => {
      const { cookies } = await createAuthenticatedUser()

      const longName = 'a'.repeat(51)
      const newTag = {
        name: longName,
      }

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(400)
    })

    it('should return 409 for duplicate name (case insensitive)', async () => {
      const { cookies } = await createAuthenticatedUser()

      await prisma.tag.create({
        data: {
          name: 'NodeJS',
          slug: 'nodejs',
        },
      })

      const newTag = {
        name: 'NODEJS', // Different case
      }

      const response = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send(newTag)

      expect(response.status).toBe(409)
      expect(response.body.message).toContain('already exists')
    })

    it('should handle slug collision with counter', async () => {
      const { cookies } = await createAuthenticatedUser()

      // Create first tag
      await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send({ name: 'Test Tag' })

      // Create second tag with same base slug
      const response2 = await request(app)
        .post('/api/tags')
        .set('Cookie', cookies)
        .send({ name: 'Test-Tag' }) // Will slugify to 'test-tag'

      expect(response2.status).toBe(201)
      expect(response2.body.slug).toMatch(/^test-tag(-\d+)?$/)
    })
  })

  describe('PATCH /api/tags/:slug', () => {
    it('should update tag name with authentication', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
        },
      })

      const update = {
        name: 'Updated Name',
      }

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Updated Name')
      expect(response.body.slug).toBe('updated-name')
    })

    it('should regenerate slug when name changes', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: {
          name: 'Original',
          slug: 'original',
        },
      })

      const update = {
        name: 'Completely New',
      }

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.slug).toBe('completely-new')

      // Verify old slug doesn't exist
      const oldTag = await prisma.tag.findUnique({
        where: { slug: 'original' },
      })
      expect(oldTag).toBeNull()
    })

    it('should return 401 without authentication', async () => {
      const tag = await prisma.tag.create({
        data: {
          name: 'Test',
          slug: 'test',
        },
      })

      const update = {
        name: 'Updated',
      }

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .send(update)

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent tag', async () => {
      const { cookies } = await createAuthenticatedUser()

      const update = {
        name: 'Updated',
      }

      const response = await request(app)
        .patch('/api/tags/non-existent')
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 409 for duplicate name', async () => {
      const { cookies } = await createAuthenticatedUser()

      await prisma.tag.create({
        data: {
          name: 'Existing Tag',
          slug: 'existing-tag',
        },
      })

      const tag = await prisma.tag.create({
        data: {
          name: 'Another Tag',
          slug: 'another-tag',
        },
      })

      const update = {
        name: 'Existing Tag',
      }

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(409)
      expect(response.body.message).toContain('already exists')
    })

    it('should allow updating to same name', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: {
          name: 'Same Name',
          slug: 'same-name',
        },
      })

      const update = {
        name: 'Same Name',
      }

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Same Name')
    })

    it('should handle empty update object', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: {
          name: 'Original',
          slug: 'original',
        },
      })

      const response = await request(app)
        .patch(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)
        .send({})

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Original')
    })
  })

  describe('DELETE /api/tags/:slug', () => {
    it('should delete a tag with no posts', async () => {
      const { cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: {
          name: 'Tag to Delete',
          slug: 'tag-to-delete',
        },
      })

      const response = await request(app)
        .delete(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: tag.id,
        name: 'Tag to Delete',
        slug: 'tag-to-delete',
      })

      // Verify deletion in database
      const deletedTag = await prisma.tag.findUnique({
        where: { slug: 'tag-to-delete' },
      })
      expect(deletedTag).toBeNull()
    })

    it('should return 409 when tag has posts', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: { name: 'Protected Tag', slug: 'protected-tag' },
      })

      // Create a post with this tag
      await prisma.post.create({
        data: {
          title: 'Post with Tag',
          slug: 'post-with-tag',
          authorId: user.id,
          tags: {
            connect: { id: tag.id },
          },
        },
      })

      const response = await request(app)
        .delete(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)

      expect(response.status).toBe(409)
      expect(response.body.message).toContain('Cannot delete tag')
      expect(response.body.message).toContain('posts still reference it')

      // Verify tag still exists
      const existingTag = await prisma.tag.findUnique({
        where: { slug: 'protected-tag' },
      })
      expect(existingTag).toBeTruthy()
    })

    it('should show correct post count in error message', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const tag = await prisma.tag.create({
        data: { name: 'Popular Tag', slug: 'popular-tag' },
      })

      // Create multiple posts with this tag
      await prisma.post.createMany({
        data: [
          { title: 'Post 1', slug: 'delete-post-1', authorId: user.id },
          { title: 'Post 2', slug: 'delete-post-2', authorId: user.id },
          { title: 'Post 3', slug: 'delete-post-3', authorId: user.id },
        ],
      })

      const posts = await prisma.post.findMany({
        where: { authorId: user.id },
      })
      await prisma.tag.update({
        where: { id: tag.id },
        data: {
          posts: {
            connect: posts.map(p => ({ id: p.id })),
          },
        },
      })

      const response = await request(app)
        .delete(`/api/tags/${tag.slug}`)
        .set('Cookie', cookies)

      expect(response.status).toBe(409)
      expect(response.body.message).toContain('3 posts')
    })

    it('should return 401 without authentication', async () => {
      const tag = await prisma.tag.create({
        data: {
          name: 'Protected Tag',
          slug: 'protected-tag-2',
        },
      })

      const response = await request(app).delete(
        `/api/tags/${tag.slug}`,
      )

      expect(response.status).toBe(401)

      // Verify tag still exists
      const existingTag = await prisma.tag.findUnique({
        where: { slug: 'protected-tag-2' },
      })
      expect(existingTag).toBeTruthy()
    })

    it('should return 404 for non-existent tag', async () => {
      const { cookies } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/tags/non-existent-slug')
        .set('Cookie', cookies)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('statusCode', 404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 400 for invalid slug format', async () => {
      const { cookies } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/tags/invalid slug!')
        .set('Cookie', cookies)

      expect(response.status).toBe(400)
    })
  })
})
