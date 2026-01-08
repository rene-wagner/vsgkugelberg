import { Router } from 'express';

import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';
import { postsRouter } from './posts.routes';
import { categoriesRouter } from './categories.routes';
import { departmentsRouter } from './departments.routes';
import { healthRouter } from './health.routes';
import { meRouter } from './me.routes';
import { settingsRouter } from './settings.routes';
import { eventsRouter } from './events.routes';
import { contactPersonsRouter } from './contact-persons.routes';
import { mediaRouter } from './media.routes';
import { mediaFolderRouter } from './media-folders.routes';
import { contactRouter } from './contact.routes';
import { historyRouter } from './history.routes';

const router = Router();

router.use('/me', meRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/categories', categoriesRouter);
router.use('/departments', departmentsRouter);
router.use('/health', healthRouter);
router.use('/settings', settingsRouter);
router.use('/events', eventsRouter);
router.use('/contact-persons', contactPersonsRouter);
router.use('/media/folders', mediaFolderRouter);
router.use('/media', mediaRouter);
router.use('/contact', contactRouter);
router.use('/history', historyRouter);

export { router };
