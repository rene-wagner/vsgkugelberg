import { passwordService } from '@/services/password.service';
import type { Response } from 'supertest';

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Prisma,
  Block,
  Category,
  ClubSettings,
  ContactPerson,
  Department,
  Event,
  Media,
  Post,
  User,
} from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export {
  prisma,
  Prisma,
  Block,
  Category,
  ClubSettings,
  ContactPerson,
  Department,
  Event,
  Media,
  Post,
  User,
};

export async function cleanupDatabase() {
  // Delete in correct order: child tables first, then parent tables
  await prisma.$transaction([
    prisma.block.deleteMany(),
    prisma.contactPerson.deleteMany(),
    prisma.event.deleteMany(),
    prisma.media.deleteMany(),
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.department.deleteMany(),
    prisma.clubSettings.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export async function createTestUserWithPassword(
  username: string,
  email: string,
  password: string,
) {
  const hashedPassword = await passwordService.hash(password);

  return prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
}

export function extractCookieValue(
  response: Response,
  cookieName: string,
): string | undefined {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return undefined;

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const targetCookie = cookieArray.find((cookie) =>
    cookie.startsWith(`${cookieName}=`),
  );

  if (!targetCookie) return undefined;

  // Extract value between cookieName= and first semicolon
  const match = targetCookie.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? (match[1] as string) : undefined;
}

export function parseCookieAttributes(cookieString: string): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: string | undefined;
  maxAge: number | undefined;
  path: string | undefined;
} {
  const attributes = {
    httpOnly: cookieString.includes('HttpOnly'),
    secure: cookieString.includes('Secure'),
    sameSite: undefined as string | undefined,
    maxAge: undefined as number | undefined,
    path: undefined as string | undefined,
  };

  const sameSiteMatch = cookieString.match(/SameSite=(\w+)/i);
  if (sameSiteMatch) {
    attributes.sameSite = sameSiteMatch[1].toLowerCase();
  }

  const maxAgeMatch = cookieString.match(/Max-Age=(\d+)/i);
  if (maxAgeMatch) {
    attributes.maxAge = parseInt(maxAgeMatch[1], 10);
  }

  const pathMatch = cookieString.match(/Path=([^;]+)/);
  if (pathMatch) {
    attributes.path = pathMatch[1];
  }

  return attributes;
}
