import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PostsService } from '@/services/posts.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createPostValidator,
  updatePostValidator,
  slugParamValidator,
  postsQueryValidator,
} from '@/validators/post.validators';
import { CreatePostDto, UpdatePostDto } from '@/types/post.types';

const router = Router();
const prisma = new PrismaClient();
const postsService = new PostsService(prisma);

// Public route - List all posts with optional filters
router.get(
  '/',
  postsQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { published, category, tag } = req.query;

    // Convert query string to boolean if present
    const publishedFilter =
      published === 'true' ? true : published === 'false' ? false : undefined;

    const posts = await postsService.findAll(
      publishedFilter,
      category as string | undefined,
      tag as string | undefined,
    );

    res.json(posts);
  }),
);

// Public route - Get single post by slug
router.get(
  '/:slug',
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const post = await postsService.findBySlug(slug);
    res.json(post);
  }),
);

// Protected route - Create new post
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createPostValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createPostDto: CreatePostDto = req.body;
    const post = await postsService.create(createPostDto);
    res.status(201).json(post);
  }),
);

// Protected route - Update post by slug
router.patch(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  updatePostValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const updatePostDto: UpdatePostDto = req.body;
    const post = await postsService.update(slug, updatePostDto);
    res.json(post);
  }),
);

// Protected route - Delete post by slug
router.delete(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const post = await postsService.remove(slug);
    res.json(post);
  }),
);

export { router as postsRouter };
