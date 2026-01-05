import { Router } from 'express';
import { MediaFolderService } from '@/services/media-folder.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  mediaFolderQueryValidator,
  mediaFolderIdParamValidator,
  createMediaFolderValidator,
  updateMediaFolderValidator,
} from '@/validators/media-folder.validators';

import {
  CreateMediaFolderDto,
  UpdateMediaFolderDto,
} from '@/types/media.types';

const router = Router();
const folderService = new MediaFolderService();

// Protected route - List folders
router.get(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  mediaFolderQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const parentId = req.query.parentId
      ? req.query.parentId === 'null'
        ? null
        : Number(req.query.parentId)
      : null;
    const folders = await folderService.findAll(parentId);
    res.json(folders);
  }),
);

// Protected route - Get single folder by ID
router.get(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  mediaFolderIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const folder = await folderService.findById(id);
    res.json(folder);
  }),
);

// Protected route - Create new folder
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createMediaFolderValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const folder = await folderService.create(req.body as CreateMediaFolderDto);
    res.status(201).json(folder);
  }),
);

// Protected route - Update folder
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  mediaFolderIdParamValidator,
  updateMediaFolderValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const folder = await folderService.update(
      id,
      req.body as UpdateMediaFolderDto,
    );
    res.json(folder);
  }),
);

// Protected route - Delete folder
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  mediaFolderIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const folder = await folderService.remove(id);
    res.json(folder);
  }),
);

export { router as mediaFolderRouter };
