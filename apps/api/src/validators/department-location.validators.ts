import { body, param } from 'express-validator';

const amenitiesValidator = (isRequired: boolean) =>
  body('amenities')
    .optional(!isRequired)
    .isArray({ min: 0 })
    .withMessage('Amenities must be an array')
    .custom((amenities: unknown[]) => {
      if (!Array.isArray(amenities)) return true;
      for (const amenity of amenities) {
        if (typeof amenity !== 'object' || amenity === null || !('text' in amenity)) {
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
    .optional({ values: 'undefined' })
    .isString()
    .trim()
    .custom((value: unknown) => {
      if (!value || typeof value !== 'string' || value === '') return true;
      // Basic URL validation
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Maps URL must be a valid URL');
      }
    }),

  amenitiesValidator(true),

  body('sort').optional().isInt({ min: 0 }).withMessage('Sort must be a non-negative integer'),

  body('imageId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('imageId must be a positive integer'),
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

  body('badgeVariant').optional().trim().isIn(['primary', 'secondary']).withMessage("Badge variant must be 'primary' or 'secondary'"),

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
    .optional({ nullable: true })
    .trim()
    .custom((value: unknown) => {
      if (!value || typeof value !== 'string' || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Maps URL must be a valid URL');
      }
    }),

  amenitiesValidator(false),

  body('sort').optional().isInt({ min: 0 }).withMessage('Sort must be a non-negative integer'),

  body('imageId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('imageId must be a positive integer'),
];

export const locationIdParamValidator = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];

export const reorderDepartmentLocationsValidator = [
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
