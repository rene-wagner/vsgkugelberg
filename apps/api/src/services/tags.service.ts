import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException, ConflictException } from '@/errors/http-errors';
import {
  CreateTagDto,
  UpdateTagDto,
  Tag,
  TagWithCount,
  TagWithPosts,
} from '@/types/tag.types';
import { SlugifyService } from '@/services/slugify.service';

export class TagsService {
  private readonly slugifyService: SlugifyService;

  constructor(private readonly prisma: PrismaClient) {
    this.slugifyService = new SlugifyService(prisma);
  }

  async findAll(): Promise<TagWithCount[]> {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags as TagWithCount[];
  }

  async findBySlug(slug: string): Promise<TagWithPosts> {
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

    return tag as TagWithPosts;
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // Check if tag with the same name already exists (case-insensitive)
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        name: {
          equals: createTagDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTag) {
      throw new ConflictException(
        `Tag with name "${createTagDto.name}" already exists`,
      );
    }

    // Generate unique slug from name
    const slug = await this.slugifyService.generateUniqueTagSlug(
      createTagDto.name,
    );

    try {
      const tag = await this.prisma.tag.create({
        data: {
          name: createTagDto.name,
          slug,
        },
      });

      return tag;
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
    // First, find the tag by slug
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    // If name is being updated, regenerate slug
    let newSlug = slug;
    if (updateTagDto.name && updateTagDto.name !== existingTag.name) {
      newSlug = await this.slugifyService.generateUniqueTagSlug(
        updateTagDto.name,
        existingTag.id,
      );
    }

    try {
      const tag = await this.prisma.tag.update({
        where: { id: existingTag.id },
        data: {
          name: updateTagDto.name,
          slug: newSlug,
        },
      });

      return tag;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Tag with name "${updateTagDto.name}" already exists`,
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Tag with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Tag> {
    // First, find the tag by slug with post count
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    // Check if tag has posts
    if (existingTag._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete tag "${existingTag.name}" - ${existingTag._count.posts} posts still reference it`,
      );
    }

    try {
      const tag = await this.prisma.tag.delete({
        where: { id: existingTag.id },
      });

      return tag;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Tag with slug "${slug}" not found`);
      }
      throw error;
    }
  }
}
