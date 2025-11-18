import slugify from 'slugify'
import { PrismaClient } from '@prisma/client'

export class SlugifyService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Generates a URL-friendly slug from a string
   * @param text - The text to convert to a slug
   * @returns A slugified string
   */
  slugify(text: string): string {
    // Pre-process to remove special characters that slugify would otherwise translate
    const cleaned = text.replace(/[&]/g, ' ')
    
    return slugify(cleaned, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@?]/g,
      replacement: '-',
    })
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
    const baseSlug = this.slugify(title)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existingPost = await this.prisma.post.findUnique({
        where: { slug },
        select: { id: true },
      })

      // If no post exists with this slug, or it's the same post we're updating
      if (!existingPost || (excludePostId && existingPost.id === excludePostId)) {
        return slug
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  /**
   * Generates a unique slug for a category
   * If the slug already exists, appends a number to make it unique
   * @param name - The category name
   * @param excludeCategoryId - Optional category ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  async generateUniqueCategorySlug(
    name: string,
    excludeCategoryId?: string,
  ): Promise<string> {
    const baseSlug = this.slugify(name)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      })

      // If no category exists with this slug, or it's the same category we're updating
      if (!existingCategory || (excludeCategoryId && existingCategory.id === excludeCategoryId)) {
        return slug
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }
}
