import { Router } from 'express';
import { UsersService } from '@/services/users.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
} from '@/validators/user.validators';
import { CreateUserDto, UpdateUserDto } from '@/types/user.types';
import { prisma } from '@/lib/prisma.lib';

const router = Router();

const usersService = new UsersService();

router.post(
  '/',
  createUserValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const user = await usersService.create(req.body as CreateUserDto);
    res.status(201).json(user);
  }),
);

router.get(
  '/',
  asyncHandlerMiddleware(async (_req, res) => {
    const users = await usersService.findAll();
    res.json(users);
  }),
);

router.get(
  '/:id',
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const user = await usersService.findOne(Number(req.params.id));
    res.json(user);
  }),
);

router.patch(
  '/:id',
  idParamValidator,
  updateUserValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const user = await usersService.update(
      Number(req.params.id),
      req.body as UpdateUserDto,
    );
    res.json(user);
  }),
);

router.delete(
  '/:id',
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const user = await usersService.remove(Number(req.params.id));
    res.json(user);
  }),
);

router.get(
  '/:id/drafts',
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const drafts = await prisma.post.findMany({
      where: {
        authorId: Number(req.params.id),
        published: false,
      },
    });
    res.json(drafts);
  }),
);

export { router as usersRouter, prisma };
