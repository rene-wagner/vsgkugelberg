import { body } from 'express-validator';

export const updateSportInsuranceValidator = [body('content').isString().trim().notEmpty().withMessage('Content is required')];
