import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanupDatabase, disconnectDatabase, getPrismaClient } from './helpers'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true })

// Verify test database is configured
if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn('⚠️  Warning: DATABASE_URL does not contain "test" - you may be using your development database!')
}

// Run migrations before all tests
beforeAll(async () => {
  console.log('🔧 Setting up test environment...')
  
  // Note: You should run migrations manually before tests:
  // DATABASE_URL="..." npx prisma migrate deploy
  
  const prisma = getPrismaClient()
  
  // Verify database connection
  try {
    await prisma.$connect()
    console.log('✅ Connected to test database')
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error)
    throw error
  }
})

// Clean up after each test to ensure test isolation
afterEach(async () => {
  await cleanupDatabase()
})

// Disconnect after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...')
  await disconnectDatabase()
  console.log('✅ Test environment cleaned up')
})
