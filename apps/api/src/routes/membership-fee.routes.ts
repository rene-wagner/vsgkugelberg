import { Router } from 'express';
import { MembershipFeeService } from '@/services/membership-fee.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateMembershipFeeValidator } from '@/validators/membership-fee.validators';
import { UpdateMembershipFeeDto } from '@/types/membership-fee.types';

const router = Router();
const membershipFeeService = new MembershipFeeService();

// Public route - Get membership fee content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const membershipFee = await membershipFeeService.get();
    res.json(membershipFee);
  }),
);

// Protected route - Update membership fee content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateMembershipFeeValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateMembershipFeeDto: UpdateMembershipFeeDto = req.body;
    const membershipFee = await membershipFeeService.update(updateMembershipFeeDto);
    res.json(membershipFee);
  }),
);

export { router as membershipFeeRouter };
