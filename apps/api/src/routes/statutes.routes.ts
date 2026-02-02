import { Router } from 'express';
import { StatutesService } from '@/services/statutes.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateStatutesValidator } from '@/validators/statutes.validators';
import { UpdateStatutesDto } from '@/types/statutes.types';

const router = Router();
const statutesService = new StatutesService();

// Public route - Get statutes content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const statutes = await statutesService.get();
    res.json(statutes);
  }),
);

// Protected route - Update statutes content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateStatutesValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateStatutesDto: UpdateStatutesDto = req.body;
    const statutes = await statutesService.update(updateStatutesDto);
    res.json(statutes);
  }),
);

export { router as statutesRouter };
