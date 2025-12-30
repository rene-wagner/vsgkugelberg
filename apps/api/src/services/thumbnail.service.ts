import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { UPLOAD_DIR } from '@/config/upload.config';
import {
  ThumbnailConfig,
  ThumbnailsMap,
  ThumbnailSize,
} from '@/types/media.types';

// Thumbnail size configurations
const THUMBNAIL_SIZES: ThumbnailConfig[] = [
  { name: 'thumb', width: 150, height: 150 },
  { name: 'small', width: 300, height: 300 },
  { name: 'medium', width: 600, height: 600 },
  { name: 'large', width: 1200, height: 1200 },
];

// Supported mimetypes for thumbnail generation
const SUPPORTED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Environment variable configuration
const THUMBNAIL_QUALITY = parseInt(process.env.THUMBNAIL_QUALITY || '80', 10);

export class ThumbnailService {
  /**
   * Check if a mimetype supports thumbnail generation
   */
  isSupportedMimetype(mimetype: string): boolean {
    return SUPPORTED_MIMETYPES.includes(mimetype);
  }

  /**
   * Generate thumbnail filename from original filename and size
   */
  getThumbnailFilename(originalFilename: string, size: ThumbnailSize): string {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    return `${basename}-${size}.webp`;
  }

  /**
   * Generate all thumbnail sizes for an image
   * @param inputPath Full path to the source image
   * @param filename Original filename (used to derive thumbnail names)
   * @returns ThumbnailsMap with filenames for each size, or null if generation fails
   */
  async generateThumbnails(
    inputPath: string,
    filename: string,
  ): Promise<ThumbnailsMap | null> {
    const thumbnails: ThumbnailsMap = {};

    try {
      for (const sizeConfig of THUMBNAIL_SIZES) {
        const thumbnailFilename = this.getThumbnailFilename(
          filename,
          sizeConfig.name,
        );
        const outputPath = path.join(UPLOAD_DIR, thumbnailFilename);

        await sharp(inputPath)
          .resize({
            width: sizeConfig.width,
            height: sizeConfig.height,
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: THUMBNAIL_QUALITY, effort: 4 })
          .toFile(outputPath);

        thumbnails[sizeConfig.name] = thumbnailFilename;
      }

      return thumbnails;
    } catch (error) {
      console.warn('Failed to generate thumbnails:', error);
      // Clean up any partially generated thumbnails
      await this.deleteThumbnails(filename);
      return null;
    }
  }

  /**
   * Delete all thumbnails for a given original filename
   * @param filename Original filename (used to derive thumbnail names)
   */
  async deleteThumbnails(filename: string): Promise<void> {
    for (const sizeConfig of THUMBNAIL_SIZES) {
      const thumbnailFilename = this.getThumbnailFilename(
        filename,
        sizeConfig.name,
      );
      const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename);

      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Ignore errors if file doesn't exist
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn(`Failed to delete thumbnail ${thumbnailPath}:`, error);
        }
      }
    }
  }

  /**
   * Delete thumbnails using a ThumbnailsMap (more precise, uses actual stored filenames)
   * @param thumbnails ThumbnailsMap from the database
   */
  async deleteThumbnailsFromMap(thumbnails: ThumbnailsMap): Promise<void> {
    for (const size of Object.keys(thumbnails) as ThumbnailSize[]) {
      const thumbnailFilename = thumbnails[size];
      if (!thumbnailFilename) continue;

      const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename);

      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Ignore errors if file doesn't exist
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn(`Failed to delete thumbnail ${thumbnailPath}:`, error);
        }
      }
    }
  }
}
