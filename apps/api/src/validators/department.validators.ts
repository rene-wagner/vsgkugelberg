import { body, param } from 'express-validator';

export const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Short description must be between 10 and 5000 characters'),

  body('iconId').optional().isInt({ min: 1 }).withMessage('Icon ID must be a positive integer'),
];

export const updateDepartmentValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('shortDescription').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Short description must be between 10 and 5000 characters'),

  body('iconId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (Number.isInteger(value) && value >= 1) return true;
      throw new Error('Icon ID must be a positive integer or null');
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
