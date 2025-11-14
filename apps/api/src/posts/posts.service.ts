import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { generateUniqueSlug } from './helpers/slug-generator.helper';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    published?: boolean,
    categorySlug?: string,
    tagSlug?: string,
  ): Promise<Post[]> {
    const where: Prisma.PostWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug },
      };
    }

    if (tagSlug) {
      where.tags = {
        some: { slug: tagSlug },
      };
    }

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        categories: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Generate unique slug from title
    const slug = await generateUniqueSlug(createPostDto.title, this.prisma);

    // Validate category IDs if provided
    if (createPostDto.categoryIds && createPostDto.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: createPostDto.categoryIds } },
      });
      if (categories.length !== createPostDto.categoryIds.length) {
        const foundIds = categories.map((c) => c.id);
        const missingId = createPostDto.categoryIds.find(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(`Category with ID ${missingId} not found`);
      }
    }

    // Validate tag IDs if provided
    if (createPostDto.tagIds && createPostDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: createPostDto.tagIds } },
      });
      if (tags.length !== createPostDto.tagIds.length) {
        const foundIds = tags.map((t) => t.id);
        const missingId = createPostDto.tagIds.find(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(`Tag with ID ${missingId} not found`);
      }
    }

    try {
      const post = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          slug,
          content: createPostDto.content,
          published: createPostDto.published ?? false,
          authorId: createPostDto.authorId,
          categories: {
            connect: createPostDto.categoryIds?.map((id) => ({ id })) || [],
          },
          tags: {
            connect: createPostDto.tagIds?.map((id) => ({ id })) || [],
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          categories: true,
          tags: true,
        },
      });

      return post;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException(
          `Author with ID ${createPostDto.authorId} not found`,
        );
      }
      throw error;
    }
  }

  async update(slug: string, updatePostDto: UpdatePostDto): Promise<Post> {
    // First, find the post by slug
    const existingPost = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Validate category IDs if provided
    if (updatePostDto.categoryIds && updatePostDto.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: updatePostDto.categoryIds } },
      });
      if (categories.length !== updatePostDto.categoryIds.length) {
        const foundIds = categories.map((c) => c.id);
        const missingId = updatePostDto.categoryIds.find(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(`Category with ID ${missingId} not found`);
      }
    }

    // Validate tag IDs if provided
    if (updatePostDto.tagIds && updatePostDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: updatePostDto.tagIds } },
      });
      if (tags.length !== updatePostDto.tagIds.length) {
        const foundIds = tags.map((t) => t.id);
        const missingId = updatePostDto.tagIds.find(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(`Tag with ID ${missingId} not found`);
      }
    }

    const updateData: Prisma.PostUpdateInput = {};

    // If title is being updated, regenerate slug
    if (updatePostDto.title !== undefined) {
      updateData.title = updatePostDto.title;
      updateData.slug = await generateUniqueSlug(
        updatePostDto.title,
        this.prisma,
        existingPost.id,
      );
    }

    if (updatePostDto.content !== undefined) {
      updateData.content = updatePostDto.content;
    }

    if (updatePostDto.published !== undefined) {
      updateData.published = updatePostDto.published;
    }

    // Handle categories - replace all
    if (updatePostDto.categoryIds !== undefined) {
      updateData.categories = {
        set: updatePostDto.categoryIds.map((id) => ({ id })),
      };
    }

    // Handle tags - replace all
    if (updatePostDto.tagIds !== undefined) {
      updateData.tags = {
        set: updatePostDto.tagIds.map((id) => ({ id })),
      };
    }

    try {
      const post = await this.prisma.post.update({
        where: { id: existingPost.id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          categories: true,
          tags: true,
        },
      });

      return post;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Post> {
    // First, find the post by slug
    const existingPost = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    try {
      const post = await this.prisma.post.delete({
        where: { id: existingPost.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return post;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }
      throw error;
    }
  }
}
