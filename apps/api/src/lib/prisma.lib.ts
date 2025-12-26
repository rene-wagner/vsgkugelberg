import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Prisma,
  Block,
  Category,
  ClubSettings,
  Department,
  Post,
  Tag,
  User,
} from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export {
  prisma,
  Prisma,
  Block,
  Category,
  ClubSettings,
  Department,
  Post,
  Tag,
  User,
};
