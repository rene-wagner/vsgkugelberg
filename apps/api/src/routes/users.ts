import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { UsersService } from '../services/users.service'
import { passwordService } from '../services/password.service'
import { asyncHandler } from '../middleware/async-handler'
import { validate } from '../middleware/validation'
import {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
} from '../validators/user.validators'

const router = Router()
const prisma = new PrismaClient()

const usersService = new UsersService(prisma, passwordService)

router.post(
  '/',
  createUserValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.create(req.body)
    res.status(201).json(user)
  }),
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await usersService.findAll()
    res.json(users)
  }),
)

router.get(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.findOne(Number(req.params.id))
    res.json(user)
  }),
)

router.patch(
  '/:id',
  idParamValidator,
  updateUserValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.update(Number(req.params.id), req.body)
    res.json(user)
  }),
)

router.delete(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.remove(Number(req.params.id))
    res.json(user)
  }),
)

router.get(
  '/:id/drafts',
  idParamValidator,
  validate,
  asyncHandler(async (req, res) => {
    const drafts = await prisma.post.findMany({
      where: {
        authorId: Number(req.params.id),
        published: false,
      },
    })
    res.json(drafts)
  }),
)

export { router as usersRouter, prisma }
