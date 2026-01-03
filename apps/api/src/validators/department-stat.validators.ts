import { body, param } from 'express-validator';

export const createDepartmentStatValidator = [
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Label is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters'),

  body('value')
    .trim()
    .notEmpty()
    .withMessage('Value is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const updateDepartmentStatValidator = [
  body('label')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Label cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters'),

  body('value')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Value cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const statIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];
