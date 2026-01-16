import { body, param, query } from 'express-validator';

export const mediaQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),

  query('folderId')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === 'null' || value === null) return true;
      return !isNaN(Number(value)) && Number(value) > 0;
    })
    .withMessage('folderId must be null or a positive integer'),
];

export const mediaIdParamValidator = [
  param('id').notEmpty().withMessage('ID is required').isInt({ min: 1 }).withMessage('ID must be a positive integer').toInt(),
];

export const moveMediaValidator = [
  body('folderId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (typeof value === 'number') {
        return Number.isInteger(value) && value > 0;
      }
      if (typeof value === 'string') {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num) && num > 0;
      }
      return false;
    })
    .withMessage('folderId must be null or a positive integer'),
];
