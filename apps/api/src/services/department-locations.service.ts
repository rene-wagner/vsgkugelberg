import { NotFoundException } from '@/errors/http-errors';
import {
  CreateDepartmentLocationDto,
  UpdateDepartmentLocationDto,
  DepartmentLocation,
} from '@/types/department-location.types';
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

  async create(
    departmentSlug: string,
    dto: CreateDepartmentLocationDto,
  ): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    return prisma.departmentLocation.create({
      data: {
        departmentId,
        name: dto.name,
        badge: dto.badge,
        badgeVariant: dto.badgeVariant,
        street: dto.street,
        city: dto.city,
        mapsUrl: dto.mapsUrl,
        amenities: dto.amenities,
        sort: dto.sort ?? 0,
      },
    });
  }

  async update(
    departmentSlug: string,
    id: number,
    dto: UpdateDepartmentLocationDto,
  ): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify location belongs to this department
    const location = await prisma.departmentLocation.findFirst({
      where: { id, departmentId },
    });

    if (!location) {
      throw new NotFoundException(
        `Location with ID ${id} not found for this department`,
      );
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
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
    });
  }

  async remove(
    departmentSlug: string,
    id: number,
  ): Promise<DepartmentLocation> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify location belongs to this department
    const location = await prisma.departmentLocation.findFirst({
      where: { id, departmentId },
    });

    if (!location) {
      throw new NotFoundException(
        `Location with ID ${id} not found for this department`,
      );
    }

    return prisma.departmentLocation.delete({
      where: { id },
    });
  }
}
