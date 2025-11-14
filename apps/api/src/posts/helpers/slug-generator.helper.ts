import { PrismaService } from 'nestjs-prisma';
import { slugify } from '../../common/utils/slugify.util';

/**
 * Generate a unique slug for a post
 * @param title - The post title to convert to a slug
 * @param prisma - PrismaService instance for database queries
 * @param excludeId - Optional post ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  title: string,
  prisma: PrismaService,
  excludeId?: number,
): Promise<string> {
  let slug = slugify(title);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    // If no post found, or the found post is the one we're updating, slug is unique
    if (!existingPost || existingPost.id === excludeId) {
      isUnique = true;
    } else {
      // Append counter to make slug unique
      counter++;
      slug = `${slugify(title)}-${counter}`;
    }
  }

  return slug;
}
