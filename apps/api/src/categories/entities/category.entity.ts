import { Category as PrismaCategory } from '@prisma/client';

export type Category = PrismaCategory & {
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
