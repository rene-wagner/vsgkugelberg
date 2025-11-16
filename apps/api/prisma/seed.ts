import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/common/services/password.service';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

async function main() {
  console.log('Seeding database...');

  const users = [
    {
      username: 'admin',
      email: 'admin@vsgkugelberg.local',
      password: await passwordService.hash('Admin123!'),
    },
    {
      username: 'john.doe',
      email: 'john.doe@example.com',
      password: await passwordService.hash('password123'),
    },
    {
      username: 'test.user',
      email: 'test@example.com',
      password: await passwordService.hash('testpass'),
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('✓ Seeded users:', users.map((u) => u.username).join(', '));
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
