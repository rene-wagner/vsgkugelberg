import { Tag as PrismaTag } from '@prisma/client';

export type Tag = PrismaTag & {
  posts?: Array<{
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
  _count?: {
    posts: number;
  };
};
