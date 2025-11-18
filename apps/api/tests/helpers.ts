import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client in tests
// This prevents creating multiple instances which can cause connection issues
let prisma: PrismaClient

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

// Clean up database - deletes all records in correct order (respecting foreign keys)
export async function cleanupDatabase() {
  const prisma = getPrismaClient()
  
  // Delete in correct order: child tables first, then parent tables
  await prisma.$transaction([
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

// Disconnect from database
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }
}
