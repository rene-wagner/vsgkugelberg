import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Prisma,
  Category,
  ClubSettings,
  Department,
  DepartmentStat,
  DepartmentTrainingGroup,
  DepartmentTrainingSession,
  DepartmentLocation,
  DepartmentTrainer,
  ContactPerson,
  Event,
  Media,
  MediaFolder,
  Post,
  User,
  HistoryContent,
  MembershipFeeContent,
  SportInsuranceContent,
  StatutesContent,
} from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export {
  prisma,
  Prisma,
  Category,
  ClubSettings,
  Department,
  DepartmentStat,
  DepartmentTrainingGroup,
  DepartmentTrainingSession,
  DepartmentLocation,
  DepartmentTrainer,
  ContactPerson,
  Event,
  Media,
  MediaFolder,
  Post,
  User,
  HistoryContent,
  MembershipFeeContent,
  SportInsuranceContent,
  StatutesContent,
};
