import { body, param } from 'express-validator';

const amenitiesValidator = (isRequired: boolean) =>
  body('amenities')
    .optional(!isRequired)
    .isArray({ min: 0, max: 3 })
    .withMessage('Amenities must be an array with at most 3 items')
    .custom((amenities: unknown[]) => {
      if (!Array.isArray(amenities)) return true;
      for (const amenity of amenities) {
        if (
          typeof amenity !== 'object' ||
          amenity === null ||
          !('text' in amenity)
        ) {
          throw new Error('Each amenity must have a text property');
        }
        const text = (amenity as { text: unknown }).text;
        if (typeof text !== 'string' || text.length < 1 || text.length > 100) {
          throw new Error('Amenity text must be between 1 and 100 characters');
        }
      }
      return true;
    });

export const createDepartmentLocationValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('badge')
    .trim()
    .notEmpty()
    .withMessage('Badge is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Badge must be between 1 and 50 characters'),

  body('badgeVariant')
    .trim()
    .notEmpty()
    .withMessage('Badge variant is required')
    .isIn(['primary', 'secondary'])
    .withMessage("Badge variant must be 'primary' or 'secondary'"),

  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Street must be between 1 and 200 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('mapsUrl')
    .trim()
    .notEmpty()
    .withMessage('Maps URL is required')
    .isURL()
    .withMessage('Maps URL must be a valid URL'),

  amenitiesValidator(true).notEmpty().withMessage('Amenities is required'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const updateDepartmentLocationValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('badge')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Badge cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Badge must be between 1 and 50 characters'),

  body('badgeVariant')
    .optional()
    .trim()
    .isIn(['primary', 'secondary'])
    .withMessage("Badge variant must be 'primary' or 'secondary'"),

  body('street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Street must be between 1 and 200 characters'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('mapsUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Maps URL must be a valid URL'),

  amenitiesValidator(false),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer'),
];

export const locationIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];
