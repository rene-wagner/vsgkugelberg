import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';

/**
 * Test user data
 */
export const testUsers = {
  john: {
    username: 'john.doe',
    email: 'john@example.com',
    password: 'password123',
  },
  jane: {
    username: 'jane.smith',
    email: 'jane@example.com',
    password: 'password456',
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
  },
};

/**
 * Test post data
 */
export const testPosts = {
  published: {
    title: 'Published Post',
    slug: 'published-post',
    content: 'This is a published post content',
    published: true,
  },
  draft: {
    title: 'Draft Post',
    slug: 'draft-post',
    content: 'This is a draft post content',
    published: false,
  },
  another: {
    title: 'Another Post',
    slug: 'another-post',
    content: 'Another post content',
    published: true,
  },
};

/**
 * Test category data
 */
export const testCategories = {
  technology: {
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related posts',
  },
  sports: {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports related posts',
  },
  news: {
    name: 'News',
    slug: 'news',
    description: 'News and updates',
  },
};

/**
 * Test tag data
 */
export const testTags = {
  javascript: {
    name: 'JavaScript',
    slug: 'javascript',
  },
  typescript: {
    name: 'TypeScript',
    slug: 'typescript',
  },
  nestjs: {
    name: 'NestJS',
    slug: 'nestjs',
  },
};

/**
 * Test department data
 */
export const testDepartments = {
  football: {
    name: 'Football',
    slug: 'football',
    shortDescription: 'Football department',
    longDescription: 'Our football department offers training and competitions',
  },
  basketball: {
    name: 'Basketball',
    slug: 'basketball',
    shortDescription: 'Basketball department',
    longDescription: 'Our basketball department for all skill levels',
  },
  volleyball: {
    name: 'Volleyball',
    slug: 'volleyball',
    shortDescription: 'Volleyball department',
    longDescription: 'Join our volleyball team and compete',
  },
};

/**
 * Seeds the database with test data
 */
export async function seedDatabase(prisma: PrismaService) {
  // Create users with hashed passwords
  const john = await prisma.user.create({
    data: {
      ...testUsers.john,
      password: await bcrypt.hash(testUsers.john.password, 10),
    },
  });

  const jane = await prisma.user.create({
    data: {
      ...testUsers.jane,
      password: await bcrypt.hash(testUsers.jane.password, 10),
    },
  });

  // Create categories
  const techCategory = await prisma.category.create({
    data: testCategories.technology,
  });

  const sportsCategory = await prisma.category.create({
    data: testCategories.sports,
  });

  // Create tags
  const jsTag = await prisma.tag.create({
    data: testTags.javascript,
  });

  const tsTag = await prisma.tag.create({
    data: testTags.typescript,
  });

  // Create departments
  await prisma.department.create({
    data: testDepartments.football,
  });

  await prisma.department.create({
    data: testDepartments.basketball,
  });

  // Create posts with relationships
  await prisma.post.create({
    data: {
      ...testPosts.published,
      authorId: john.id,
      categories: {
        connect: [{ id: techCategory.id }],
      },
      tags: {
        connect: [{ id: jsTag.id }, { id: tsTag.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      ...testPosts.draft,
      authorId: jane.id,
      categories: {
        connect: [{ id: sportsCategory.id }],
      },
      tags: {
        connect: [{ id: jsTag.id }],
      },
    },
  });

  return {
    users: { john, jane },
    categories: { techCategory, sportsCategory },
    tags: { jsTag, tsTag },
  };
}
