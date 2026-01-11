import { NotFoundException, ConflictException, BadRequestException } from '@/errors/http-errors';
import { CreateCategoryDto, UpdateCategoryDto, Category, CategoryWithChildren, CategoryTreeNode } from '@/types/category.types';
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
    // Find category by full hierarchical slug path
    const category = await prisma.category.findFirst({
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
    const parentId = createCategoryDto.parentId ?? null;

    // Validate parentId if provided
    if (parentId !== null) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentExists) {
        throw new BadRequestException(`Parent category with ID ${parentId} not found`);
      }
    }

    // Check for duplicate name under the same parent
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive',
        },
        parentId,
      },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists under this parent`);
    }

    // Generate hierarchical slug from name and parent
    const slug = await slugifyService.generateUniqueCategorySlug(createCategoryDto.name, parentId);

    const category = await prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
        parentId,
      },
    });

    return category;
  }

  async update(slug: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await prisma.category.findFirst({
      where: { slug },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    // Determine the new parentId (use existing if not provided)
    const newParentId = updateCategoryDto.parentId !== undefined ? updateCategoryDto.parentId : existingCategory.parentId;

    // Validate parentId if it's being changed
    if (updateCategoryDto.parentId !== undefined && updateCategoryDto.parentId !== null) {
      // Cannot set self as parent
      if (updateCategoryDto.parentId === existingCategory.id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentExists = await prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parentExists) {
        throw new BadRequestException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
      }

      // Check for circular reference
      if (await this.isDescendant(updateCategoryDto.parentId, existingCategory.id)) {
        throw new BadRequestException('Cannot set a descendant category as parent (circular reference)');
      }
    }

    // If name is being updated, check for conflicts under the same parent
    if (updateCategoryDto.name !== undefined) {
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive',
          },
          parentId: newParentId,
          id: {
            not: existingCategory.id,
          },
        },
      });

      if (conflictingCategory) {
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists under this parent`);
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    // Handle name change - regenerate slug
    const nameChanged = updateCategoryDto.name !== undefined;
    const parentChanged = updateCategoryDto.parentId !== undefined && updateCategoryDto.parentId !== existingCategory.parentId;

    if (nameChanged || parentChanged) {
      const newName = updateCategoryDto.name ?? existingCategory.name;
      if (nameChanged) {
        updateData.name = newName;
      }

      // Generate new hierarchical slug
      const newSlug = await slugifyService.generateUniqueCategorySlug(newName, newParentId, existingCategory.id);
      updateData.slug = newSlug;

      if (parentChanged) {
        updateData.parentId = updateCategoryDto.parentId;
      }

      // Update the category first
      const category = await prisma.category.update({
        where: { id: existingCategory.id },
        data: updateData,
      });

      // If parent changed or name changed, update all descendant slugs
      if (parentChanged || nameChanged) {
        await this.updateDescendantSlugs(existingCategory.id, category.slug);
      }

      return category;
    }

    // Simple update without slug changes
    try {
      const category = await prisma.category.update({
        where: { id: existingCategory.id },
        data: updateData,
      });

      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Category with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await prisma.category.findFirst({
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Category with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  /**
   * Builds a nested tree structure from a flat array of categories.
   */
  private buildTree(categories: Category[], parentId: number | null = null): CategoryTreeNode[] {
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
  private async isDescendant(potentialDescendantId: number, ancestorId: number): Promise<boolean> {
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

  /**
   * Recursively updates the slugs of all descendants when a category's slug changes.
   * @param categoryId - The category whose descendants need slug updates
   * @param newParentSlug - The new slug of the parent category
   */
  private async updateDescendantSlugs(categoryId: number, newParentSlug: string): Promise<void> {
    const children = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true, slug: true },
    });

    for (const child of children) {
      // Build new slug for this child
      const newSlug = slugifyService.buildCategorySlug(child.slug, newParentSlug);

      // Update the child's slug
      await prisma.category.update({
        where: { id: child.id },
        data: { slug: newSlug },
      });

      // Recursively update this child's descendants
      await this.updateDescendantSlugs(child.id, newSlug);
    }
  }

  /**
   * Recalculates slugs for all categories in the database.
   * Processes categories in depth-first order (root categories first, then descendants).
   * Returns the count of categories whose slugs were updated.
   */
  async recalculateAllSlugs(): Promise<{ updated: number }> {
    // Fetch all categories ordered by depth (root categories first, then descendants)
    const categories = await prisma.category.findMany({
      orderBy: { parentId: 'asc' },
      select: { id: true, name: true, parentId: true },
    });

    let updatedCount = 0;

    for (const category of categories) {
      // Generate a new slug using the existing logic
      const newSlug = await slugifyService.generateUniqueCategorySlug(category.name, category.parentId, category.id);

      // Update the category with the recalculated slug
      await prisma.category.update({
        where: { id: category.id },
        data: { slug: newSlug },
      });

      updatedCount++;
    }

    return { updated: updatedCount };
  }
}
