import { PrismaClient } from '@prisma/client'
import express from 'express'
import { router } from './routes'
import { errorHandler, notFoundHandler } from './middleware/error-handler'

const prisma = new PrismaClient()

const app = express()

app.use(express.json())
app.use('/api', router)
app.use(notFoundHandler)
app.use(errorHandler)

export { app, prisma }
