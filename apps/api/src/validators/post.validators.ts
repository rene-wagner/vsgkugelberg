import { body, param, query } from 'express-validator';

export const createPostValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('content').optional().isString().withMessage('Content must be a string'),

  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean')
    .toBoolean(),

  body('authorId')
    .notEmpty()
    .withMessage('Author ID is required')
    .isInt({ min: 1 })
    .withMessage('Author ID must be a positive integer')
    .toInt(),

  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),

  body('categoryIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category ID must be a positive integer')
    .toInt(),

  body('tagIds').optional().isArray().withMessage('Tag IDs must be an array'),

  body('tagIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a positive integer')
    .toInt(),
];

export const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('content').optional().isString().withMessage('Content must be a string'),

  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean')
    .toBoolean(),

  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),

  body('categoryIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category ID must be a positive integer')
    .toInt(),

  body('tagIds').optional().isArray().withMessage('Tag IDs must be an array'),

  body('tagIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a positive integer')
    .toInt(),
];

export const slugParamValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
];

export const postsQueryValidator = [
  query('published')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Published must be "true" or "false"'),

  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category slug cannot be empty'),

  query('tag')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tag slug cannot be empty'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .toInt(),
];
