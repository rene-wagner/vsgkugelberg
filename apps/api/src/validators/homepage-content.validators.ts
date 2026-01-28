import { body } from 'express-validator';

export const updateHomepageContentValidator = [
  body('heroHeadline').optional().isString().trim().notEmpty(),
  body('heroDescription').optional().isString().trim(),
  body('heroTag').optional().isString().trim(),

  body('departmentsHeadline').optional().isString().trim(),
  body('departmentsDescription').optional().isString().trim(),
  body('departmentsSubtitle').optional().isString().trim(),

  body('postsHeadline').optional().isString().trim(),
  body('postsDescription').optional().isString().trim(),
  body('postsSubtitle').optional().isString().trim(),
  body('postsCount').optional().isInt({ min: 1 }).withMessage('postsCount must be a positive integer'),

  body('ctaHeadline').optional().isString().trim(),
  body('ctaDescription').optional().isString().trim(),

  body('stats').optional().isArray(),
  body('stats.*.label').isString().trim().notEmpty(),
  body('stats.*.value').isString().trim().notEmpty(),
  body('stats.*.sort').optional().isInt({ min: 0 }),
];
