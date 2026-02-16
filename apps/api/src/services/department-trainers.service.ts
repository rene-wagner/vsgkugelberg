import { NotFoundException, ConflictException } from '@/errors/http-errors';
import { CreateDepartmentTrainerDto, UpdateDepartmentTrainerDto, DepartmentTrainerWithContactPerson } from '@/types/department-trainer.types';
import { prisma, Prisma } from '@/lib/prisma.lib';

export class DepartmentTrainersService {
  private async getDepartmentIdBySlug(slug: string): Promise<number> {
    const department = await prisma.department.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!department) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    return department.id;
  }

  private async validateContactPerson(contactPersonId: number): Promise<void> {
    const contactPerson = await prisma.contactPerson.findUnique({
      where: { id: contactPersonId },
    });

    if (!contactPerson) {
      throw new NotFoundException(`Contact person with ID ${contactPersonId} not found`);
    }
  }

  async create(departmentSlug: string, dto: CreateDepartmentTrainerDto): Promise<DepartmentTrainerWithContactPerson> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);
    await this.validateContactPerson(dto.contactPersonId);

    try {
      return await prisma.departmentTrainer.create({
        data: {
          departmentId,
          contactPersonId: dto.contactPersonId,
          role: dto.role,
          licenses: dto.licenses as unknown as Prisma.InputJsonValue,
          sort: dto.sort ?? 0,
        },
        include: {
          contactPerson: {
            include: { profileImage: true },
          },
        },
      }) as unknown as DepartmentTrainerWithContactPerson;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`This contact person is already a trainer for this department`);
      }
      throw error;
    }
  }

  async update(departmentSlug: string, id: number, dto: UpdateDepartmentTrainerDto): Promise<DepartmentTrainerWithContactPerson> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify trainer belongs to this department
    const trainer = await prisma.departmentTrainer.findFirst({
      where: { id, departmentId },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found for this department`);
    }

    return prisma.departmentTrainer.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.licenses !== undefined && { licenses: dto.licenses as unknown as Prisma.InputJsonValue }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
      include: {
        contactPerson: {
          include: { profileImage: true },
        },
      },
    }) as unknown as DepartmentTrainerWithContactPerson;
  }

  async remove(departmentSlug: string, id: number): Promise<DepartmentTrainerWithContactPerson> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify trainer belongs to this department
    const trainer = await prisma.departmentTrainer.findFirst({
      where: { id, departmentId },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found for this department`);
    }

    return prisma.departmentTrainer.delete({
      where: { id },
      include: {
        contactPerson: {
          include: { profileImage: true },
        },
      },
    });
  }

  async reorder(departmentSlug: string, ids: number[]): Promise<DepartmentTrainerWithContactPerson[]> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify all trainers belong to this department
    const trainers = await prisma.departmentTrainer.findMany({
      where: { departmentId },
    });

    const existingIds = new Set(trainers.map((t) => t.id));
    for (const id of ids) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Trainer with ID ${id} not found for this department`);
      }
    }

    // Update sort values based on array index
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.departmentTrainer.update({
          where: { id },
          data: { sort: index },
        }),
      ),
    );

    // Return all trainers in new order with contact person data
    return prisma.departmentTrainer.findMany({
      where: { departmentId },
      include: {
        contactPerson: {
          include: { profileImage: true },
        },
      },
      orderBy: { sort: 'asc' },
    });
  }
}
