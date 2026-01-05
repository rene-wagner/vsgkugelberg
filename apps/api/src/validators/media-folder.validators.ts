import { body, param, query } from 'express-validator';

export const mediaFolderQueryValidator = [
  query('parentId')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === 'null' || value === null) return true;
      return !isNaN(Number(value)) && Number(value) > 0;
    })
    .withMessage('parentId must be null or a positive integer'),
];

export const mediaFolderIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
    .toInt(),
];

export const createMediaFolderValidator = [
  body('name')
    .notEmpty()
    .withMessage('Folder name is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder name must be between 1 and 255 characters'),

  body('parentId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('parentId must be a positive integer')
    .toInt(),
];

export const updateMediaFolderValidator = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder name must be between 1 and 255 characters'),

  body('parentId')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === null) return true;
      return !isNaN(Number(value)) && Number(value) > 0;
    })
    .withMessage('parentId must be null or a positive integer')
    .toInt(),
];
