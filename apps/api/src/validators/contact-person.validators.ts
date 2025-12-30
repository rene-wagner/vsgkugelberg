import { body, param } from 'express-validator';

export const createContactPersonValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Type must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('address')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be at most 500 characters'),

  body('phone').trim().notEmpty().withMessage('Phone is required'),

  body('profileImageId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Profile image ID must be a positive integer'),
];

export const updateContactPersonValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('type')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Type must be between 2 and 100 characters'),

  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('address')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be at most 500 characters'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty'),

  body('profileImageId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (Number.isInteger(value) && value >= 1) return true;
      throw new Error('Profile image ID must be a positive integer or null');
    }),
];

export const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];
