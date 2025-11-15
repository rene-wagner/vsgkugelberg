import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { generateUniqueDepartmentSlug } from './helpers/slug-generator.helper';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const slug = await generateUniqueDepartmentSlug(
      this.prisma,
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
    const department = await this.prisma.department.findUnique({
      where: { slug },
    });

    if (!department) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    let newSlug = slug;
    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      newSlug = await generateUniqueDepartmentSlug(
        this.prisma,
        updateDepartmentDto.name,
        department.id,
      );
    }

    try {
      return await this.prisma.department.update({
        where: { id: department.id },
        data: {
          name: updateDepartmentDto.name,
          slug: newSlug,
          shortDescription: updateDepartmentDto.shortDescription,
          longDescription: updateDepartmentDto.longDescription,
        },
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
      throw error;
    }
  }

  async remove(slug: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { slug },
    });

    if (!department) {
      throw new NotFoundException(`Department with slug "${slug}" not found`);
    }

    return this.prisma.department.delete({
      where: { id: department.id },
    });
  }
}
