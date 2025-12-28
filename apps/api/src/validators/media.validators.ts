import { param, query } from 'express-validator';

export const mediaQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const mediaIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
    .toInt(),
];
