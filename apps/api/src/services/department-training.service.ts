import { NotFoundException } from '@/errors/http-errors';
import {
  CreateDepartmentTrainingGroupDto,
  UpdateDepartmentTrainingGroupDto,
  CreateDepartmentTrainingSessionDto,
  UpdateDepartmentTrainingSessionDto,
  DepartmentTrainingGroupWithSessions,
  DepartmentTrainingSession,
} from '@/types/department-training.types';
import { prisma } from '@/lib/prisma.lib';

export class DepartmentTrainingService {
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

  // Training Group Methods
  async createGroup(
    departmentSlug: string,
    dto: CreateDepartmentTrainingGroupDto,
  ): Promise<DepartmentTrainingGroupWithSessions> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    return prisma.departmentTrainingGroup.create({
      data: {
        departmentId,
        name: dto.name,
        ageRange: dto.ageRange,
        icon: dto.icon,
        variant: dto.variant,
        note: dto.note,
        sort: dto.sort ?? 0,
      },
      include: { sessions: true },
    });
  }

  async updateGroup(
    departmentSlug: string,
    id: number,
    dto: UpdateDepartmentTrainingGroupDto,
  ): Promise<DepartmentTrainingGroupWithSessions> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify group belongs to this department
    const group = await prisma.departmentTrainingGroup.findFirst({
      where: { id, departmentId },
    });

    if (!group) {
      throw new NotFoundException(
        `Training group with ID ${id} not found for this department`,
      );
    }

    return prisma.departmentTrainingGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.ageRange !== undefined && { ageRange: dto.ageRange }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.variant !== undefined && { variant: dto.variant }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
      include: { sessions: true },
    });
  }

  async removeGroup(
    departmentSlug: string,
    id: number,
  ): Promise<DepartmentTrainingGroupWithSessions> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify group belongs to this department
    const group = await prisma.departmentTrainingGroup.findFirst({
      where: { id, departmentId },
    });

    if (!group) {
      throw new NotFoundException(
        `Training group with ID ${id} not found for this department`,
      );
    }

    return prisma.departmentTrainingGroup.delete({
      where: { id },
      include: { sessions: true },
    });
  }

  // Training Session Methods
  async createSession(
    departmentSlug: string,
    groupId: number,
    dto: CreateDepartmentTrainingSessionDto,
  ): Promise<DepartmentTrainingSession> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify group belongs to this department
    const group = await prisma.departmentTrainingGroup.findFirst({
      where: { id: groupId, departmentId },
    });

    if (!group) {
      throw new NotFoundException(
        `Training group with ID ${groupId} not found for this department`,
      );
    }

    return prisma.departmentTrainingSession.create({
      data: {
        trainingGroupId: groupId,
        day: dto.day,
        time: dto.time,
        sort: dto.sort ?? 0,
      },
    });
  }

  async updateSession(
    departmentSlug: string,
    groupId: number,
    id: number,
    dto: UpdateDepartmentTrainingSessionDto,
  ): Promise<DepartmentTrainingSession> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify group belongs to this department
    const group = await prisma.departmentTrainingGroup.findFirst({
      where: { id: groupId, departmentId },
    });

    if (!group) {
      throw new NotFoundException(
        `Training group with ID ${groupId} not found for this department`,
      );
    }

    // Verify session belongs to this group
    const session = await prisma.departmentTrainingSession.findFirst({
      where: { id, trainingGroupId: groupId },
    });

    if (!session) {
      throw new NotFoundException(
        `Training session with ID ${id} not found for this training group`,
      );
    }

    return prisma.departmentTrainingSession.update({
      where: { id },
      data: {
        ...(dto.day !== undefined && { day: dto.day }),
        ...(dto.time !== undefined && { time: dto.time }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
    });
  }

  async removeSession(
    departmentSlug: string,
    groupId: number,
    id: number,
  ): Promise<DepartmentTrainingSession> {
    const departmentId = await this.getDepartmentIdBySlug(departmentSlug);

    // Verify group belongs to this department
    const group = await prisma.departmentTrainingGroup.findFirst({
      where: { id: groupId, departmentId },
    });

    if (!group) {
      throw new NotFoundException(
        `Training group with ID ${groupId} not found for this department`,
      );
    }

    // Verify session belongs to this group
    const session = await prisma.departmentTrainingSession.findFirst({
      where: { id, trainingGroupId: groupId },
    });

    if (!session) {
      throw new NotFoundException(
        `Training session with ID ${id} not found for this training group`,
      );
    }

    return prisma.departmentTrainingSession.delete({
      where: { id },
    });
  }
}
