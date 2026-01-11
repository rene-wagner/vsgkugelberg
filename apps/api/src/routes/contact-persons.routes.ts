import { Router } from 'express';
import { ContactPersonsService } from '@/services/contact-persons.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { authGuardMiddleware } from '@/middleware/auth-guard.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { jwtMiddleware } from '@/middleware/jwt.middleware';
import { createContactPersonValidator, updateContactPersonValidator, idParamValidator } from '@/validators/contact-person.validators';
import { paginationQueryValidator } from '@/validators/pagination.validators';
import { CreateContactPersonDto, UpdateContactPersonDto } from '@/types/contact-person.types';

const router = Router();
const contactPersonsService = new ContactPersonsService();

// Public route - List all contact persons
router.get(
  '/',
  paginationQueryValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await contactPersonsService.findAll(page, limit);
    res.json(result);
  }),
);

// Public route - Get single contact person by ID
router.get(
  '/:id',
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const contactPerson = await contactPersonsService.findById(id);
    res.json(contactPerson);
  }),
);

// Protected route - Create new contact person
router.post(
  '/',
  jwtMiddleware,
  authGuardMiddleware,
  createContactPersonValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const createContactPersonDto: CreateContactPersonDto = req.body;
    const contactPerson = await contactPersonsService.create(createContactPersonDto);
    res.status(201).json(contactPerson);
  }),
);

// Protected route - Update contact person by ID
router.patch(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  idParamValidator,
  updateContactPersonValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const updateContactPersonDto: UpdateContactPersonDto = req.body;
    const contactPerson = await contactPersonsService.update(id, updateContactPersonDto);
    res.json(contactPerson);
  }),
);

// Protected route - Delete contact person by ID
router.delete(
  '/:id',
  jwtMiddleware,
  authGuardMiddleware,
  idParamValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const contactPerson = await contactPersonsService.remove(id);
    res.json(contactPerson);
  }),
);

export { router as contactPersonsRouter };
