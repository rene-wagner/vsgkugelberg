import { Category as PrismaCategory } from '@/lib/prisma.lib';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: number | null;
}

export interface MoveCategoryDto {
  parentId: number | null;
}

export type Category = PrismaCategory;

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
