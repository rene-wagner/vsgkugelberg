import { body } from 'express-validator';
import { prisma } from '@/lib/prisma.lib';

export const updateHistoryValidator = [
  body('heroHeadline').optional().isString().trim().notEmpty(),
  body('heroSubHeadline').optional().isString().trim(),

  body('foundingHeadline').optional().isString().trim().notEmpty(),
  body('foundingDescription').optional().isString().trim(),
  body('foundingFactCardHeadline').optional().isString().trim(),
  body('foundingDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Founding date must be a valid ISO8601 date string')
    .custom((value: unknown) => {
      if (value && typeof value === 'string' && new Date(value) > new Date()) {
        throw new Error('Founding date cannot be in the future');
      }
      return true;
    }),
  body('foundingFacts').optional().isArray(),
  body('foundingFacts.*.year').isString().trim().notEmpty(),
  body('foundingFacts.*.headline').isString().trim().notEmpty(),
  body('foundingFacts.*.description').isString().trim(),

  body('foundingMilestonesHeadline').optional().isString().trim(),
  body('foundingMilestones').optional().isArray(),
  body('foundingMilestones.*.year').isString().trim().notEmpty(),
  body('foundingMilestones.*.headline').isString().trim().notEmpty(),
  body('foundingMilestones.*.description').isString().trim(),

  body('developmentHeadline').optional().isString().trim().notEmpty(),
  body('developmentDescription').optional().isString().trim(),
  body('developmentChartData').optional().isObject(),
  body('developmentChartData.labels').optional().isArray(),
  body('developmentChartData.datasets').optional().isArray(),

  body('developmentChronicleGroups').optional().isArray(),
  body('developmentChronicleGroups.*.id').optional().isNumeric(),
  body('developmentChronicleGroups.*.headline').isString().trim().notEmpty(),
  body('developmentChronicleGroups.*.content').isArray(),
  body('developmentChronicleGroups.*.content.*.year').isString().trim().notEmpty(),
  body('developmentChronicleGroups.*.content.*.description').isString().trim().notEmpty(),

  body('festivalsHeadline').optional().isString().trim().notEmpty(),
  body('festivalsDescription').optional().isString().trim(),
  body('festivalsItems').optional().isArray(),
  body('festivalsItems.*.headline').isString().trim().notEmpty(),
  body('festivalsItems.*.text').isString().trim(),

  body('achievementsHeadline').optional().isString().trim().notEmpty(),
  body('achievementsItems').optional().isArray(),
  body('achievementsItems.*.year').isString().trim().notEmpty(),
  body('achievementsItems.*.headline').isString().trim().notEmpty(),
  body('achievementsItems.*.description').isString().trim(),
  body('achievementsItems.*.category')
    .isString()
    .trim()
    .notEmpty()
    .custom(async (value) => {
      if (value === 'Alle') return true;
      const department = await prisma.department.findUnique({
        where: { slug: value },
      });
      if (!department) {
        throw new Error(`Invalid achievement category: ${value}. Must be 'Alle' or a valid department slug.`);
      }
      return true;
    }),

  body('ctaHeadline').optional().isString().trim().notEmpty(),
  body('ctaDescription').optional().isString().trim(),
];
