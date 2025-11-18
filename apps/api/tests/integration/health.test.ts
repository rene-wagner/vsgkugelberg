import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Health API Integration Tests', () => {
  describe('GET /api/health - Success Cases', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
    })

    it('should return JSON with status field set to "ok"', async () => {
      const response = await request(app).get('/api/health')

      expect(response.body).toHaveProperty('status', 'ok')
    })

    it('should return JSON with timestamp field', async () => {
      const response = await request(app).get('/api/health')

      expect(response.body).toHaveProperty('timestamp')
      expect(typeof response.body.timestamp).toBe('string')
    })

    it('should have valid ISO 8601 timestamp format', async () => {
      const response = await request(app).get('/api/health')

      const timestamp = response.body.timestamp
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      
      expect(timestamp).toMatch(iso8601Regex)
      
      // Also verify it's a valid date
      const date = new Date(timestamp)
      expect(date.toString()).not.toBe('Invalid Date')
    })

    it('should return timestamp close to current time', async () => {
      const beforeRequest = Date.now()
      const response = await request(app).get('/api/health')
      const afterRequest = Date.now()

      const timestamp = new Date(response.body.timestamp).getTime()
      
      // Timestamp should be between before and after request (with 1 second tolerance)
      expect(timestamp).toBeGreaterThanOrEqual(beforeRequest - 1000)
      expect(timestamp).toBeLessThanOrEqual(afterRequest + 1000)
    })
  })

  describe('GET /api/health - Response Structure', () => {
    it('should have exactly the expected fields', async () => {
      const response = await request(app).get('/api/health')

      const expectedKeys = ['status', 'timestamp']
      const actualKeys = Object.keys(response.body)

      expect(actualKeys.sort()).toEqual(expectedKeys.sort())
    })

    it('should not have extra fields', async () => {
      const response = await request(app).get('/api/health')

      expect(Object.keys(response.body).length).toBe(2)
    })

    it('should return status as a string', async () => {
      const response = await request(app).get('/api/health')

      expect(typeof response.body.status).toBe('string')
    })

    it('should return timestamp as a string', async () => {
      const response = await request(app).get('/api/health')

      expect(typeof response.body.timestamp).toBe('string')
    })
  })

  describe('GET /api/health - Content Type', () => {
    it('should return application/json content type', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    it('should have proper headers', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers).toHaveProperty('content-type')
      expect(response.headers['content-type']).toContain('application/json')
    })
  })

  describe('GET /api/health - Edge Cases', () => {
    it('should handle multiple rapid successive requests', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() => request(app).get('/api/health'))

      const responses = await Promise.all(promises)

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('ok')
        expect(response.body).toHaveProperty('timestamp')
      })
    })

    it('should work without authentication', async () => {
      // No authentication headers or cookies
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
    })

    it('should handle concurrent requests properly', async () => {
      const promise1 = request(app).get('/api/health')
      const promise2 = request(app).get('/api/health')
      const promise3 = request(app).get('/api/health')

      const [response1, response2, response3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ])

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response3.status).toBe(200)

      // Each should have their own timestamp
      expect(response1.body.timestamp).toBeDefined()
      expect(response2.body.timestamp).toBeDefined()
      expect(response3.body.timestamp).toBeDefined()
    })

    it('should return different timestamps for sequential requests', async () => {
      const response1 = await request(app).get('/api/health')
      
      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10))
      
      const response2 = await request(app).get('/api/health')

      expect(response1.body.timestamp).not.toBe(response2.body.timestamp)
    })
  })

  describe('GET /api/health - HTTP Methods', () => {
    it('should only accept GET requests', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
    })

    it('should not accept POST requests', async () => {
      const response = await request(app).post('/api/health')

      expect(response.status).not.toBe(200)
      expect([404, 405]).toContain(response.status)
    })

    it('should not accept PUT requests', async () => {
      const response = await request(app).put('/api/health')

      expect(response.status).not.toBe(200)
      expect([404, 405]).toContain(response.status)
    })

    it('should not accept DELETE requests', async () => {
      const response = await request(app).delete('/api/health')

      expect(response.status).not.toBe(200)
      expect([404, 405]).toContain(response.status)
    })
  })
})
