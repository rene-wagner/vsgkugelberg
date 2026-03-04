import { body } from 'express-validator';

export const updateMembershipValidator = [
  // Scalar fields
  body('heroHeadline').optional().isString().trim().notEmpty(),
  body('heroSubHeadline').optional().isString().trim(),
  body('introText').optional().isString().trim(),
  body('trialPeriodHeadline').optional().isString().trim().notEmpty(),
  body('trialPeriodText').optional().isString().trim(),
  body('processHeadline').optional().isString().trim().notEmpty(),
  body('processText').optional().isString().trim(),
  body('documentsHeadline').optional().isString().trim().notEmpty(),
  body('ctaHeadline').optional().isString().trim().notEmpty(),
  body('ctaDescription').optional().isString().trim(),

  // Department stats
  body('departmentStats').optional().isArray(),
  body('departmentStats.*.departmentName').isString().trim().notEmpty(),
  body('departmentStats.*.totalCount').isInt({ min: 0 }),
  body('departmentStats.*.maleCount').isInt({ min: 0 }),
  body('departmentStats.*.femaleCount').isInt({ min: 0 }),

  // Process steps
  body('processSteps').optional().isArray(),
  body('processSteps.*.title').isString().trim().notEmpty(),
  body('processSteps.*.description').isString().trim().notEmpty(),

  // Documents
  body('documents').optional().isArray(),
  body('documents.*.title').isString().trim().notEmpty(),
  body('documents.*.url').isString().trim().notEmpty(),
];
