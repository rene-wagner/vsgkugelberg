import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export async function cleanupDatabase() {
  const prisma = getPrismaClient()
  
  // Delete in correct order: child tables first, then parent tables
  await prisma.$transaction([
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }
}
