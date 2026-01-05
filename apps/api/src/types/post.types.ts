import { Post as PrismaPost, User, Category, Media } from '@/lib/prisma.lib';

export interface CreatePostDto {
  title: string;
  content?: string;
  published?: boolean;
  hits?: number;
  oldPost?: boolean;
  authorId: number;
  categoryIds?: number[];
  thumbnailId?: number | null;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
  hits?: number;
  oldPost?: boolean;
  categoryIds?: number[];
  thumbnailId?: number | null;
}

export interface Post extends PrismaPost {
  author: Omit<User, 'password'>;
  categories: Category[];
  thumbnail: Media | null;
}

export { PaginatedResponse, PaginationMeta } from './pagination.types';
