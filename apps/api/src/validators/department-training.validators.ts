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
    .optional({ values: 'undefined' })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Age range must be at most 50 characters'),

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
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && value.length <= 50) return true;
      throw new Error('Age range must be at most 50 characters or null');
    }),

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

export const reorderTrainingGroupsValidator = [
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),

  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a positive integer'),

  body('ids').custom((ids: number[]) => {
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error('IDs array must not contain duplicates');
    }
    return true;
  }),
];

export const reorderTrainingSessionsValidator = [
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),

  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a positive integer'),

  body('ids').custom((ids: number[]) => {
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error('IDs array must not contain duplicates');
    }
    return true;
  }),
];
