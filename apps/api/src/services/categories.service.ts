import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@/errors/http-errors';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  MoveCategoryDto,
  Category,
  CategoryWithChildren,
  CategoryTreeNode,
} from '@/types/category.types';
import { SlugifyService } from '@/services/slugify.service';
import { Prisma, prisma } from '@/lib/prisma.lib';

const slugifyService = new SlugifyService();

export class CategoriesService {
  async findAll(): Promise<CategoryTreeNode[]> {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return this.buildTree(categories);
  }

  async findBySlug(slug: string): Promise<CategoryWithChildren> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          orderBy: {
            name: 'asc',
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
    // Generate unique slug from name
    const slug = await slugifyService.generateUniqueCategorySlug(
      createCategoryDto.name,
    );

    // Check if category with the same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    // Validate parentId if provided
    if (createCategoryDto.parentId !== undefined) {
      const parentExists = await prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parentExists) {
        throw new BadRequestException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
        parentId: createCategoryDto.parentId ?? null,
      },
    });

    return category;
  }

  async update(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    // If name is being updated, check for conflicts and regenerate slug
    if (updateCategoryDto.name !== undefined) {
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive',
          },
          id: {
            not: existingCategory.id,
          },
        },
      });

      if (conflictingCategory) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    // Validate parentId if provided
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== null
    ) {
      // Cannot set self as parent
      if (updateCategoryDto.parentId === existingCategory.id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentExists = await prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parentExists) {
        throw new BadRequestException(
          `Parent category with ID ${updateCategoryDto.parentId} not found`,
        );
      }

      // Check for circular reference
      if (
        await this.isDescendant(updateCategoryDto.parentId, existingCategory.id)
      ) {
        throw new BadRequestException(
          'Cannot set a descendant category as parent (circular reference)',
        );
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    // If name is being updated, regenerate slug
    if (updateCategoryDto.name !== undefined) {
      updateData.name = updateCategoryDto.name;
      updateData.slug = await slugifyService.generateUniqueCategorySlug(
        updateCategoryDto.name,
        existingCategory.id,
      );
    }

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    if (updateCategoryDto.parentId !== undefined) {
      updateData.parentId = updateCategoryDto.parentId;
    }

    try {
      const category = await prisma.category.update({
        where: { id: existingCategory.id },
        data: updateData,
      });

      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Category with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async move(
    slug: string,
    moveCategoryDto: MoveCategoryDto,
  ): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    const { parentId } = moveCategoryDto;

    // Validate the move operation
    if (parentId !== null) {
      // Cannot set self as parent
      if (parentId === existingCategory.id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if parent exists
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentExists) {
        throw new BadRequestException(
          `Parent category with ID ${parentId} not found`,
        );
      }

      // Check for circular reference
      if (await this.isDescendant(parentId, existingCategory.id)) {
        throw new BadRequestException(
          'Cannot set a descendant category as parent (circular reference)',
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: existingCategory.id },
      data: { parentId },
    });

    return category;
  }

  async remove(slug: string): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    try {
      const category = await prisma.category.delete({
        where: { id: existingCategory.id },
      });

      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Category with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  /**
   * Builds a nested tree structure from a flat array of categories.
   */
  private buildTree(
    categories: Category[],
    parentId: number | null = null,
  ): CategoryTreeNode[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }

  /**
   * Checks if `potentialDescendantId` is a descendant of `ancestorId`.
   * Used to prevent circular references when moving categories.
   */
  private async isDescendant(
    potentialDescendantId: number,
    ancestorId: number,
  ): Promise<boolean> {
    // Get all descendants of ancestorId
    const descendants = await this.getAllDescendantIds(ancestorId);
    return descendants.includes(potentialDescendantId);
  }

  /**
   * Recursively gets all descendant IDs of a category.
   */
  private async getAllDescendantIds(categoryId: number): Promise<number[]> {
    const children = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });

    const descendantIds: number[] = children.map((c) => c.id);

    for (const child of children) {
      const grandchildren = await this.getAllDescendantIds(child.id);
      descendantIds.push(...grandchildren);
    }

    return descendantIds;
  }
}
