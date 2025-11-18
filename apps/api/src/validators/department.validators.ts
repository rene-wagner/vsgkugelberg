import { body, param } from 'express-validator'

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
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),

  body('longDescription')
    .trim()
    .notEmpty()
    .withMessage('Long description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Long description must be between 20 and 5000 characters'),
]

export const updateDepartmentValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),

  body('longDescription')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Long description must be between 20 and 5000 characters'),
]

export const slugParamValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
]
