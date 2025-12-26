import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Events API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'eventadmin';
  const testEmail = 'eventadmin@example.com';

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

  describe('GET /api/events', () => {
    it('should return events within date range', async () => {
      // Create test events
      await prisma.event.create({
        data: {
          title: 'January Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      await prisma.event.create({
        data: {
          title: 'February Event',
          startDate: new Date('2024-02-15T10:00:00Z'),
          endDate: new Date('2024-02-15T12:00:00Z'),
          category: 'Sport',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('January Event');
    });

    it('should filter events by category', async () => {
      await prisma.event.create({
        data: {
          title: 'Sport Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Sport',
        },
      });

      await prisma.event.create({
        data: {
          title: 'Meeting Event',
          startDate: new Date('2024-01-16T10:00:00Z'),
          endDate: new Date('2024-01-16T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31&category=Sport',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Sport Event');
    });

    it('should expand recurring events within date range', async () => {
      // Create a weekly recurring event
      await prisma.event.create({
        data: {
          title: 'Weekly Training',
          startDate: new Date('2024-01-01T18:00:00Z'),
          endDate: new Date('2024-01-01T20:00:00Z'),
          category: 'Sport',
          recurrence: 'FREQ=WEEKLY;BYDAY=MO',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31',
      );

      expect(response.status).toBe(200);
      // Should have multiple instances (Mondays in January 2024: 1, 8, 15, 22, 29)
      expect(response.body.length).toBeGreaterThanOrEqual(4);
      expect(response.body[0].title).toBe('Weekly Training');
      expect(response.body[0].isRecurrenceInstance).toBe(true);
    });

    it('should return empty array when no events in range', async () => {
      await prisma.event.create({
        data: {
          title: 'Future Event',
          startDate: new Date('2025-01-15T10:00:00Z'),
          endDate: new Date('2025-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 400 when start is missing', async () => {
      const response = await request(app).get('/api/events?end=2024-01-31');

      expect(response.status).toBe(400);
    });

    it('should return 400 when end is missing', async () => {
      const response = await request(app).get('/api/events?start=2024-01-01');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app).get(
        '/api/events?start=invalid&end=2024-01-31',
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31&category=InvalidCategory',
      );

      expect(response.status).toBe(400);
    });

    it('should order events by start date', async () => {
      await prisma.event.create({
        data: {
          title: 'Later Event',
          startDate: new Date('2024-01-20T10:00:00Z'),
          endDate: new Date('2024-01-20T12:00:00Z'),
          category: 'Meeting',
        },
      });

      await prisma.event.create({
        data: {
          title: 'Earlier Event',
          startDate: new Date('2024-01-10T10:00:00Z'),
          endDate: new Date('2024-01-10T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Earlier Event');
      expect(response.body[1].title).toBe('Later Event');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return single event by ID', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Test description',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          location: 'Sports Hall',
          category: 'Sport',
        },
      });

      const response = await request(app).get(`/api/events/${event.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: event.id,
        title: 'Test Event',
        description: 'Test description',
        location: 'Sports Hall',
        category: 'Sport',
      });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app).get('/api/events/9999');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Event with ID 9999 not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/events/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/events', () => {
    it('should create event with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'New Event',
        description: 'Event description',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        location: 'Conference Room',
        category: 'Meeting',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'New Event',
        description: 'Event description',
        location: 'Conference Room',
        category: 'Meeting',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create recurring event', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Weekly Meeting',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T11:00:00Z',
        category: 'Meeting',
        recurrence: 'FREQ=WEEKLY;BYDAY=TU,TH',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(201);
      expect(response.body.recurrence).toBe('FREQ=WEEKLY;BYDAY=TU,TH');
    });

    it('should create full-day event', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Holiday',
        startDate: '2024-12-25T00:00:00Z',
        endDate: '2024-12-25T23:59:59Z',
        category: 'Social',
        isFullDay: true,
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(201);
      expect(response.body.isFullDay).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const newEvent = {
        title: 'Unauthorized Event',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        category: 'Meeting',
      };

      const response = await request(app).post('/api/events').send(newEvent);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing title', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        category: 'Meeting',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing startDate', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Test Event',
        endDate: '2024-01-15T12:00:00Z',
        category: 'Meeting',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing category', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Test Event',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid category', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Test Event',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        category: 'InvalidCategory',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid recurrence pattern', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newEvent = {
        title: 'Test Event',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        category: 'Meeting',
        recurrence: 'INVALID_RRULE',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Cookie', cookies)
        .send(newEvent);

      expect(response.status).toBe(400);
    });

    it('should accept all valid categories', async () => {
      const { cookies } = await createAuthenticatedUser();
      const categories = ['Meeting', 'Sport', 'Social', 'Other'];

      for (const category of categories) {
        const newEvent = {
          title: `${category} Event`,
          startDate: '2024-01-15T10:00:00Z',
          endDate: '2024-01-15T12:00:00Z',
          category,
        };

        const response = await request(app)
          .post('/api/events')
          .set('Cookie', cookies)
          .send(newEvent);

        expect(response.status).toBe(201);
        expect(response.body.category).toBe(category);
      }
    });
  });

  describe('PATCH /api/events/:id', () => {
    it('should update event title with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const event = await prisma.event.create({
        data: {
          title: 'Original Title',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should update multiple fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const event = await prisma.event.create({
        data: {
          title: 'Original Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set('Cookie', cookies)
        .send({
          title: 'Updated Event',
          description: 'New description',
          location: 'New Location',
          category: 'Sport',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Updated Event',
        description: 'New description',
        location: 'New Location',
        category: 'Sport',
      });
    });

    it('should update recurrence pattern', async () => {
      const { cookies } = await createAuthenticatedUser();

      const event = await prisma.event.create({
        data: {
          title: 'Recurring Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
          recurrence: 'FREQ=DAILY',
        },
      });

      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set('Cookie', cookies)
        .send({ recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' });

      expect(response.status).toBe(200);
      expect(response.body.recurrence).toBe('FREQ=WEEKLY;BYDAY=MO,WE,FR');
    });

    it('should return 401 without authentication', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/events/9999')
        .set('Cookie', cookies)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid category in update', async () => {
      const { cookies } = await createAuthenticatedUser();

      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set('Cookie', cookies)
        .send({ category: 'InvalidCategory' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const event = await prisma.event.create({
        data: {
          title: 'Event to Delete',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(event.id);

      // Verify deletion
      const deletedEvent = await prisma.event.findUnique({
        where: { id: event.id },
      });
      expect(deletedEvent).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Protected Event',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          category: 'Meeting',
        },
      });

      const response = await request(app).delete(`/api/events/${event.id}`);

      expect(response.status).toBe(401);

      // Verify event still exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: event.id },
      });
      expect(existingEvent).toBeTruthy();
    });

    it('should return 404 for non-existent event', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/events/9999')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/events/invalid')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Recurring Events', () => {
    it('should expand daily recurring event', async () => {
      await prisma.event.create({
        data: {
          title: 'Daily Standup',
          startDate: new Date('2024-01-01T09:00:00Z'),
          endDate: new Date('2024-01-01T09:15:00Z'),
          category: 'Meeting',
          recurrence: 'FREQ=DAILY',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-07',
      );

      expect(response.status).toBe(200);
      // Should have multiple instances (6-7 days depending on inclusive boundaries)
      expect(response.body.length).toBeGreaterThanOrEqual(6);
      expect(response.body.length).toBeLessThanOrEqual(7);
      response.body.forEach(
        (event: { isRecurrenceInstance: boolean; title: string }) => {
          expect(event.isRecurrenceInstance).toBe(true);
          expect(event.title).toBe('Daily Standup');
        },
      );
    });

    it('should expand monthly recurring event', async () => {
      await prisma.event.create({
        data: {
          title: 'Monthly Review',
          startDate: new Date('2024-01-15T14:00:00Z'),
          endDate: new Date('2024-01-15T16:00:00Z'),
          category: 'Meeting',
          recurrence: 'FREQ=MONTHLY',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-06-30',
      );

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(6); // 6 months
    });

    it('should preserve event duration when expanding', async () => {
      await prisma.event.create({
        data: {
          title: 'Two Hour Event',
          startDate: new Date('2024-01-01T10:00:00Z'),
          endDate: new Date('2024-01-01T12:00:00Z'), // 2 hour duration
          category: 'Meeting',
          recurrence: 'FREQ=DAILY',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-03',
      );

      expect(response.status).toBe(200);
      response.body.forEach((event: { startDate: string; endDate: string }) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        const durationMs = end.getTime() - start.getTime();
        expect(durationMs).toBe(2 * 60 * 60 * 1000); // 2 hours in ms
      });
    });

    it('should handle non-recurring events alongside recurring ones', async () => {
      await prisma.event.create({
        data: {
          title: 'One-time Event',
          startDate: new Date('2024-01-05T10:00:00Z'),
          endDate: new Date('2024-01-05T12:00:00Z'),
          category: 'Social',
        },
      });

      await prisma.event.create({
        data: {
          title: 'Recurring Event',
          startDate: new Date('2024-01-01T09:00:00Z'),
          endDate: new Date('2024-01-01T10:00:00Z'),
          category: 'Meeting',
          recurrence: 'FREQ=WEEKLY;BYDAY=MO',
        },
      });

      const response = await request(app).get(
        '/api/events?start=2024-01-01&end=2024-01-31',
      );

      expect(response.status).toBe(200);

      const oneTimeEvent = response.body.find(
        (e: { title: string }) => e.title === 'One-time Event',
      );
      const recurringEvents = response.body.filter(
        (e: { title: string }) => e.title === 'Recurring Event',
      );

      expect(oneTimeEvent.isRecurrenceInstance).toBe(false);
      expect(recurringEvents.length).toBeGreaterThan(1);
      recurringEvents.forEach((e: { isRecurrenceInstance: boolean }) => {
        expect(e.isRecurrenceInstance).toBe(true);
      });
    });
  });
});
