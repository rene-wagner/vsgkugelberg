import { body, param } from 'express-validator';

const licensesValidator = (isRequired: boolean) =>
  body('licenses')
    .optional(!isRequired)
    .isArray({ min: 0, max: 10 })
    .withMessage('Licenses must be an array with at most 10 items')
    .custom((licenses: unknown[]) => {
      if (!Array.isArray(licenses)) return true;
      for (const license of licenses) {
        if (typeof license !== 'object' || license === null || !('name' in license) || !('variant' in license)) {
          throw new Error('Each license must have name and variant properties');
        }
        const { name, variant } = license as {
          name: unknown;
          variant: unknown;
        };
        if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
          throw new Error('License name must be between 1 and 50 characters');
        }
        if (variant !== 'gold' && variant !== 'blue') {
          throw new Error("License variant must be 'gold' or 'blue'");
        }
      }
      return true;
    });

export const createDepartmentTrainerValidator = [
  body('contactPersonId')
    .notEmpty()
    .withMessage('Contact person ID is required')
    .isInt({ min: 1 })
    .withMessage('Contact person ID must be a positive integer'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Role must be between 1 and 100 characters'),

  licensesValidator(true).notEmpty().withMessage('Licenses is required'),

  body('sort').optional().isInt({ min: 0 }).withMessage('Sort must be a non-negative integer'),
];

export const updateDepartmentTrainerValidator = [
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Role must be between 1 and 100 characters'),

  licensesValidator(false),

  body('sort').optional().isInt({ min: 0 }).withMessage('Sort must be a non-negative integer'),
];

export const trainerIdParamValidator = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];

export const reorderDepartmentTrainersValidator = [
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),

  body('ids.*').isInt({ min: 1 }).withMessage('Each ID must be a positive integer'),

  body('ids').custom((ids: number[]) => {
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error('IDs array must not contain duplicates');
    }
    return true;
  }),
];
