import { PasswordService } from './password.service';
import { NotFoundException, ConflictException } from '@/errors/http-errors';
import { Prisma, prisma } from '@/lib/prisma.lib';
import { CreateUserDto, UpdateUserDto, UserResponse } from '@/types/user.types';

const passwordService = new PasswordService();

export class UsersService {
  async findAll(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async findOne(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await passwordService.hash(createUserDto.password);

    try {
      const user = await prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        const field = target?.[0] || 'field';
        throw new ConflictException(`User with this ${field} already exists`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.findOne(id);

    const updateData: Prisma.UserUpdateInput = {};

    if (updateUserDto.username !== undefined) {
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      updateData.password = await passwordService.hash(updateUserDto.password);
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        const field = target?.[0] || 'field';
        throw new ConflictException(`User with this ${field} already exists`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<UserResponse> {
    await this.findOne(id);

    try {
      const user = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
