import { Category as PrismaCategory } from '@prisma/client'

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export type Category = PrismaCategory