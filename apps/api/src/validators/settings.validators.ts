import { body } from 'express-validator';

const currentYear = new Date().getFullYear();

export const updateSettingsValidator = [
  body('foundingYear')
    .optional({ values: 'null' })
    .isInt({ min: 1800, max: currentYear })
    .withMessage(`Founding year must be between 1800 and ${currentYear}`),

  body('address')
    .optional({ values: 'null' })
    .trim()
    .isString()
    .withMessage('Address must be a string')
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  body('memberCount')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 100000 })
    .withMessage('Member count must be between 1 and 100000'),

  body('contactEmail')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Contact email must be a valid email address'),

  body('contactPhone')
    .optional({ values: 'null' })
    .trim()
    .isString()
    .withMessage('Contact phone must be a string')
    .isLength({ max: 30 })
    .withMessage('Contact phone must not exceed 30 characters'),
];
