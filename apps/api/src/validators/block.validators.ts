import { body, param, query } from 'express-validator';

// Recursive validator for block input with children
const validateBlockInput = (prefix: string = 'blocks.*') => [
  body(`${prefix}.type`)
    .trim()
    .notEmpty()
    .withMessage('Block type is required')
    .isString()
    .withMessage('Block type must be a string'),

  body(`${prefix}.data`)
    .optional()
    .isObject()
    .withMessage('Data must be an object'),

  body(`${prefix}.children`)
    .optional()
    .isArray()
    .withMessage('Children must be an array'),
];

export const createBlocksValidator = [
  body('page')
    .trim()
    .notEmpty()
    .withMessage('Page is required')
    .isString()
    .withMessage('Page must be a string'),

  body('blocks')
    .isArray({ min: 1 })
    .withMessage('Blocks must be a non-empty array'),

  ...validateBlockInput('blocks.*'),

  // Validate nested children (up to 2 levels deep should be sufficient)
  body('blocks.*.children.*.type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Child block type is required')
    .isString()
    .withMessage('Child block type must be a string'),

  body('blocks.*.children.*.data')
    .optional()
    .isObject()
    .withMessage('Child data must be an object'),

  body('blocks.*.children.*.children')
    .optional()
    .isArray()
    .withMessage('Child children must be an array'),

  // Third level children
  body('blocks.*.children.*.children.*.type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nested child block type is required')
    .isString()
    .withMessage('Nested child block type must be a string'),

  body('blocks.*.children.*.children.*.data')
    .optional()
    .isObject()
    .withMessage('Nested child data must be an object'),
];

export const updateBlockValidator = [
  body('page')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Page cannot be empty')
    .isString()
    .withMessage('Page must be a string'),

  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Type cannot be empty')
    .isString()
    .withMessage('Type must be a string'),

  body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort must be a non-negative integer')
    .toInt(),

  body('data').optional().isObject().withMessage('Data must be an object'),

  body('parentId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
];

export const uuidParamValidator = [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
];

export const pageQueryValidator = [
  query('page')
    .trim()
    .notEmpty()
    .withMessage('Page query parameter is required')
    .isString()
    .withMessage('Page must be a string'),
];
