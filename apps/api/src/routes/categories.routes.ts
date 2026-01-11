import { Router, Request, Response } from 'express';
import { CategoriesService } from '@/services/categories.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { createCategoryValidator, updateCategoryValidator } from '@/validators/category.validators';
import { CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';
import { BadRequestException } from '@/errors/http-errors';

const router = Router();
const categoriesService = new CategoriesService();

/**
 * Extract and validate the hierarchical slug from wildcard route params.
 * Express v5 returns wildcard params as an array in req.params.slugPath.
 */
function extractSlug(req: Request): string {
  // In Express v5, wildcard params are returned as an array
  const slugPath = req.params.slugPath;
  const slug = Array.isArray(slugPath) ? slugPath.join('/') : slugPath;

  if (!slug || slug.trim() === '') {
    throw new BadRequestException('Slug is required');
  }

  // Validate slug format: lowercase alphanumeric with hyphens, segments separated by /
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
  if (!slugPattern.test(slug)) {
    throw new BadRequestException('Slug must be lowercase alphanumeric with hyphens, segments separated by /');
  }

  if (slug.length > 255) {
    throw new BadRequestException('Slug must not exceed 255 characters');
  }

  return slug;
}

// Public route - List all categories
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const categories = await categoriesService.findAll();
    res.json(categories);
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

// Protected route - Recalculate all category slugs
router.post(
  '/recalculate-slugs',
  jwtMiddleware,
  authGuardMiddleware,
  asyncHandlerMiddleware(async (_req, res) => {
    const result = await categoriesService.recalculateAllSlugs();
    res.json(result);
  }),
);

// Public route - Get single category by hierarchical slug (wildcard route)
// Must be after POST / to avoid conflicts
router.get(
  '/*slugPath',
  asyncHandlerMiddleware(async (req: Request, res: Response) => {
    const slug = extractSlug(req);
    const category = await categoriesService.findBySlug(slug);
    res.json(category);
  }),
);

// Protected route - Update category by hierarchical slug (wildcard route)
router.patch(
  '/*slugPath',
  jwtMiddleware,
  authGuardMiddleware,
  updateCategoryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req: Request, res: Response) => {
    const slug = extractSlug(req);
    const updateCategoryDto: UpdateCategoryDto = req.body;
    const category = await categoriesService.update(slug, updateCategoryDto);
    res.json(category);
  }),
);

// Protected route - Delete category by hierarchical slug (wildcard route)
router.delete(
  '/*slugPath',
  jwtMiddleware,
  authGuardMiddleware,
  asyncHandlerMiddleware(async (req: Request, res: Response) => {
    const slug = extractSlug(req);
    const category = await categoriesService.remove(slug);
    res.json(category);
  }),
);

export { router as categoriesRouter };
