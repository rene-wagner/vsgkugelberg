import { Router } from 'express';
import { DepartmentTrainersService } from '@/services/department-trainers.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createDepartmentTrainerValidator,
  updateDepartmentTrainerValidator,
  trainerIdParamValidator,
} from '@/validators/department-trainer.validators';
import {
  CreateDepartmentTrainerDto,
  UpdateDepartmentTrainerDto,
} from '@/types/department-trainer.types';

// Router with mergeParams to access :slug from parent router
const router = Router({ mergeParams: true });
const trainersService = new DepartmentTrainersService();

// Protected route - Create trainer for department
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createDepartmentTrainerValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const dto: CreateDepartmentTrainerDto = req.body;
    const trainer = await trainersService.create(slug, dto);
    res.status(201).json(trainer);
  }),
);

// Protected route - Update trainer
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  trainerIdParamValidator,
  updateDepartmentTrainerValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const dto: UpdateDepartmentTrainerDto = req.body;
    const trainer = await trainersService.update(slug, parseInt(id, 10), dto);
    res.json(trainer);
  }),
);

// Protected route - Delete trainer
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  trainerIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const trainer = await trainersService.remove(slug, parseInt(id, 10));
    res.json(trainer);
  }),
);

export { router as departmentTrainersRouter };
