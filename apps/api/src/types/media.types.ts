import { Media as PrismaMedia } from '@/lib/prisma.lib';

export interface CreateMediaDto {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type?: string;
  thumbnails?: ThumbnailsMap | null;
}

export type Media = PrismaMedia;

export type ThumbnailSize = 'thumb' | 'small' | 'medium' | 'large';

export interface ThumbnailsMap {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface ThumbnailConfig {
  name: ThumbnailSize;
  width: number;
  height: number;
}

export interface RegenerateThumbnailsResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
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
