import { Media as PrismaMedia } from '@/lib/prisma.lib';

export interface CreateMediaDto {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type?: string;
}

export type Media = PrismaMedia;

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
