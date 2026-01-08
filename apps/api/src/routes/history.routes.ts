import { Router } from 'express';
import { HistoryService } from '@/services/history.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateHistoryValidator } from '@/validators/history.validators';
import { UpdateHistoryDto } from '@/types/history.types';

const router = Router();
const historyService = new HistoryService();

// Public route - Get history content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const history = await historyService.get();
    res.json(history);
  }),
);

// Protected route - Update history content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateHistoryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateHistoryDto: UpdateHistoryDto = req.body;
    const history = await historyService.update(updateHistoryDto);
    res.json(history);
  }),
);

export { router as historyRouter };
