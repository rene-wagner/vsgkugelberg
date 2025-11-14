import { PrismaService } from 'nestjs-prisma';
import { slugify } from '../../common/utils/slugify.util';

export async function generateUniqueCategorySlug(
  prisma: PrismaService,
  name: string,
  excludeId?: number,
): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
