import { Router } from 'express';
import { BlocksService } from '@/services/blocks.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createBlocksValidator,
  updateBlockValidator,
  uuidParamValidator,
  pageQueryValidator,
} from '@/validators/block.validators';
import { CreateBlocksDto, UpdateBlockDto } from '@/types/block.types';

const router = Router();
const blocksService = new BlocksService();

// Public route - List blocks by page
router.get(
  '/',
  pageQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { page } = req.query;
    const blocks = await blocksService.findByPage(page as string);
    res.json(blocks);
  }),
);

// Public route - Get single block by ID
router.get(
  '/:id',
  uuidParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { id } = req.params;
    const block = await blocksService.findById(id);
    res.json(block);
  }),
);

// Protected route - Create blocks for page (replaces existing)
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createBlocksValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createBlocksDto: CreateBlocksDto = req.body;
    const blocks = await blocksService.create(createBlocksDto);
    res.status(201).json(blocks);
  }),
);

// Protected route - Update block by ID
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  uuidParamValidator,
  updateBlockValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { id } = req.params;
    const updateBlockDto: UpdateBlockDto = req.body;
    const block = await blocksService.update(id, updateBlockDto);
    res.json(block);
  }),
);

// Protected route - Delete block by ID
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  uuidParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { id } = req.params;
    const block = await blocksService.remove(id);
    res.json(block);
  }),
);

export { router as blocksRouter };
