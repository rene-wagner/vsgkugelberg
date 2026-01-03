import { body, param } from 'express-validator';

// Training Group Validators
export const createTrainingGroupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('ageRange')
    .trim()
    .notEmpty()
    .withMessage('Age range is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Age range must be between 1 and 50 characters'),

  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required')
    .isIn(['youth', 'adults'])
    .withMessage("Icon must be 'youth' or 'adults'"),

  body('variant')
    .trim()
    .notEmpty()
    .withMessage('Variant is required')
    .isIn(['primary', 'secondary'])
    .withMessage("Variant must be 'primary' or 'secondary'"),

  body('note')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be at most 500 characters'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const updateTrainingGroupValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('ageRange')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Age range cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Age range must be between 1 and 50 characters'),

  body('icon')
    .optional()
    .trim()
    .isIn(['youth', 'adults'])
    .withMessage("Icon must be 'youth' or 'adults'"),

  body('variant')
    .optional()
    .trim()
    .isIn(['primary', 'secondary'])
    .withMessage("Variant must be 'primary' or 'secondary'"),

  body('note')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (typeof value === 'string' && value.length <= 500) return true;
      throw new Error(
        'Note must be a string of at most 500 characters or null',
      );
    }),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

// Training Session Validators
export const createTrainingSessionValidator = [
  body('day')
    .trim()
    .notEmpty()
    .withMessage('Day is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Day must be between 1 and 20 characters'),

  body('time')
    .trim()
    .notEmpty()
    .withMessage('Time is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Time must be between 1 and 30 characters'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const updateTrainingSessionValidator = [
  body('day')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Day cannot be empty')
    .isLength({ min: 1, max: 20 })
    .withMessage('Day must be between 1 and 20 characters'),

  body('time')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Time cannot be empty')
    .isLength({ min: 1, max: 30 })
    .withMessage('Time must be between 1 and 30 characters'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const groupIdParamValidator = [
  param('groupId')
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer'),
];

export const sessionIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];
