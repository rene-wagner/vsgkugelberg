import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { getPrismaClient, createTestUserWithPassword } from '../helpers'

const prisma = getPrismaClient()

describe('Posts API Integration Tests', () => {
  const testPassword = 'Password123'
  const testUsername = 'testauthor'
  const testEmail = 'testauthor@example.com'

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

  // Helper to create test categories
  async function createTestCategories() {
    const category1 = await prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech articles',
      },
    })

    const category2 = await prisma.category.create({
      data: {
        name: 'Science',
        slug: 'science',
        description: 'Science articles',
      },
    })

    return { category1, category2 }
  }

  // Helper to create test tags
  async function createTestTags() {
    const tag1 = await prisma.tag.create({
      data: {
        name: 'JavaScript',
        slug: 'javascript',
      },
    })

    const tag2 = await prisma.tag.create({
      data: {
        name: 'Node.js',
        slug: 'nodejs',
      },
    })

    return { tag1, tag2 }
  }

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const { user } = await createAuthenticatedUser()

      await prisma.post.create({
        data: {
          title: 'Test Post 1',
          slug: 'test-post-1',
          content: 'Content 1',
          published: true,
          authorId: user.id,
        },
      })

      await prisma.post.create({
        data: {
          title: 'Test Post 2',
          slug: 'test-post-2',
          content: 'Content 2',
          published: false,
          authorId: user.id,
        },
      })

      const response = await request(app).get('/api/posts')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('title')
      expect(response.body[0]).toHaveProperty('slug')
      expect(response.body[0]).toHaveProperty('content')
      expect(response.body[0]).toHaveProperty('published')
      expect(response.body[0]).toHaveProperty('author')
      expect(response.body[0]).toHaveProperty('categories')
      expect(response.body[0]).toHaveProperty('tags')
      expect(response.body[0].author).not.toHaveProperty('password')
    })

    it('should filter posts by published status (true)', async () => {
      const { user } = await createAuthenticatedUser()

      await prisma.post.create({
        data: {
          title: 'Published Post',
          slug: 'published-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      })

      await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      })

      const response = await request(app).get('/api/posts?published=true')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].published).toBe(true)
      expect(response.body[0].title).toBe('Published Post')
    })

    it('should filter posts by published status (false)', async () => {
      const { user } = await createAuthenticatedUser()

      await prisma.post.create({
        data: {
          title: 'Published Post',
          slug: 'published-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      })

      await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      })

      const response = await request(app).get('/api/posts?published=false')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].published).toBe(false)
      expect(response.body[0].title).toBe('Draft Post')
    })

    it('should filter posts by category slug', async () => {
      const { user } = await createAuthenticatedUser()
      const { category1, category2 } = await createTestCategories()

      const post1 = await prisma.post.create({
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
      })

      const post2 = await prisma.post.create({
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
      })

      const response = await request(app).get('/api/posts?category=technology')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Tech Post')
    })

    it('should filter posts by tag slug', async () => {
      const { user } = await createAuthenticatedUser()
      const { tag1, tag2 } = await createTestTags()

      await prisma.post.create({
        data: {
          title: 'JavaScript Post',
          slug: 'javascript-post',
          content: 'Content',
          published: true,
          authorId: user.id,
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

      await prisma.post.create({
        data: {
          title: 'Node.js Post',
          slug: 'nodejs-post',
          content: 'Content',
          published: true,
          authorId: user.id,
          tags: {
            connect: [{ id: tag2.id }],
          },
        },
      })

      const response = await request(app).get('/api/posts?tag=javascript')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('JavaScript Post')
    })

    it('should combine filters (published + category + tag)', async () => {
      const { user } = await createAuthenticatedUser()
      const { category1 } = await createTestCategories()
      const { tag1 } = await createTestTags()

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
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

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
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

      const response = await request(app).get(
        '/api/posts?published=true&category=technology&tag=javascript',
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Matching Post')
    })

    it('should return empty array when no posts match filters', async () => {
      const { user } = await createAuthenticatedUser()

      await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          published: true,
          authorId: user.id,
        },
      })

      const response = await request(app).get(
        '/api/posts?category=nonexistent',
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })
  })

  describe('GET /api/posts/:slug', () => {
    it('should return a single post by slug', async () => {
      const { user } = await createAuthenticatedUser()

      await prisma.post.create({
        data: {
          title: 'Single Post',
          slug: 'single-post',
          content: 'Test content',
          published: true,
          authorId: user.id,
        },
      })

      const response = await request(app).get('/api/posts/single-post')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'Single Post',
        slug: 'single-post',
        content: 'Test content',
        published: true,
      })
      expect(response.body).toHaveProperty('author')
      expect(response.body.author).toMatchObject({
        id: user.id,
        username: testUsername,
        email: testEmail,
      })
      expect(response.body.author).not.toHaveProperty('password')
    })

    it('should return post with categories and tags', async () => {
      const { user } = await createAuthenticatedUser()
      const { category1 } = await createTestCategories()
      const { tag1 } = await createTestTags()

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
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

      const response = await request(app).get('/api/posts/post-with-relations')

      expect(response.status).toBe(200)
      expect(response.body.categories).toHaveLength(1)
      expect(response.body.categories[0]).toMatchObject({
        name: 'Technology',
        slug: 'technology',
      })
      expect(response.body.tags).toHaveLength(1)
      expect(response.body.tags[0]).toMatchObject({
        name: 'JavaScript',
        slug: 'javascript',
      })
    })

    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/api/posts/non-existent-slug')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('statusCode', 404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app).get('/api/posts/invalid slug!')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('statusCode', 400)
    })
  })

  describe('POST /api/posts', () => {
    it('should create a post with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'New Post',
        content: 'New content',
        published: true,
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: 'New Post',
        content: 'New content',
        published: true,
      })
      expect(response.body).toHaveProperty('slug')
      expect(response.body.slug).toBe('new-post')
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('author')
      expect(response.body).toHaveProperty('categories')
      expect(response.body).toHaveProperty('tags')

      // Verify in database
      const post = await prisma.post.findUnique({
        where: { slug: 'new-post' },
      })
      expect(post).toBeTruthy()
    })

    it('should create a post with categories and tags', async () => {
      const { user, cookies } = await createAuthenticatedUser()
      const { category1, category2 } = await createTestCategories()
      const { tag1, tag2 } = await createTestTags()

      const newPost = {
        title: 'Post with Relations',
        content: 'Content',
        published: false,
        authorId: user.id,
        categoryIds: [category1.id, category2.id],
        tagIds: [tag1.id, tag2.id],
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.categories).toHaveLength(2)
      expect(response.body.tags).toHaveLength(2)
    })

    it('should generate unique slug from title', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post1 = {
        title: 'Test Post',
        content: 'Content 1',
        authorId: user.id,
      }

      const response1 = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(post1)

      expect(response1.status).toBe(201)
      expect(response1.body.slug).toBe('test-post')

      // Create another post with same title
      const post2 = {
        title: 'Test Post',
        content: 'Content 2',
        authorId: user.id,
      }

      const response2 = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(post2)

      expect(response2.status).toBe(201)
      expect(response2.body.slug).toMatch(/^test-post-\w+$/)
      expect(response2.body.slug).not.toBe('test-post')
    })

    it('should default published to false when not provided', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Draft Post',
        content: 'Content',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.published).toBe(false)
    })

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser()

      const newPost = {
        title: 'Unauthorized Post',
        content: 'Content',
        authorId: user.id,
      }

      const response = await request(app).post('/api/posts').send(newPost)

      expect(response.status).toBe(401)
    })

    it('should return 400 for missing title', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        content: 'Content',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(400)
    })

    it('should allow missing content (content is optional)', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'No Content Post',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.content).toBeNull()
    })

    it('should return 400 for missing authorId', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'No Author Post',
        content: 'Content',
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(400)
    })

    it('should return 404 for non-existent author', async () => {
      const { cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Invalid Author',
        content: 'Content',
        authorId: 99999,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Author')
    })

    it('should return 404 for non-existent category', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Invalid Category',
        content: 'Content',
        authorId: user.id,
        categoryIds: [99999],
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Category')
    })

    it('should return 404 for non-existent tag', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Invalid Tag',
        content: 'Content',
        authorId: user.id,
        tagIds: [99999],
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Tag')
    })

    it('should return 400 for invalid published type', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Invalid Published',
        content: 'Content',
        authorId: user.id,
        published: 'not-a-boolean',
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/posts/:slug', () => {
    it('should update post title with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Content',
          authorId: user.id,
        },
      })

      const update = {
        title: 'Updated Title',
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Title')
      expect(response.body.slug).toBe('updated-title')
    })

    it('should update post content', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Original content',
          authorId: user.id,
        },
      })

      const update = {
        content: 'Updated content',
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.content).toBe('Updated content')
      expect(response.body.slug).toBe('test-post')
    })

    it('should update post published status', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content',
          published: false,
          authorId: user.id,
        },
      })

      const update = {
        published: true,
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.published).toBe(true)
    })

    it('should update multiple fields at once', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Original Post',
          slug: 'original-post',
          content: 'Original content',
          published: false,
          authorId: user.id,
        },
      })

      const update = {
        title: 'Updated Post',
        content: 'Updated content',
        published: true,
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        title: 'Updated Post',
        content: 'Updated content',
        published: true,
      })
      expect(response.body.slug).toBe('updated-post')
    })

    it('should update categories', async () => {
      const { user, cookies } = await createAuthenticatedUser()
      const { category1, category2 } = await createTestCategories()

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
      })

      const update = {
        categoryIds: [category2.id],
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.categories).toHaveLength(1)
      expect(response.body.categories[0].id).toBe(category2.id)
    })

    it('should update tags', async () => {
      const { user, cookies } = await createAuthenticatedUser()
      const { tag1, tag2 } = await createTestTags()

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

      const update = {
        tagIds: [tag2.id],
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.tags).toHaveLength(1)
      expect(response.body.tags[0].id).toBe(tag2.id)
    })

    it('should regenerate slug when title changes', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Content',
          authorId: user.id,
        },
      })

      const update = {
        title: 'Completely New Title',
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.slug).toBe('completely-new-title')

      // Verify old slug doesn't exist
      const oldPost = await prisma.post.findUnique({
        where: { slug: 'original-title' },
      })
      expect(oldPost).toBeNull()
    })

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      })

      const update = {
        title: 'Updated Title',
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .send(update)

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent post', async () => {
      const { cookies } = await createAuthenticatedUser()

      const update = {
        title: 'Updated Title',
      }

      const response = await request(app)
        .patch('/api/posts/non-existent-slug')
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 404 for non-existent category in update', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      })

      const update = {
        categoryIds: [99999],
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Category')
    })

    it('should return 404 for non-existent tag in update', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          authorId: user.id,
        },
      })

      const update = {
        tagIds: [99999],
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Tag')
    })

    it('should allow partial updates', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Original Title',
          slug: 'original-title',
          content: 'Original content',
          published: false,
          authorId: user.id,
        },
      })

      const update = {
        published: true,
      }

      const response = await request(app)
        .patch(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)
        .send(update)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Original Title')
      expect(response.body.content).toBe('Original content')
      expect(response.body.published).toBe(true)
    })
  })

  describe('DELETE /api/posts/:slug', () => {
    it('should delete a post with authentication', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Post to Delete',
          slug: 'post-to-delete',
          content: 'Content',
          authorId: user.id,
        },
      })

      const response = await request(app)
        .delete(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: post.id,
        title: 'Post to Delete',
        slug: 'post-to-delete',
      })

      // Verify deletion in database
      const deletedPost = await prisma.post.findUnique({
        where: { slug: 'post-to-delete' },
      })
      expect(deletedPost).toBeNull()
    })

    it('should delete post with categories and tags', async () => {
      const { user, cookies } = await createAuthenticatedUser()
      const { category1 } = await createTestCategories()
      const { tag1 } = await createTestTags()

      const post = await prisma.post.create({
        data: {
          title: 'Post with Relations',
          slug: 'post-with-relations',
          content: 'Content',
          authorId: user.id,
          categories: {
            connect: [{ id: category1.id }],
          },
          tags: {
            connect: [{ id: tag1.id }],
          },
        },
      })

      const response = await request(app)
        .delete(`/api/posts/${post.slug}`)
        .set('Cookie', cookies)

      expect(response.status).toBe(200)
      expect(response.body.categories).toHaveLength(1)
      expect(response.body.tags).toHaveLength(1)

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      })
      expect(deletedPost).toBeNull()

      // Verify categories and tags still exist
      const category = await prisma.category.findUnique({
        where: { id: category1.id },
      })
      const tag = await prisma.tag.findUnique({ where: { id: tag1.id } })
      expect(category).toBeTruthy()
      expect(tag).toBeTruthy()
    })

    it('should return 401 without authentication', async () => {
      const { user } = await createAuthenticatedUser()

      const post = await prisma.post.create({
        data: {
          title: 'Protected Post',
          slug: 'protected-post',
          content: 'Content',
          authorId: user.id,
        },
      })

      const response = await request(app).delete(`/api/posts/${post.slug}`)

      expect(response.status).toBe(401)

      // Verify post still exists
      const existingPost = await prisma.post.findUnique({
        where: { slug: 'protected-post' },
      })
      expect(existingPost).toBeTruthy()
    })

    it('should return 404 for non-existent post', async () => {
      const { cookies } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/posts/non-existent-slug')
        .set('Cookie', cookies)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('statusCode', 404)
      expect(response.body.message).toContain('not found')
    })

    it('should return 400 for invalid slug format', async () => {
      const { cookies } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/posts/invalid slug!')
        .set('Cookie', cookies)

      expect(response.status).toBe(400)
    })
  })

  describe('Edge Cases', () => {
    it('should return 400 for title exceeding max length (200 chars)', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const longTitle = 'a'.repeat(201)
      const newPost = {
        title: longTitle,
        content: 'Content',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(400)
      expect(response.body.message).toBeTruthy()
    })

    it('should handle special characters in title', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Test Post: Special & Characters!',
        content: 'Content',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.slug).toMatch(/^test-post-special-characters/)
    })

    it('should allow empty content (content is optional)', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Empty Content Post',
        content: '',
        authorId: user.id,
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.content).toBe('')
    })

    it('should handle empty arrays for categoryIds and tagIds', async () => {
      const { user, cookies } = await createAuthenticatedUser()

      const newPost = {
        title: 'Post with Empty Arrays',
        content: 'Content',
        authorId: user.id,
        categoryIds: [],
        tagIds: [],
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', cookies)
        .send(newPost)

      expect(response.status).toBe(201)
      expect(response.body.categories).toHaveLength(0)
      expect(response.body.tags).toHaveLength(0)
    })
  })
})
