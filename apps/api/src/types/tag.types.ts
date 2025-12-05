import { Tag as PrismaTag } from '@/lib/prisma.lib';

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}

export type Tag = PrismaTag;

export interface TagWithCount extends Tag {
  _count: {
    posts: number;
  };
}

export interface TagWithPosts extends Tag {
  posts: Array<{
    id: number;
    title: string;
    slug: string;
    published: boolean;
    createdAt: Date;
    author: {
      id: number;
      username: string;
      email: string;
    };
  }>;
}
