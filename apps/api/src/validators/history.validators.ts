import { body } from 'express-validator';
import { prisma } from '@/lib/prisma.lib';

export const updateHistoryValidator = [
  body('heroHeadline').optional().isString().trim().notEmpty(),
  body('heroSubHeadline').optional().isString().trim(),

  body('foundingHeadline').optional().isString().trim().notEmpty(),
  body('foundingNarrative').optional().isArray(),
  body('foundingNarrative.*').isString().trim(),
  body('foundingFactCardHeadline').optional().isString().trim(),
  body('foundingFacts').optional().isArray(),
  body('foundingFacts.*.label').isString().trim().notEmpty(),
  body('foundingFacts.*.value').isString().trim().notEmpty(),

  body('foundingMilestonesHeadline').optional().isString().trim(),
  body('foundingMilestones').optional().isArray(),
  body('foundingMilestones.*.year').isString().trim().notEmpty(),
  body('foundingMilestones.*.title').isString().trim().notEmpty(),
  body('foundingMilestones.*.description').isString().trim(),

  body('developmentHeadline').optional().isString().trim().notEmpty(),
  body('developmentNarrative').optional().isArray(),
  body('developmentNarrative.*').isString().trim(),
  body('developmentChartData').optional().isObject(),
  body('developmentChartData.labels').optional().isArray(),
  body('developmentChartData.datasets').optional().isArray(),

  body('developmentChronicleGroups').optional().isArray(),
  body('developmentChronicleGroups.*.id').isNumeric(),
  body('developmentChronicleGroups.*.title').isString().trim().notEmpty(),
  body('developmentChronicleGroups.*.content').isArray(),
  body('developmentChronicleGroups.*.content.*.year')
    .isString()
    .trim()
    .notEmpty(),
  body('developmentChronicleGroups.*.content.*.text')
    .isString()
    .trim()
    .notEmpty(),

  body('festivalsHeadline').optional().isString().trim().notEmpty(),
  body('festivalsDescription').optional().isString().trim(),
  body('festivalsItems').optional().isArray(),
  body('festivalsItems.*.title').isString().trim().notEmpty(),
  body('festivalsItems.*.subtitle').isString().trim(),
  body('festivalsItems.*.text').isString().trim(),
  body('festivalsItems.*.icon').isString().trim().notEmpty(),

  body('achievementsHeadline').optional().isString().trim().notEmpty(),
  body('achievementsItems').optional().isArray(),
  body('achievementsItems.*.year').isString().trim().notEmpty(),
  body('achievementsItems.*.title').isString().trim().notEmpty(),
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
        throw new Error(
          `Invalid achievement category: ${value}. Must be 'Alle' or a valid department slug.`,
        );
      }
      return true;
    }),

  body('ctaHeadline').optional().isString().trim().notEmpty(),
  body('ctaDescription').optional().isString().trim(),
];
