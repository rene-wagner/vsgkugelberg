import { Router } from 'express';
import { EventsService } from '@/services/events.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { createEventValidator, updateEventValidator, idParamValidator, eventsQueryValidator } from '@/validators/event.validators';
import { CreateEventDto, UpdateEventDto, EventCategory } from '@/types/event.types';

const router = Router();
const eventsService = new EventsService();

// Public route - List events within a date range
router.get(
  '/',
  eventsQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { start, end, category } = req.query;

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const events = await eventsService.findByDateRange(startDate, endDate, category as EventCategory | undefined);

    res.json(events);
  }),
);

// Public route - Get single event by ID
router.get(
  '/:id',
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const event = await eventsService.findById(id);
    res.json(event);
  }),
);

// Protected route - Create new event
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createEventValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createEventDto: CreateEventDto = req.body;
    const event = await eventsService.create(createEventDto);
    res.status(201).json(event);
  }),
);

// Protected route - Update event by ID
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  idParamValidator,
  updateEventValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const updateEventDto: UpdateEventDto = req.body;
    const event = await eventsService.update(id, updateEventDto);
    res.json(event);
  }),
);

// Protected route - Delete event by ID
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const event = await eventsService.remove(id);
    res.json(event);
  }),
);

export { router as eventsRouter };
