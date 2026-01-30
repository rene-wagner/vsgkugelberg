import { body } from 'express-validator';
import { prisma } from '@/lib/prisma.lib';

export const updateBoardContentValidator = [
  body('headline').optional().isString().trim().notEmpty().withMessage('Headline must not be empty'),
  body('description').optional().isString().trim(),
  body('sectionHeadline').optional().isString().trim().notEmpty().withMessage('Section headline must not be empty'),
  body('sectionDescription').optional().isString().trim(),
  body('note').optional().isString().trim(),

  body('boardMembers').optional().isArray().withMessage('Board members must be an array'),
  body('boardMembers.*.contactPersonId')
    .isInt()
    .withMessage('Contact person ID must be an integer')
    .custom(async (value: number) => {
      const contactPerson = await prisma.contactPerson.findUnique({
        where: { id: value },
      });
      if (!contactPerson) {
        throw new Error(`Contact person with ID ${value} does not exist`);
      }
      return true;
    }),
  body('boardMembers.*.sort').optional().isInt().withMessage('Sort must be an integer'),
];
