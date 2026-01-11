import { body } from 'express-validator';

export const contactFormValidator = [
  body('contactPersonId')
    .notEmpty()
    .withMessage('Contact person ID is required')
    .isInt({ min: 1 })
    .withMessage('Contact person ID must be a positive integer'),

  body('senderName')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('senderEmail').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email address'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),

  // Honeypot field - optional, validated by middleware
  body('website').optional().trim(),

  // Timestamp field - required for honeypot validation
  body('timestamp').notEmpty().withMessage('Timestamp is required'),
];
