import { Router } from 'express';
import { BoardContentService } from '@/services/board-content.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateBoardContentValidator } from '@/validators/board-content.validators';
import { UpdateBoardContentDto } from '@/types/board-content.types';

const router = Router();
const boardContentService = new BoardContentService();

// Public route - Get board content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const boardContent = await boardContentService.get();
    res.json(boardContent);
  }),
);

// Protected route - Update board content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateBoardContentValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateBoardContentDto: UpdateBoardContentDto = req.body;
    const boardContent = await boardContentService.update(updateBoardContentDto);
    res.json(boardContent);
  }),
);

export { router as boardContentRouter };
