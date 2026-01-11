import { prisma } from '@/lib/prisma.lib';
import { NotFoundException } from '@/errors/http-errors';
import { MediaFolder, CreateMediaFolderDto, UpdateMediaFolderDto } from '@/types/media.types';

export class MediaFolderService {
  async findAll(parentId: number | null = null): Promise<MediaFolder[]> {
    return prisma.mediaFolder.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<MediaFolder> {
    const folder = await prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    return folder;
  }

  async create(dto: CreateMediaFolderDto): Promise<MediaFolder> {
    return prisma.mediaFolder.create({
      data: {
        name: dto.name,
        parentId: dto.parentId || null,
      },
    });
  }

  async update(id: number, dto: UpdateMediaFolderDto): Promise<MediaFolder> {
    // Check if folder exists
    await this.findById(id);

    return prisma.mediaFolder.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
      },
    });
  }

  async remove(id: number): Promise<MediaFolder> {
    // Check if folder exists
    await this.findById(id);

    // Folders are deleted with Cascade (from schema), but media should be moved to parent or root
    // The design says move to root (folderId = null) for safety.
    // Prisma onDelete: SetNull on Media.folderId handles this automatically!

    return prisma.mediaFolder.delete({
      where: { id },
    });
  }
}
