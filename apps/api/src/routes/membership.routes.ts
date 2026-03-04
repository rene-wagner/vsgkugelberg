import { Router } from 'express';
import { MembershipService } from '@/services/membership.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateMembershipValidator } from '@/validators/membership.validators';
import { UpdateMembershipDto } from '@/types/membership.types';

const router = Router();
const membershipService = new MembershipService();

// Public route - Get membership content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const membership = await membershipService.get();
    res.json(membership);
  }),
);

// Protected route - Update membership content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateMembershipValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateMembershipDto: UpdateMembershipDto = req.body;
    const membership = await membershipService.update(updateMembershipDto);
    res.json(membership);
  }),
);

export { router as membershipRouter };
