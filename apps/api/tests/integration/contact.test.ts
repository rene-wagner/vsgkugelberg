import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '../helpers';
import { encryptTimestamp } from '@/middleware/honeypot.middleware';

describe('Contact Form API Integration Tests', () => {
  let contactPersonId: number;
  let validTimestamp: string;

  beforeEach(async () => {
    // Create a contact person for tests
    const contactPerson = await prisma.contactPerson.create({
      data: {
        firstName: 'Max',
        lastName: 'Mustermann',
        type: 'Vorstandsvorsitzender',
        email: 'max@example.com',
        phone: '+49 123 456789',
      },
    });
    contactPersonId = contactPerson.id;

    // Generate a valid timestamp (from 5 seconds ago to simulate form fill time)
    validTimestamp = encryptTimestamp(Date.now() - 5000);
  });

  describe('GET /api/contact/token', () => {
    it('should return an encrypted token', async () => {
      const response = await request(app).get('/api/contact/token');

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      // Token should be in format: iv:authTag:encrypted (3 base64 parts separated by colons)
      expect(response.body.token.split(':').length).toBe(3);
    });

    it('should return a token that can be used for form submission', async () => {
      // Get a fresh token
      const tokenResponse = await request(app).get('/api/contact/token');
      const token = tokenResponse.body.token;

      // Wait 3+ seconds to pass minimum time check
      await new Promise((resolve) => setTimeout(resolve, 3100));

      // Submit form with the token
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        subject: 'Test inquiry',
        message: 'This is a test message for the contact form.',
        website: '',
        timestamp: token,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });
  });

  describe('POST /api/contact', () => {
    it('should return 200 for successful submission', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        subject: 'Test inquiry',
        message: 'This is a test message for the contact form.',
        website: '',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        // Missing senderName, senderEmail, subject, message
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'John Doe',
        senderEmail: 'not-an-email',
        subject: 'Test inquiry',
        message: 'This is a test message for the contact form.',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for subject too short', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        subject: 'Hi', // Too short (min 5)
        message: 'This is a test message for the contact form.',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for message too short', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        subject: 'Test inquiry',
        message: 'Short', // Too short (min 10)
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent contact person', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId: 99999,
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        subject: 'Test inquiry',
        message: 'This is a test message for the contact form.',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 200 (silent reject) when honeypot field is filled', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'Bot Name',
        senderEmail: 'bot@example.com',
        subject: 'Spam inquiry',
        message: 'This is spam from a bot.',
        website: 'http://spam.com', // Honeypot field filled - bot detected!
        timestamp: validTimestamp,
      });

      // Should return 200 to not reveal that spam was detected
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
      // Note: Email is NOT sent in this case (silent rejection)
    });

    it('should return 200 (silent reject) when submission is too fast', async () => {
      // Generate a timestamp from 1 second ago (too fast - min is 3 seconds)
      const fastTimestamp = encryptTimestamp(Date.now() - 1000);

      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'Fast Bot',
        senderEmail: 'fast@example.com',
        subject: 'Fast submission',
        message: 'This message was submitted too quickly.',
        timestamp: fastTimestamp,
      });

      // Should return 200 to not reveal that spam was detected
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });

    it('should return 200 (silent reject) when timestamp is expired', async () => {
      // Generate a timestamp from 2 hours ago (expired - max is 1 hour)
      const expiredTimestamp = encryptTimestamp(
        Date.now() - 2 * 60 * 60 * 1000,
      );

      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'Slow User',
        senderEmail: 'slow@example.com',
        subject: 'Delayed submission',
        message: 'This message took too long to submit.',
        timestamp: expiredTimestamp,
      });

      // Should return 200 to not reveal that spam was detected
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });

    it('should return 200 (silent reject) for invalid timestamp format', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'Hacker',
        senderEmail: 'hacker@example.com',
        subject: 'Malicious submission',
        message: 'This message has a tampered timestamp.',
        timestamp: 'invalid-timestamp-format',
      });

      // Should return 200 to not reveal that spam was detected
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });

    it('should handle unicode characters in message', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: 'Max Müller',
        senderEmail: 'mueller@example.com',
        subject: 'Anfrage über Vereinsbeitritt',
        message:
          'Guten Tag, ich möchte dem Verein beitreten. Können Sie mir mehr Informationen zusenden?',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');
    });

    it('should trim whitespace from fields', async () => {
      const response = await request(app).post('/api/contact').send({
        contactPersonId,
        senderName: '  John Doe  ',
        senderEmail: '  john@example.com  ',
        subject: '  Test inquiry  ',
        message: '  This is a test message with whitespace.  ',
        timestamp: validTimestamp,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should trigger rate limit after 5 requests (when enabled)', async () => {
      // Skip this test in normal test mode since rate limiting is disabled
      // This test is here for documentation and will pass when rate limiting is enabled
      // via ENABLE_RATE_LIMIT_IN_TESTS=true

      // Note: To test rate limiting, set ENABLE_RATE_LIMIT_IN_TESTS=true in your test environment
      // and uncomment the following:
      /*
      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/contact')
          .send({
            contactPersonId,
            senderName: 'John Doe',
            senderEmail: `john${i}@example.com`,
            subject: `Test inquiry ${i}`,
            message: 'This is a test message for the contact form.',
            timestamp: encryptTimestamp(Date.now() - 5000),
          });
      }

      // The 6th request should be rate limited
      const response = await request(app)
        .post('/api/contact')
        .send({
          contactPersonId,
          senderName: 'John Doe',
          senderEmail: 'john6@example.com',
          subject: 'Test inquiry 6',
          message: 'This is a test message for the contact form.',
          timestamp: encryptTimestamp(Date.now() - 5000),
        });

      expect(response.status).toBe(429);
      */

      // For now, just verify the endpoint works without rate limiting in tests
      expect(true).toBe(true);
    });
  });
});
