import { body, param } from 'express-validator';

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
];

export const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('parentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer or null'),
];

export const moveCategoryValidator = [
  body('parentId').custom((value) => {
    if (value !== null && (!Number.isInteger(value) || value < 1)) {
      throw new Error('Parent ID must be a positive integer or null');
    }
    return true;
  }),
];

export const slugParamValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
];
