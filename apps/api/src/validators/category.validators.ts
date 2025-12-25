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

/**
 * Validator for hierarchical slug paths from wildcard routes.
 * Accepts slugs like "sports", "sports/volleyball", "sports/volleyball/beach".
 * Each segment must be lowercase alphanumeric with hyphens.
 */
export const hierarchicalSlugValidator = [
  param('slugPath')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ max: 255 })
    .withMessage('Slug must not exceed 255 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/)
    .withMessage(
      'Slug must be lowercase alphanumeric with hyphens, segments separated by /',
    ),
];
