import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { generateUniqueTagSlug } from './helpers/slug-generator.helper';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Tag[]> {
    return await this.prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return tag;
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const slug = await generateUniqueTagSlug(this.prisma, createTagDto.name);

    try {
      return await this.prisma.tag.create({
        data: {
          name: createTagDto.name,
          slug,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Tag with name "${createTagDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(slug: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    let newSlug = slug;
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      newSlug = await generateUniqueTagSlug(
        this.prisma,
        updateTagDto.name,
        tag.id,
      );
    }

    try {
      return await this.prisma.tag.update({
        where: { id: tag.id },
        data: {
          name: updateTagDto.name,
          slug: newSlug,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Tag with name "${updateTagDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    if (tag._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete tag "${tag.name}" - ${tag._count.posts} posts still reference it`,
      );
    }

    return this.prisma.tag.delete({
      where: { id: tag.id },
    });
  }
}
