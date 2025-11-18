import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CategoriesService } from '@/services/categories.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createCategoryValidator,
  updateCategoryValidator,
  slugParamValidator,
} from '@/validators/category.validators';
import { CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';

const router = Router();
const prisma = new PrismaClient();
const categoriesService = new CategoriesService(prisma);

// Public route - List all categories
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const categories = await categoriesService.findAll();
    res.json(categories);
  }),
);

// Public route - Get single category by slug
router.get(
  '/:slug',
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const category = await categoriesService.findBySlug(slug);
    res.json(category);
  }),
);

// Protected route - Create new category
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createCategoryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createCategoryDto: CreateCategoryDto = req.body;
    const category = await categoriesService.create(createCategoryDto);
    res.status(201).json(category);
  }),
);

// Protected route - Update category by slug
router.patch(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  updateCategoryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const updateCategoryDto: UpdateCategoryDto = req.body;
    const category = await categoriesService.update(slug, updateCategoryDto);
    res.json(category);
  }),
);

// Protected route - Delete category by slug
router.delete(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const category = await categoriesService.remove(slug);
    res.json(category);
  }),
);

export { router as categoriesRouter };
