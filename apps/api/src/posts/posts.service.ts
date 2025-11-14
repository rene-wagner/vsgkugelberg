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

  async findAll(published?: boolean): Promise<Post[]> {
    const where: Prisma.PostWhereInput = {};

    if (published !== undefined) {
      where.published = published;
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

    try {
      const post = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          slug,
          content: createPostDto.content,
          published: createPostDto.published ?? false,
          authorId: createPostDto.authorId,
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
