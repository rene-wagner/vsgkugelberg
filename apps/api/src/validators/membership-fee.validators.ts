import { body } from 'express-validator';

export const updateMembershipFeeValidator = [body('content').isString().trim().notEmpty().withMessage('Content is required')];
