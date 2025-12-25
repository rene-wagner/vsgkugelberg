import { Post as PrismaPost, User, Category, Tag } from '@/lib/prisma.lib';

export interface CreatePostDto {
  title: string;
  content?: string;
  published?: boolean;
  hits?: number;
  oldPost?: boolean;
  authorId: number;
  categoryIds?: number[];
  tagIds?: number[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
  hits?: number;
  oldPost?: boolean;
  categoryIds?: number[];
  tagIds?: number[];
}

export interface Post extends PrismaPost {
  author: Omit<User, 'password'>;
  categories: Category[];
  tags: Tag[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
