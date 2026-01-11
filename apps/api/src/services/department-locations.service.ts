import { NotFoundException } from '@/errors/http-errors';
import { CreateDepartmentLocationDto, UpdateDepartmentLocationDto, DepartmentLocation } from '@/types/department-location.types';
import { prisma } from '@/lib/prisma.lib';

export class DepartmentLocationsService {
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

  async create(departmentSlug: string, dto: CreateDepartmentLocationDto): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    return prisma.departmentLocation.create({
      data: {
        departmentId,
        name: dto.name,
        badge: dto.badge,
        badgeVariant: dto.badgeVariant,
        street: dto.street,
        city: dto.city,
        mapsUrl: dto.mapsUrl ?? null,
        amenities: dto.amenities,
        imageId: dto.imageId ?? null,
        sort: dto.sort ?? 0,
      },
      include: { image: true },
    });
  }

  async update(departmentSlug: string, id: number, dto: UpdateDepartmentLocationDto): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify location belongs to this department
    const location = await prisma.departmentLocation.findFirst({
      where: { id, departmentId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found for this department`);
    }

    return prisma.departmentLocation.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.badge !== undefined && { badge: dto.badge }),
        ...(dto.badgeVariant !== undefined && {
          badgeVariant: dto.badgeVariant,
        }),
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.mapsUrl !== undefined && { mapsUrl: dto.mapsUrl }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
        ...(dto.imageId !== undefined && { imageId: dto.imageId }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
      include: { image: true },
    });
  }

  async remove(departmentSlug: string, id: number): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify location belongs to this department
    const location = await prisma.departmentLocation.findFirst({
      where: { id, departmentId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found for this department`);
    }

    return prisma.departmentLocation.delete({
      where: { id },
    });
  }

  async reorder(departmentSlug: string, ids: number[]): Promise<DepartmentLocation[]> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify all locations belong to this department
    const locations = await prisma.departmentLocation.findMany({
      where: { departmentId },
    });

    const existingIds = new Set(locations.map((l) => l.id));
    for (const id of ids) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Location with ID ${id} not found for this department`);
      }
    }

    // Update sort values based on array index
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.departmentLocation.update({
          where: { id },
          data: { sort: index },
        }),
      ),
    );

    // Return all locations in new order
    return prisma.departmentLocation.findMany({
      where: { departmentId },
      orderBy: { sort: 'asc' },
      include: { image: true },
    });
  }
}
