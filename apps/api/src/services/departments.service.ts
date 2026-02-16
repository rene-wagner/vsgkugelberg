import { NotFoundException, ConflictException, BadRequestException } from '@/errors/http-errors';
import { CreateDepartmentDto, UpdateDepartmentDto, Department, DepartmentWithIcon, DepartmentWithAllRelations } from '@/types/department.types';
import { PaginatedResponse } from '@/types/pagination.types';
import { SlugifyService } from '@/services/slugify.service';
import { Prisma, prisma } from '@/lib/prisma.lib';

const slugifyService = new SlugifyService();

export class DepartmentsService {
  private async validateSvgIcon(iconId: number): Promise<void> {
    const media = await prisma.media.findUnique({
      where: { id: iconId },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${iconId} not found`);
    }

    if (media.mimetype !== 'image/svg+xml') {
      throw new BadRequestException('Icon must be an SVG file (image/svg+xml mimetype)');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<DepartmentWithIcon>> {
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: { icon: true },
        skip,
        take: limit,
      }),
      prisma.department.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: departments as DepartmentWithIcon[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findBySlug(slug: string): Promise<DepartmentWithAllRelations> {
    const department = await prisma.department.findUnique({
      where: { slug },
      include: {
        icon: true,
        stats: {
          orderBy: { sort: 'asc' },
        },
        trainingGroups: {
          orderBy: { sort: 'asc' },
          include: {
            sessions: {
              orderBy: { sort: 'asc' },
              include: { location: true },
            },
          },
        },
        locations: {
          orderBy: { sort: 'asc' },
          include: { image: true },
        },
        trainers: {
          orderBy: { sort: 'asc' },
          include: {
            contactPerson: {
              include: { profileImage: true },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<DepartmentWithIcon> {
    // Validate icon if provided
    if (createDepartmentDto.iconId !== undefined) {
      await this.validateSvgIcon(createDepartmentDto.iconId);
    }

    // Generate unique slug from name
    const slug = await slugifyService.generateUniqueDepartmentSlug(createDepartmentDto.name);

    try {
      return await prisma.department.create({
        data: {
          name: createDepartmentDto.name,
          slug,
          shortDescription: createDepartmentDto.shortDescription,
          iconId: createDepartmentDto.iconId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { icon: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Department with name "${createDepartmentDto.name}" already exists`);
      }
      throw error;
    }
  }

  async update(slug: string, updateDepartmentDto: UpdateDepartmentDto): Promise<DepartmentWithIcon> {
    // First, find the department by slug
    const existingDepartment = await prisma.department.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    // Validate icon if provided (not null)
    if (updateDepartmentDto.iconId !== undefined && updateDepartmentDto.iconId !== null) {
      await this.validateSvgIcon(updateDepartmentDto.iconId);
    }

    const updateData: Prisma.DepartmentUpdateInput = {};

    // If name is being updated, regenerate slug
    if (updateDepartmentDto.name !== undefined) {
      updateData.name = updateDepartmentDto.name;
      updateData.slug = await slugifyService.generateUniqueDepartmentSlug(updateDepartmentDto.name, existingDepartment.id);
    }

    if (updateDepartmentDto.shortDescription !== undefined) {
      updateData.shortDescription = updateDepartmentDto.shortDescription;
    }

    // Handle iconId: can be set to a value, or explicitly set to null to remove
    if (updateDepartmentDto.iconId !== undefined) {
      if (updateDepartmentDto.iconId === null) {
        updateData.icon = { disconnect: true };
      } else {
        updateData.icon = { connect: { id: updateDepartmentDto.iconId } };
      }
    }

    try {
      return await prisma.department.update({
        where: { id: existingDepartment.id },
        data: updateData,
        include: { icon: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Department with name "${updateDepartmentDto.name}" already exists`);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Department with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Department> {
    // First, find the department by slug
    const existingDepartment = await prisma.department.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    try {
      return await prisma.department.delete({
        where: { id: existingDepartment.id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Department with slug "${slug}" not found`);
      }
      throw error;
    }
  }
}
