import { BaseEntity } from './common';

export interface MediaItem extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
}

export interface MediaFilter {
  type?: string;
  search?: string;
}
