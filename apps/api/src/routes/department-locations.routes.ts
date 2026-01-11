import { Router } from 'express';
import { DepartmentLocationsService } from '@/services/department-locations.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createDepartmentLocationValidator,
  updateDepartmentLocationValidator,
  locationIdParamValidator,
  reorderDepartmentLocationsValidator,
} from '@/validators/department-location.validators';
import { CreateDepartmentLocationDto, UpdateDepartmentLocationDto } from '@/types/department-location.types';

// Router with mergeParams to access :slug from parent router
const router = Router({ mergeParams: true });
const locationsService = new DepartmentLocationsService();

// Protected route - Create location for department
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createDepartmentLocationValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const dto: CreateDepartmentLocationDto = req.body;
    const location = await locationsService.create(slug, dto);
    res.status(201).json(location);
  }),
);

// Protected route - Reorder locations (must be before /:id routes)
router.patch(
  '/reorder',
  jwtMiddleware,
  authGuardMiddleware,
  reorderDepartmentLocationsValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const body = req.body as { ids: number[] };
    const locations = await locationsService.reorder(slug, body.ids);
    res.json(locations);
  }),
);

// Protected route - Update location
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  locationIdParamValidator,
  updateDepartmentLocationValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const dto: UpdateDepartmentLocationDto = req.body;
    const location = await locationsService.update(slug, parseInt(id, 10), dto);
    res.json(location);
  }),
);

// Protected route - Delete location
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  locationIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, id } = req.params;
    const location = await locationsService.remove(slug, parseInt(id, 10));
    res.json(location);
  }),
);

export { router as departmentLocationsRouter };
