import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import request from 'supertest';
import * as bcrypt from 'bcrypt';

export interface AuthenticatedUser {
  user: {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  cookie: string;
}

/**
 * Creates a user in the database and authenticates them, returning the user object and JWT cookie
 */
export async function createAuthenticatedUser(
  app: INestApplication,
  userData?: {
    username?: string;
    email?: string;
    password?: string;
  },
): Promise<AuthenticatedUser> {
  const prisma = app.get(PrismaService);

  const username = userData?.username ?? `testuser_${Date.now()}`;
  const email = userData?.email ?? `test_${Date.now()}@example.com`;
  const password = userData?.password ?? 'password123';

  // Create user in database with hashed password
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  // Login to get JWT cookie
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username, password })
    .expect(201);

  const cookies = response.headers['set-cookie'];
  if (!cookies || cookies.length === 0) {
    throw new Error('No cookies returned from login');
  }

  const cookie = cookies[0];

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    cookie,
  };
}

/**
 * Creates a simple user in the database without authentication
 */
export async function createTestUser(
  prisma: PrismaService,
  userData?: {
    username?: string;
    email?: string;
    password?: string;
  },
) {
  const username = userData?.username ?? 'testuser';
  const email = userData?.email ?? 'test@example.com';
  const password = userData?.password ?? 'password123';

  return prisma.user.create({
    data: {
      username,
      email,
      password: await bcrypt.hash(password, 10),
    },
  });
}
