import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get(
  '/',
  jwtMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { password: _password, ...userData } = user;

    res.json({ user: userData });
  }),
);

export { router as meRouter };
