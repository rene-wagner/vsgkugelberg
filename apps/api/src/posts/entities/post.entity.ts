import { Post as PrismaPost } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

export type Post = PrismaPost & {
  author?: User;
};
