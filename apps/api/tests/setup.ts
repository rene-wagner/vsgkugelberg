import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanupDatabase, disconnectDatabase, getPrismaClient } from './helpers'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true })

if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn('⚠️  Warning: DATABASE_URL does not contain "test" - you may be using your development database!')
}

beforeAll(async () => {
  console.log('🔧 Setting up test environment...')

  const prisma = getPrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Connected to test database')
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error)
    throw error
  }
})

afterEach(async () => {
  await cleanupDatabase()
})

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...')
  await cleanupDatabase()
  await disconnectDatabase()
  console.log('✅ Test environment cleaned up')
})
