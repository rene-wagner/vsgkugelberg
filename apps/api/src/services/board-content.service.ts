import { prisma, Prisma } from '@/lib/prisma.lib';
import { UpdateBoardContentDto, BoardContent } from '@/types/board-content.types';

export class BoardContentService {
  /**
   * Get the board content.
   * There is only one record with ID 1.
   */
  async get(client: Prisma.TransactionClient | typeof prisma = prisma): Promise<BoardContent | null> {
    const content = await client.boardContent.findUnique({
      where: { id: 1 },
      include: {
        boardMembers: {
          include: {
            contactPerson: {
              include: {
                profileImage: true,
              },
            },
          },
          orderBy: { sort: 'asc' },
        },
      },
    });

    if (!content) return null;

    // Transform to API-friendly format
    return {
      id: content.id,
      headline: content.headline,
      description: content.description,
      sectionHeadline: content.sectionHeadline,
      sectionDescription: content.sectionDescription,
      note: content.note,
      boardMembers: content.boardMembers.map((bm) => ({
        id: bm.id,
        contactPersonId: bm.contactPerson.id,
        firstName: bm.contactPerson.firstName,
        lastName: bm.contactPerson.lastName,
        type: bm.contactPerson.type,
        email: bm.contactPerson.email,
        phone: bm.contactPerson.phone,
        profileImage: bm.contactPerson.profileImage
          ? {
              id: bm.contactPerson.profileImage.id,
              filename: bm.contactPerson.profileImage.filename,
              path: bm.contactPerson.profileImage.path,
              thumbnails: bm.contactPerson.profileImage.thumbnails,
            }
          : null,
        sort: bm.sort,
      })),
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    };
  }

  /**
   * Update the board content.
   * Uses a transaction to clear existing relations and recreate them.
   */
  async update(data: UpdateBoardContentDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Update scalar fields
      await tx.boardContent.upsert({
        where: { id: 1 },
        update: {
          headline: data.headline,
          description: data.description,
          sectionHeadline: data.sectionHeadline,
          sectionDescription: data.sectionDescription,
          note: data.note,
        },
        create: {
          id: 1,
          headline: data.headline ?? '',
          description: data.description ?? '',
          sectionHeadline: data.sectionHeadline ?? '',
          sectionDescription: data.sectionDescription ?? '',
          note: data.note ?? '',
        },
      });

      // 2. Clear and recreate board members only if provided
      if (data.boardMembers) {
        await tx.boardMember.deleteMany({ where: { boardContentId: 1 } });
        await tx.boardMember.createMany({
          data: data.boardMembers.map((bm, i) => ({
            boardContentId: 1,
            contactPersonId: bm.contactPersonId,
            sort: bm.sort ?? i,
          })),
        });
      }

      return this.get(tx);
    });
  }
}
