import { Router } from 'express';
import { TagsService } from '@/services/tags.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createTagValidator,
  updateTagValidator,
  slugParamValidator,
} from '@/validators/tag.validators';
import { CreateTagDto, UpdateTagDto } from '@/types/tag.types';

const router = Router();
const tagsService = new TagsService();

// Public route - List all tags with post counts
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const tags = await tagsService.findAll();
    res.json(tags);
  }),
);

// Public route - Get single tag by slug with posts
router.get(
  '/:slug',
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const tag = await tagsService.findBySlug(slug);
    res.json(tag);
  }),
);

// Protected route - Create new tag
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createTagValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createTagDto: CreateTagDto = req.body;
    const tag = await tagsService.create(createTagDto);
    res.status(201).json(tag);
  }),
);

// Protected route - Update tag by slug
router.patch(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  updateTagValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const updateTagDto: UpdateTagDto = req.body;
    const tag = await tagsService.update(slug, updateTagDto);
    res.json(tag);
  }),
);

// Protected route - Delete tag by slug
router.delete(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const tag = await tagsService.remove(slug);
    res.json(tag);
  }),
);

export { router as tagsRouter };
