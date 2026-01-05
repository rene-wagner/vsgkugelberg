import fs from 'fs/promises';
import path from 'path';
import { NotFoundException } from '@/errors/http-errors';
import {
  CreateMediaDto,
  Media,
  PaginatedResponse,
  RegenerateThumbnailsResult,
  ThumbnailsMap,
} from '@/types/media.types';
import { Prisma, prisma } from '@/lib/prisma.lib';
import { UPLOAD_DIR } from '@/config/upload.config';
import { ThumbnailService } from '@/services/thumbnail.service';

export class MediaService {
  private thumbnailService: ThumbnailService;

  constructor() {
    this.thumbnailService = new ThumbnailService();
  }

  async findAll(
    page: number = 1,
    limit: number = 24,
    folderId: number | null | undefined = undefined,
  ): Promise<PaginatedResponse<Media>> {
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {};
    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: media,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<Media> {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    let thumbnails: ThumbnailsMap | null = null;

    // Generate thumbnails for supported image types
    if (this.thumbnailService.isSupportedMimetype(createMediaDto.mimetype)) {
      const inputPath = path.join(UPLOAD_DIR, createMediaDto.filename);
      try {
        thumbnails = await this.thumbnailService.generateThumbnails(
          inputPath,
          createMediaDto.filename,
        );
      } catch (error) {
        // Log but don't fail the upload
        console.warn('Thumbnail generation failed:', error);
      }
    }

    return prisma.media.create({
      data: {
        filename: createMediaDto.filename,
        originalName: createMediaDto.originalName,
        path: createMediaDto.path,
        mimetype: createMediaDto.mimetype,
        size: createMediaDto.size,
        type: createMediaDto.type || 'IMAGE',
        folderId: createMediaDto.folderId || null,
        ...(thumbnails && { thumbnails }),
      },
    });
  }

  async remove(id: number): Promise<Media> {
    // First, find the media by ID
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    try {
      // Delete from database first
      const deletedMedia = await prisma.media.delete({
        where: { id },
      });

      // Then delete the physical file
      const filePath = path.join(UPLOAD_DIR, existingMedia.filename);
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        // Log warning but don't fail - orphaned file is less critical than orphaned DB record
        console.warn(`Failed to delete file ${filePath}:`, fileError);
      }

      // Delete associated thumbnails
      if (existingMedia.thumbnails) {
        try {
          await this.thumbnailService.deleteThumbnailsFromMap(
            existingMedia.thumbnails as ThumbnailsMap,
          );
        } catch (thumbnailError) {
          console.warn('Failed to delete thumbnails:', thumbnailError);
        }
      }

      return deletedMedia;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }
      throw error;
    }
  }

  async regenerateThumbnails(id: number): Promise<Media> {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Skip SVG and other unsupported formats
    if (!this.thumbnailService.isSupportedMimetype(media.mimetype)) {
      return media;
    }

    // Delete existing thumbnails
    if (media.thumbnails) {
      await this.thumbnailService.deleteThumbnailsFromMap(
        media.thumbnails as ThumbnailsMap,
      );
    }

    // Generate new thumbnails
    const inputPath = path.join(UPLOAD_DIR, media.filename);
    const thumbnails = await this.thumbnailService.generateThumbnails(
      inputPath,
      media.filename,
    );

    // Update database
    return prisma.media.update({
      where: { id },
      data: { thumbnails },
    });
  }

  async move(id: number, folderId: number | null): Promise<Media> {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    if (folderId !== null) {
      const folder = await prisma.mediaFolder.findUnique({
        where: { id: folderId },
      });
      if (!folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }
    }

    return prisma.media.update({
      where: { id },
      data: { folderId },
    });
  }

  async regenerateAllThumbnails(): Promise<RegenerateThumbnailsResult> {
    const result: RegenerateThumbnailsResult = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };

    // Get all media items
    const allMedia = await prisma.media.findMany();

    for (const media of allMedia) {
      result.processed++;

      // Skip unsupported formats
      if (!this.thumbnailService.isSupportedMimetype(media.mimetype)) {
        result.skipped++;
        continue;
      }

      try {
        // Delete existing thumbnails
        if (media.thumbnails) {
          await this.thumbnailService.deleteThumbnailsFromMap(
            media.thumbnails as ThumbnailsMap,
          );
        }

        // Generate new thumbnails
        const inputPath = path.join(UPLOAD_DIR, media.filename);
        const thumbnails = await this.thumbnailService.generateThumbnails(
          inputPath,
          media.filename,
        );

        if (thumbnails) {
          // Update database
          await prisma.media.update({
            where: { id: media.id },
            data: { thumbnails },
          });
          result.succeeded++;
        } else {
          result.failed++;
        }
      } catch (error) {
        console.warn(
          `Failed to regenerate thumbnails for media ${media.id}:`,
          error,
        );
        result.failed++;
      }
    }

    return result;
  }
}
