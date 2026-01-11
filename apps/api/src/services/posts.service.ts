import { NotFoundException } from '@/errors/http-errors';
import { CreatePostDto, UpdatePostDto, Post, PaginatedResponse } from '@/types/post.types';
import { SlugifyService } from '@/services/slugify.service';
import { Prisma, prisma } from '@/lib/prisma.lib';

const slugifyService = new SlugifyService();

export class PostsService {
  async findAll(published?: boolean, categorySlug?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Post>> {
    const where: Prisma.PostWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug },
      };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          thumbnail: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts as Post[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await prisma.post.findUnique({
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
        thumbnail: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return post as Post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Generate unique slug from title
    const slug = await slugifyService.generateUniqueSlug(createPostDto.title);

    // Validate category IDs if provided
    if (createPostDto.categoryIds && createPostDto.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: createPostDto.categoryIds } },
      });
      if (categories.length !== createPostDto.categoryIds.length) {
        const foundIds = categories.map((c) => c.id);
        const missingId = createPostDto.categoryIds.find((id) => !foundIds.includes(id));
        throw new NotFoundException(`Category with ID ${missingId} not found`);
      }
    }

    // Validate thumbnail ID if provided
    if (createPostDto.thumbnailId) {
      const media = await prisma.media.findUnique({
        where: { id: createPostDto.thumbnailId },
      });
      if (!media) {
        throw new NotFoundException(`Media with ID ${createPostDto.thumbnailId} not found`);
      }
    }

    try {
      const post = await prisma.post.create({
        data: {
          title: createPostDto.title,
          slug,
          content: createPostDto.content,
          published: createPostDto.published ?? false,
          hits: createPostDto.hits ?? 0,
          oldPost: createPostDto.oldPost ?? false,
          authorId: createPostDto.authorId,
          thumbnailId: createPostDto.thumbnailId ?? null,
          categories: {
            connect: createPostDto.categoryIds?.map((id) => ({ id })) || [],
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
          thumbnail: true,
        },
      });

      return post as Post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException(`Author with ID ${createPostDto.authorId} not found`);
      }
      throw error;
    }
  }

  async update(slug: string, updatePostDto: UpdatePostDto): Promise<Post> {
    // First, find the post by slug
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Validate category IDs if provided
    if (updatePostDto.categoryIds && updatePostDto.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: updatePostDto.categoryIds } },
      });
      if (categories.length !== updatePostDto.categoryIds.length) {
        const foundIds = categories.map((c) => c.id);
        const missingId = updatePostDto.categoryIds.find((id) => !foundIds.includes(id));
        throw new NotFoundException(`Category with ID ${missingId} not found`);
      }
    }

    // Validate thumbnail ID if provided (and not null)
    if (updatePostDto.thumbnailId) {
      const media = await prisma.media.findUnique({
        where: { id: updatePostDto.thumbnailId },
      });
      if (!media) {
        throw new NotFoundException(`Media with ID ${updatePostDto.thumbnailId} not found`);
      }
    }

    const updateData: Prisma.PostUpdateInput = {};

    // If title is being updated, regenerate slug
    if (updatePostDto.title !== undefined) {
      updateData.title = updatePostDto.title;
      updateData.slug = await slugifyService.generateUniqueSlug(updatePostDto.title, existingPost.id);
    }

    if (updatePostDto.content !== undefined) {
      updateData.content = updatePostDto.content;
    }

    if (updatePostDto.published !== undefined) {
      updateData.published = updatePostDto.published;
    }

    if (updatePostDto.hits !== undefined) {
      updateData.hits = updatePostDto.hits;
    }

    if (updatePostDto.oldPost !== undefined) {
      updateData.oldPost = updatePostDto.oldPost;
    }

    // Handle categories - replace all
    if (updatePostDto.categoryIds !== undefined) {
      updateData.categories = {
        set: updatePostDto.categoryIds.map((id) => ({ id })),
      };
    }

    // Handle thumbnail - can be set, changed, or removed (null)
    if (updatePostDto.thumbnailId !== undefined) {
      updateData.thumbnailId = updatePostDto.thumbnailId;
    }

    try {
      const post = await prisma.post.update({
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
          thumbnail: true,
        },
      });

      return post as Post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Post> {
    // First, find the post by slug
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    try {
      const post = await prisma.post.delete({
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
          categories: true,
          thumbnail: true,
        },
      });

      return post as Post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }
      throw error;
    }
  }
}
