import fs from 'fs/promises';
import path from 'path';
import { NotFoundException } from '@/errors/http-errors';
import { CreateMediaDto, Media, PaginatedResponse } from '@/types/media.types';
import { Prisma, prisma } from '@/lib/prisma.lib';
import { UPLOAD_DIR } from '@/config/upload.config';

export class MediaService {
  async findAll(
    page: number = 1,
    limit: number = 24,
  ): Promise<PaginatedResponse<Media>> {
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count(),
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
    return prisma.media.create({
      data: {
        filename: createMediaDto.filename,
        originalName: createMediaDto.originalName,
        path: createMediaDto.path,
        mimetype: createMediaDto.mimetype,
        size: createMediaDto.size,
        type: createMediaDto.type || 'IMAGE',
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
}
