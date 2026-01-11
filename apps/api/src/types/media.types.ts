import { Media as PrismaMedia, MediaFolder as PrismaMediaFolder } from '@/lib/prisma.lib';

export interface CreateMediaDto {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type?: string;
  thumbnails?: ThumbnailsMap | null;
  folderId?: number | null;
}

export type Media = PrismaMedia;
export type MediaFolder = PrismaMediaFolder;

export interface CreateMediaFolderDto {
  name: string;
  parentId?: number | null;
}

export interface UpdateMediaFolderDto {
  name?: string;
  parentId?: number | null;
}

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
