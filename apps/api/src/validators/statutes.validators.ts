import { body } from 'express-validator';

export const updateStatutesValidator = [body('content').isString().trim().notEmpty().withMessage('Content is required')];
