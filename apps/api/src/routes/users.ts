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

// Initialize the users service
const usersService = new UsersService(prisma, passwordService)

/**
 * POST /api/users - Create a new user
 * @body username, email, password
 * @returns UserResponse (excludes password)
 */
router.post(
  '/',
  createUserValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.create(req.body)
    res.status(201).json(user)
  }),
)

/**
 * GET /api/users - Get all users
 * @returns UserResponse[] (excludes passwords)
 * Note: Public route in NestJS
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await usersService.findAll()
    res.json(users)
  }),
)

/**
 * GET /api/users/:id - Get a single user by ID
 * @param id - User ID
 * @returns UserResponse (excludes password)
 * Note: Public route in NestJS
 */
router.get(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.findOne(Number(req.params.id))
    res.json(user)
  }),
)

/**
 * PATCH /api/users/:id - Update a user
 * @param id - User ID
 * @body username?, email?, password? (all optional)
 * @returns UserResponse (excludes password)
 */
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

/**
 * DELETE /api/users/:id - Delete a user
 * @param id - User ID
 * @returns UserResponse (excludes password)
 */
router.delete(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler(async (req, res) => {
    const user = await usersService.remove(Number(req.params.id))
    res.json(user)
  }),
)

/**
 * GET /api/users/:id/drafts - Get user's draft posts
 * @param id - User ID
 * @returns Post[] (draft posts by user)
 * Note: Legacy route from original implementation
 */
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
