import { Router } from 'express';
import { DepartmentsService } from '@/services/departments.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  slugParamValidator,
} from '@/validators/department.validators';
import { paginationQueryValidator } from '@/validators/pagination.validators';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '@/types/department.types';

// Import nested routers
import { departmentStatsRouter } from './department-stats.routes';
import { departmentTrainingRouter } from './department-training.routes';
import { departmentLocationsRouter } from './department-locations.routes';
import { departmentTrainersRouter } from './department-trainers.routes';

const router = Router();
const departmentsService = new DepartmentsService();

// Public route - List all departments
router.get(
  '/',
  paginationQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await departmentsService.findAll(page, limit);
    res.json(result);
  }),
);

// Public route - Get single department by slug
router.get(
  '/:slug',
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const department = await departmentsService.findBySlug(slug);
    res.json(department);
  }),
);

// Protected route - Create new department
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createDepartmentValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createDepartmentDto: CreateDepartmentDto = req.body;
    const department = await departmentsService.create(createDepartmentDto);
    res.status(201).json(department);
  }),
);

// Protected route - Update department by slug
router.patch(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  updateDepartmentValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const updateDepartmentDto: UpdateDepartmentDto = req.body;
    const department = await departmentsService.update(
      slug,
      updateDepartmentDto,
    );
    res.json(department);
  }),
);

// Protected route - Delete department by slug
router.delete(
  '/:slug',
  jwtMiddleware,
  authGuardMiddleware,
  slugParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const department = await departmentsService.remove(slug);
    res.json(department);
  }),
);

// Mount nested routers for department sub-resources
router.use('/:slug/stats', departmentStatsRouter);
router.use('/:slug/training-groups', departmentTrainingRouter);
router.use('/:slug/locations', departmentLocationsRouter);
router.use('/:slug/trainers', departmentTrainersRouter);

export { router as departmentsRouter };
