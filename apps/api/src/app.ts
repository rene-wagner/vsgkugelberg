import { PrismaClient } from '@prisma/client'
import express from 'express'
import { router } from './routes'
import { errorHandler, notFoundHandler } from './middleware/error-handler'

const prisma = new PrismaClient()

const app = express()

// Body parser middleware
app.use(express.json())

// Mount API routes
app.use('/api', router)

// 404 handler - must come after all routes
app.use(notFoundHandler)

// Global error handler - must be last
app.use(errorHandler)

export { app, prisma }
