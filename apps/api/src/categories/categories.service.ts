import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { generateUniqueCategorySlug } from './helpers/slug-generator.helper';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
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

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = await generateUniqueCategorySlug(
      this.prisma,
      createCategoryDto.name,
    );

    try {
      return await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug,
          description: createCategoryDto.description,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Category with name "${createCategoryDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    let newSlug = slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      newSlug = await generateUniqueCategorySlug(
        this.prisma,
        updateCategoryDto.name,
        category.id,
      );
    }

    try {
      return await this.prisma.category.update({
        where: { id: category.id },
        data: {
          name: updateCategoryDto.name,
          slug: newSlug,
          description: updateCategoryDto.description,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    if (category._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" - ${category._count.posts} posts still reference it`,
      );
    }

    return this.prisma.category.delete({
      where: { id: category.id },
    });
  }
}
