import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException, ConflictException } from '@/errors/http-errors';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  Department,
} from '@/types/department.types';
import { SlugifyService } from '@/services/slugify.service';

export class DepartmentsService {
  private readonly slugifyService: SlugifyService;

  constructor(private readonly prisma: PrismaClient) {
    this.slugifyService = new SlugifyService(prisma);
  }

  async findAll(): Promise<Department[]> {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { slug },
    });

    if (!department) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Generate unique slug from name
    const slug = await this.slugifyService.generateUniqueDepartmentSlug(
      createDepartmentDto.name,
    );

    try {
      return await this.prisma.department.create({
        data: {
          name: createDepartmentDto.name,
          slug,
          shortDescription: createDepartmentDto.shortDescription,
          longDescription: createDepartmentDto.longDescription,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Department with name "${createDepartmentDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(
    slug: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    // First, find the department by slug
    const existingDepartment = await this.prisma.department.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    const updateData: Prisma.DepartmentUpdateInput = {};

    // If name is being updated, regenerate slug
    if (updateDepartmentDto.name !== undefined) {
      updateData.name = updateDepartmentDto.name;
      updateData.slug = await this.slugifyService.generateUniqueDepartmentSlug(
        updateDepartmentDto.name,
        existingDepartment.id,
      );
    }

    if (updateDepartmentDto.shortDescription !== undefined) {
      updateData.shortDescription = updateDepartmentDto.shortDescription;
    }

    if (updateDepartmentDto.longDescription !== undefined) {
      updateData.longDescription = updateDepartmentDto.longDescription;
    }

    try {
      return await this.prisma.department.update({
        where: { id: existingDepartment.id },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Department with name "${updateDepartmentDto.name}" already exists`,
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Department with slug "${slug}" not found`);
      }
      throw error;
    }
  }

  async remove(slug: string): Promise<Department> {
    // First, find the department by slug
    const existingDepartment = await this.prisma.department.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    try {
      return await this.prisma.department.delete({
        where: { id: existingDepartment.id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Department with slug "${slug}" not found`);
      }
      throw error;
    }
  }
}
