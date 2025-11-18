import { Post as PrismaPost, User, Category, Tag } from '@prisma/client';

export interface CreatePostDto {
  title: string;
  content?: string;
  published?: boolean;
  authorId: number;
  categoryIds?: number[];
  tagIds?: number[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
  categoryIds?: number[];
  tagIds?: number[];
}

export interface Post extends PrismaPost {
  author: Omit<User, 'password'>;
  categories: Category[];
  tags: Tag[];
}
