import { body, param, query } from 'express-validator';
import { EVENT_CATEGORIES } from '@/types/event.types';

// Basic RRULE validation - checks for valid FREQ and common parameters
const isValidRRule = (value: string): boolean => {
  if (!value) return true;

  // Must start with FREQ=
  if (!value.startsWith('FREQ=')) return false;

  // Check for valid frequency
  const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  const freqMatch = value.match(/FREQ=(\w+)/);
  if (!freqMatch || !validFrequencies.includes(freqMatch[1])) return false;

  // Basic structure check - should be semicolon-separated key=value pairs
  const parts = value.split(';');
  for (const part of parts) {
    if (!part.includes('=')) return false;
  }

  return true;
};

export const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('isFullDay')
    .optional()
    .isBoolean()
    .withMessage('isFullDay must be a boolean')
    .toBoolean(),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 500 })
    .withMessage('Location must be at most 500 characters'),

  body('recurrence')
    .optional()
    .isString()
    .withMessage('Recurrence must be a string')
    .custom(isValidRRule)
    .withMessage(
      'Recurrence must be a valid RRULE string (e.g., FREQ=WEEKLY;BYDAY=MO,WE)',
    ),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EVENT_CATEGORIES)
    .withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
];

export const updateEventValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('isFullDay')
    .optional()
    .isBoolean()
    .withMessage('isFullDay must be a boolean')
    .toBoolean(),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 500 })
    .withMessage('Location must be at most 500 characters'),

  body('recurrence')
    .optional()
    .isString()
    .withMessage('Recurrence must be a string')
    .custom(isValidRRule)
    .withMessage(
      'Recurrence must be a valid RRULE string (e.g., FREQ=WEEKLY;BYDAY=MO,WE)',
    ),

  body('category')
    .optional()
    .isIn(EVENT_CATEGORIES)
    .withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
];

export const idParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
    .toInt(),
];

export const eventsQueryValidator = [
  query('start')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('end')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  query('category')
    .optional()
    .isIn(EVENT_CATEGORIES)
    .withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
];
