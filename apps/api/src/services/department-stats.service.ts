import { NotFoundException } from '@/errors/http-errors';
import { CreateDepartmentStatDto, UpdateDepartmentStatDto, DepartmentStat } from '@/types/department-stat.types';
import { prisma } from '@/lib/prisma.lib';

export class DepartmentStatsService {
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

  async create(departmentSlug: string, dto: CreateDepartmentStatDto): Promise<DepartmentStat> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    return prisma.departmentStat.create({
      data: {
        departmentId,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
      },
    });
  }

  async update(departmentSlug: string, id: number, dto: UpdateDepartmentStatDto): Promise<DepartmentStat> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify stat belongs to this department
    const stat = await prisma.departmentStat.findFirst({
      where: { id, departmentId },
    });

    if (!stat) {
      throw new NotFoundException(`Stat with ID ${id} not found for this department`);
    }

    return prisma.departmentStat.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
    });
  }

  async remove(departmentSlug: string, id: number): Promise<DepartmentStat> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify stat belongs to this department
    const stat = await prisma.departmentStat.findFirst({
      where: { id, departmentId },
    });

    if (!stat) {
      throw new NotFoundException(`Stat with ID ${id} not found for this department`);
    }

    return prisma.departmentStat.delete({
      where: { id },
    });
  }

  async reorder(departmentSlug: string, ids: number[]): Promise<DepartmentStat[]> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify all stats belong to this department
    const stats = await prisma.departmentStat.findMany({
      where: { departmentId },
    });

    const existingIds = new Set(stats.map((s) => s.id));
    for (const id of ids) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Stat with ID ${id} not found for this department`);
      }
    }

    // Update sort values based on array index
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.departmentStat.update({
          where: { id },
          data: { sort: index },
        }),
      ),
    );

    // Return all stats in new order
    return prisma.departmentStat.findMany({
      where: { departmentId },
      orderBy: { sort: 'asc' },
    });
  }
}
