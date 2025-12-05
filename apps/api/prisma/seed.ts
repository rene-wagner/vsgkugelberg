import { prisma, Prisma } from '@/lib/prisma.lib'

const userData: Prisma.UserCreateInput[] = [
  {
    username: 'john.doe',
    email: 'john.doe@example.com',
    password: '$2b$10$3reoOhi62GQ8qJenfs82BeSLLFm/MCuxj3zEZ/mgezRNN6YWA1krq',
  },
];

const departmentData: Prisma.DepartmentCreateInput[] = [
  {
    name: 'Badminton',
    slug: 'badminton',
    shortDescription:
      'Dynamic badminton club offering training and competitions for all skill levels.',
    longDescription:
      "Our badminton department welcomes players of all ages and abilities. We offer regular training sessions, friendly matches, and competitive tournaments. Whether you're a beginner looking to learn the basics or an experienced player seeking to refine your skills, our qualified coaches and friendly community will help you achieve your goals.",
  },
  {
    name: 'Gymnastics',
    slug: 'gymnastics',
    shortDescription:
      'Comprehensive gymnastics program for children and adults focusing on flexibility and strength.',
    longDescription:
      'The gymnastics department provides a safe and encouraging environment for developing physical fitness, coordination, and confidence. Our programs range from introductory classes for young children to advanced training for competitive gymnasts. With state-of-the-art equipment and experienced coaches, we help each athlete reach their full potential while having fun.',
  },
  {
    name: 'Table Tennis',
    slug: 'table-tennis',
    shortDescription:
      'Fast-paced table tennis club with regular training sessions and league competitions.',
    longDescription:
      'Join our vibrant table tennis community where players of all levels come together to enjoy this exciting sport. We offer structured training programs, casual play sessions, and opportunities to compete in local and regional leagues. Our modern facilities and dedicated coaching staff ensure that everyone can improve their game while making new friends.',
  },
  {
    name: 'Volleyball',
    slug: 'volleyball',
    shortDescription:
      'Team-oriented volleyball department offering indoor and beach volleyball programs.',
    longDescription:
      'Our volleyball department is passionate about developing both individual skills and team spirit. We run programs for juniors and adults, including recreational leagues and competitive teams. From learning basic techniques to advanced tactical play, our experienced coaches provide comprehensive training. We also organize social events and tournaments to bring our volleyball community together.',
  },
];

async function main() {
  console.log(`Start seeding ...`);

  // Seed users
  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }

  // Seed departments
  for (const d of departmentData) {
    const department = await prisma.department.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
    console.log(
      `Created department with id: ${department.id} (${department.name})`,
    );
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
