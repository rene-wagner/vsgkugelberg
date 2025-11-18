import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
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
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '@/types/department.types';

const router = Router();
const prisma = new PrismaClient();
const departmentsService = new DepartmentsService(prisma);

// Public route - List all departments
router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const departments = await departmentsService.findAll();
    res.json(departments);
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

export { router as departmentsRouter };
