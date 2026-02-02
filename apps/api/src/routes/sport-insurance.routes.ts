import { Router } from 'express';
import { SportInsuranceService } from '@/services/sport-insurance.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { updateSportInsuranceValidator } from '@/validators/sport-insurance.validators';
import { UpdateSportInsuranceDto } from '@/types/sport-insurance.types';

const router = Router();
const sportInsuranceService = new SportInsuranceService();

// Public route - Get sport insurance content
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const sportInsurance = await sportInsuranceService.get();
    res.json(sportInsurance);
  }),
);

// Protected route - Update sport insurance content
router.patch(
  '/admin',
  jwtMiddleware,
  authGuardMiddleware,
  updateSportInsuranceValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const updateSportInsuranceDto: UpdateSportInsuranceDto = req.body;
    const sportInsurance = await sportInsuranceService.update(updateSportInsuranceDto);
    res.json(sportInsurance);
  }),
);

export { router as sportInsuranceRouter };
