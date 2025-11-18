import { PrismaClient } from '@prisma/client'
import express from 'express'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { router } from './routes'
import { errorHandlerMiddleware, notFoundHandler } from './middleware/error-handler.middleware'
import './strategies/local.strategy'

const prisma = new PrismaClient()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use('/api', router)
app.use(notFoundHandler)
app.use(errorHandlerMiddleware)

export { app, prisma }
