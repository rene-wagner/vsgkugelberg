import { prisma } from '@/lib/prisma.lib';
import slugify from 'slugify';

export class SlugifyService {
  /**
   * Generates a URL-friendly slug from a string
   * @param text - The text to convert to a slug
   * @returns A slugified string
   */
  slugify(text: string): string {
    // Pre-process to remove special characters that slugify would otherwise translate
    const cleaned = text.replace(/[&]/g, ' ');

    return slugify(cleaned, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@?]/g,
      replacement: '-',
    });
  }

  /**
   * Generates a unique slug for a post
   * If the slug already exists, appends a number to make it unique
   * @param title - The post title
   * @param excludePostId - Optional post ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  async generateUniqueSlug(
    title: string,
    excludePostId?: number,
  ): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingPost = await prisma.post.findUnique({
        where: { slug },
        select: { id: true },
      });

      // If no post exists with this slug, or it's the same post we're updating
      if (
        !existingPost ||
        (excludePostId && existingPost.id === excludePostId)
      ) {
        return slug;
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Generates a hierarchical slug for a category
   * The slug format is: parentSlug/slugifiedName for nested categories, or just slugifiedName for root categories
   * Uniqueness is checked within the same parent context (slug + parentId must be unique)
   * @param name - The category name
   * @param parentId - The parent category ID (null for root categories)
   * @param excludeCategoryId - Optional category ID to exclude from uniqueness check (for updates)
   * @returns A unique hierarchical slug
   */
  async generateUniqueCategorySlug(
    name: string,
    parentId: number | null = null,
    excludeCategoryId?: number,
  ): Promise<string> {
    const nameSlug = this.slugify(name);

    // Get parent's slug if parentId is provided
    let parentSlug: string | null = null;
    if (parentId !== null) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { slug: true },
      });
      if (parent) {
        parentSlug = parent.slug;
      }
    }

    // Build hierarchical slug
    const baseSlug = parentSlug ? `${parentSlug}/${nameSlug}` : nameSlug;
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      // Check uniqueness within the same parent context
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          parentId,
          ...(excludeCategoryId && { id: { not: excludeCategoryId } }),
        },
        select: { id: true },
      });

      // If no category exists with this slug under the same parent
      if (!existingCategory) {
        return slug;
      }

      // Slug exists under same parent, try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Rebuilds a category's slug based on a new parent slug
   * @param currentSlug - The current full slug of the category
   * @param newParentSlug - The new parent's slug (null for root level)
   * @returns The new hierarchical slug
   */
  buildCategorySlug(currentSlug: string, newParentSlug: string | null): string {
    // Extract the leaf name from current slug (last segment)
    const segments = currentSlug.split('/');
    const leafSlug = segments[segments.length - 1];

    // Build new hierarchical slug
    return newParentSlug ? `${newParentSlug}/${leafSlug}` : leafSlug;
  }

  /**
   * Generates a unique slug for a tag
   * If the slug already exists, appends a number to make it unique
   * @param name - The tag name
   * @param excludeTagId - Optional tag ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  async generateUniqueTagSlug(
    name: string,
    excludeTagId?: number,
  ): Promise<string> {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingTag = await prisma.tag.findUnique({
        where: { slug },
        select: { id: true },
      });

      // If no tag exists with this slug, or it's the same tag we're updating
      if (!existingTag || (excludeTagId && existingTag.id === excludeTagId)) {
        return slug;
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Generates a unique slug for a department
   * If the slug already exists, appends a number to make it unique
   * @param name - The department name
   * @param excludeDepartmentId - Optional department ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  async generateUniqueDepartmentSlug(
    name: string,
    excludeDepartmentId?: number,
  ): Promise<string> {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingDepartment = await prisma.department.findUnique({
        where: { slug },
        select: { id: true },
      });

      // If no department exists with this slug, or it's the same department we're updating
      if (
        !existingDepartment ||
        (excludeDepartmentId && existingDepartment.id === excludeDepartmentId)
      ) {
        return slug;
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}
