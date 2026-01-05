import { Router } from 'express';
import { MediaService } from '@/services/media.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import {
  mediaQueryValidator,
  mediaIdParamValidator,
  moveMediaValidator,
} from '@/validators/media.validators';
import { upload } from '@/config/upload.config';
import { BadRequestException } from '@/errors/http-errors';

const router = Router();
const mediaService = new MediaService();

// Protected route - List all media with pagination
router.get(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  mediaQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 24;
    const folderId =
      req.query.folderId !== undefined
        ? req.query.folderId === 'null'
          ? null
          : Number(req.query.folderId)
        : undefined;

    const result = await mediaService.findAll(page, limit, folderId);
    res.json(result);
  }),
);

// Protected route - Get single media by ID
router.get(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  mediaIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const media = await mediaService.findById(id);
    res.json(media);
  }),
);

// Protected route - Upload new media
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  upload.single('file'),
  asyncHandlerMiddleware(async (req, res) => {
    if (!req.file) {
      throw new BadRequestException('No file uploaded');
    }

    const body = req.body as { folderId?: string };
    const folderId = body.folderId ? Number(body.folderId) : null;

    const media = await mediaService.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.filename, // Just the filename, path is constructed from UPLOAD_DIR
      mimetype: req.file.mimetype,
      size: req.file.size,
      type: 'IMAGE',
      folderId,
    });

    res.status(201).json(media);
  }),
);

// Protected route - Move media to folder
router.patch(
  '/:id/move',
  jwtMiddleware,
  authGuardMiddleware,
  mediaIdParamValidator,
  moveMediaValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const body = req.body as { folderId: string | number | null };
    const folderId =
      body.folderId === 'null'
        ? null
        : body.folderId === null
          ? null
          : Number(body.folderId);
    const media = await mediaService.move(id, folderId);
    res.json(media);
  }),
);

// Protected route - Delete media by ID
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  mediaIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const media = await mediaService.remove(id);
    res.json(media);
  }),
);

// Protected route - Regenerate thumbnails for all media (batch)
// NOTE: This route must be defined before /:id/regenerate-thumbnails to avoid route conflicts
router.post(
  '/regenerate-thumbnails',
  jwtMiddleware,
  authGuardMiddleware,
  asyncHandlerMiddleware(async (_req, res) => {
    const result = await mediaService.regenerateAllThumbnails();
    res.json(result);
  }),
);

// Protected route - Regenerate thumbnails for specific media
router.post(
  '/:id/regenerate-thumbnails',
  jwtMiddleware,
  authGuardMiddleware,
  mediaIdParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const media = await mediaService.regenerateThumbnails(id);
    res.json(media);
  }),
);

export { router as mediaRouter };
