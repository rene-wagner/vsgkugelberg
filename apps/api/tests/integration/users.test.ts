import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '../helpers';

describe('Users API Integration Tests', () => {
  describe('GET /api/users', () => {
    it('should return all users without passwords', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(response.body.data[0]).not.toHaveProperty('password');
      expect(response.body.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should support pagination', async () => {
      // Create 15 users
      for (let i = 1; i <= 15; i++) {
        await prisma.user.create({
          data: {
            username: `user${i.toString().padStart(2, '0')}`,
            email: `user${i}@example.com`,
            password: 'password123',
          },
        });
      }

      // Page 1
      let response = await request(app).get('/api/users?page=1&limit=10');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });

      // Page 2
      response = await request(app).get('/api/users?page=2&limit=10');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user without password', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).get(`/api/users/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUser.id,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/users/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const newUser = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'Password123',
      };

      const response = await request(app).post('/api/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        username: 'alice',
        email: 'alice@example.com',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).not.toHaveProperty('password');

      const user = await prisma.user.findUnique({
        where: { id: response.body.id },
      });
      expect(user).toBeTruthy();
      expect(user?.password).not.toBe(newUser.password);
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app).post('/api/users').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app).post('/api/users').send({
        username: 'bob',
        email: 'invalid-email',
        password: 'Password123',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app).post('/api/users').send({
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'weak',
      });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate username', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).post('/api/users').send({
        username: 'testuser', // Already exists from beforeEach
        email: 'different@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body.message).toContain('username');
    });

    it('should return 409 for duplicate email', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).post('/api/users').send({
        username: 'differentuser',
        email: 'test@example.com', // Already exists from beforeEach
        password: 'Password123',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body.message).toContain('email');
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user username', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).patch(`/api/users/${testUser.id}`).send({
        username: 'updateduser',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUser.id,
        username: 'updateduser',
        email: 'test@example.com',
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should update user email', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).patch(`/api/users/${testUser.id}`).send({
        email: 'newemail@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('newemail@example.com');
    });

    it('should update user password', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const newPassword = 'NewPassword123';
      const response = await request(app).patch(`/api/users/${testUser.id}`).send({
        password: newPassword,
      });

      expect(response.status).toBe(200);

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(user?.password).not.toBe(newPassword);
    });

    it('should update multiple fields at once', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).patch(`/api/users/${testUser.id}`).send({
        username: 'totallyupdated',
        email: 'totally@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        username: 'totallyupdated',
        email: 'totally@example.com',
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).patch('/api/users/99999').send({
        username: 'nobody',
      });

      expect(response.status).toBe(404);
    });

    it('should return 409 for duplicate username', async () => {
      await prisma.user.create({
        data: {
          username: 'another',
          email: 'another@example.com',
          password: 'password123',
        },
      });

      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).patch(`/api/users/${testUser.id}`).send({
        username: 'another', // Try to use another user's username
      });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const testUser = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123', // This would normally be hashed
        },
      });

      const response = await request(app).delete(`/api/users/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUser.id,
        username: 'testuser',
      });

      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).delete('/api/users/invalid');

      expect(response.status).toBe(400);
    });
  });
});
