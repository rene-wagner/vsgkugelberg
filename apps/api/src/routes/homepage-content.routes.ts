import { Router } from 'express';
import { HomepageContentService } from '@/services/homepage-content.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateHomepageContentValidator } from '@/validators/homepage-content.validators';
import { UpdateHomepageContentDto } from '@/types/homepage-content.types';

const router = Router();
const homepageContentService = new HomepageContentService();

router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const homepageContent = await homepageContentService.get();
    res.json(homepageContent);
  }),
);

router.patch(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  updateHomepageContentValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateHomepageContentDto: UpdateHomepageContentDto = req.body;
    const homepageContent = await homepageContentService.update(updateHomepageContentDto);
    res.json(homepageContent);
  }),
);

export { router as homepageContentRouter };
