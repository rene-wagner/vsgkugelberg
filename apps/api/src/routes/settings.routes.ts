import { Router } from 'express';
import { SettingsService } from '@/services/settings.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateSettingsValidator } from '@/validators/settings.validators';
import { UpdateSettingsDto } from '@/types/settings.types';

const router = Router();
const settingsService = new SettingsService();

// Public route - Get settings
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const settings = await settingsService.get();
    res.json(settings);
  }),
);

// Protected route - Update settings
router.patch(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  updateSettingsValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateSettingsDto: UpdateSettingsDto = req.body;
    const settings = await settingsService.update(updateSettingsDto);
    res.json(settings);
  }),
);

export { router as settingsRouter };
