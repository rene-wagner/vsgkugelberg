import { Router } from 'express';
import { DepartmentTrainingService } from '@/services/department-training.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  createTrainingGroupValidator,
  updateTrainingGroupValidator,
  createTrainingSessionValidator,
  updateTrainingSessionValidator,
  groupIdParamValidator,
  sessionIdParamValidator,
  reorderTrainingGroupsValidator,
  reorderTrainingSessionsValidator,
} from '@/validators/department-training.validators';
import {
  CreateDepartmentTrainingGroupDto,
  UpdateDepartmentTrainingGroupDto,
  CreateDepartmentTrainingSessionDto,
  UpdateDepartmentTrainingSessionDto,
} from '@/types/department-training.types';

// Router with mergeParams to access :slug from parent router
const router = Router({ mergeParams: true });
const trainingService = new DepartmentTrainingService();

// ======== Training Groups ========

// Protected route - Create training group
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createTrainingGroupValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const dto: CreateDepartmentTrainingGroupDto = req.body;
    const group = await trainingService.createGroup(slug, dto);
    res.status(201).json(group);
  }),
);

// Protected route - Reorder training groups (must be before /:groupId routes)
router.patch(
  '/reorder',
  jwtMiddleware,
  authGuardMiddleware,
  reorderTrainingGroupsValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug } = req.params;
    const { ids } = req.body;
    const groups = await trainingService.reorderGroups(slug, ids);
    res.json(groups);
  }),
);

// Protected route - Update training group
router.patch(
  '/:groupId',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  updateTrainingGroupValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId } = req.params;
    const dto: UpdateDepartmentTrainingGroupDto = req.body;
    const group = await trainingService.updateGroup(
      slug,
      parseInt(groupId, 10),
      dto,
    );
    res.json(group);
  }),
);

// Protected route - Delete training group
router.delete(
  '/:groupId',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId } = req.params;
    const group = await trainingService.removeGroup(
      slug,
      parseInt(groupId, 10),
    );
    res.json(group);
  }),
);

// ======== Training Sessions ========

// Protected route - Reorder sessions within a training group (must be before /:groupId/sessions/:id routes)
router.patch(
  '/:groupId/sessions/reorder',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  reorderTrainingSessionsValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId } = req.params;
    const { ids } = req.body;
    const sessions = await trainingService.reorderSessions(
      slug,
      parseInt(groupId, 10),
      ids,
    );
    res.json(sessions);
  }),
);

// Protected route - Create session for training group
router.post(
  '/:groupId/sessions',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  createTrainingSessionValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId } = req.params;
    const dto: CreateDepartmentTrainingSessionDto = req.body;
    const session = await trainingService.createSession(
      slug,
      parseInt(groupId, 10),
      dto,
    );
    res.status(201).json(session);
  }),
);

// Protected route - Update session
router.patch(
  '/:groupId/sessions/:id',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  sessionIdParamValidator,
  updateTrainingSessionValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId, id } = req.params;
    const dto: UpdateDepartmentTrainingSessionDto = req.body;
    const session = await trainingService.updateSession(
      slug,
      parseInt(groupId, 10),
      parseInt(id, 10),
      dto,
    );
    res.json(session);
  }),
);

// Protected route - Delete session
router.delete(
  '/:groupId/sessions/:id',
  jwtMiddleware,
  authGuardMiddleware,
  groupIdParamValidator,
  sessionIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { slug, groupId, id } = req.params;
    const session = await trainingService.removeSession(
      slug,
      parseInt(groupId, 10),
      parseInt(id, 10),
    );
    res.json(session);
  }),
);

export { router as departmentTrainingRouter };
