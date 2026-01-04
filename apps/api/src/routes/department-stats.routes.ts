import { Router } from 'express';
import { DepartmentStatsService } from '@/services/department-stats.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createDepartmentStatValidator,
  updateDepartmentStatValidator,
  statIdParamValidator,
  reorderDepartmentStatsValidator,
} from '@/validators/department-stat.validators';
import {
  CreateDepartmentStatDto,
  UpdateDepartmentStatDto,
} from '@/types/department-stat.types';

// Router with mergeParams to access :slug from parent router
const router = Router({ mergeParams: true });
const statsService = new DepartmentStatsService();

// Protected route - Create stat for department
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createDepartmentStatValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const dto: CreateDepartmentStatDto = req.body;
    const stat = await statsService.create(slug, dto);
    res.status(201).json(stat);
  }),
);

// Protected route - Reorder stats (must be before /:id routes)
router.patch(
  '/reorder',
  jwtMiddleware,
  authGuardMiddleware,
  reorderDepartmentStatsValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const { ids } = req.body;
    const stats = await statsService.reorder(slug, ids);
    res.json(stats);
  }),
);

// Protected route - Update stat
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  statIdParamValidator,
  updateDepartmentStatValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const dto: UpdateDepartmentStatDto = req.body;
    const stat = await statsService.update(slug, parseInt(id, 10), dto);
    res.json(stat);
  }),
);

// Protected route - Delete stat
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  statIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const stat = await statsService.remove(slug, parseInt(id, 10));
    res.json(stat);
  }),
);

export { router as departmentStatsRouter };
