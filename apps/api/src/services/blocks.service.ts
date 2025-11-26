import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException } from '@/errors/http-errors';
import {
  Block,
  BlockInput,
  CreateBlocksDto,
  UpdateBlockDto,
} from '@/types/block.types';

// Recursive include for children - supports up to 5 levels of nesting
const childrenInclude: Prisma.BlockInclude = {
  children: {
    orderBy: { sort: 'asc' },
    include: {
      children: {
        orderBy: { sort: 'asc' },
        include: {
          children: {
            orderBy: { sort: 'asc' },
            include: {
              children: {
                orderBy: { sort: 'asc' },
                include: {
                  children: {
                    orderBy: { sort: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export class BlocksService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPage(page: string): Promise<Block[]> {
    const blocks = await this.prisma.block.findMany({
      where: {
        page,
        parentId: null, // Only root blocks
      },
      orderBy: { sort: 'asc' },
      include: childrenInclude,
    });

    return blocks as unknown as Block[];
  }

  async findById(id: string): Promise<Block> {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: childrenInclude,
    });

    if (!block) {
      throw new NotFoundException(`Block with ID "${id}" not found`);
    }

    return block as unknown as Block;
  }

  async create(dto: CreateBlocksDto): Promise<Block[]> {
    // Delete all existing blocks for this page
    await this.prisma.block.deleteMany({
      where: { page: dto.page },
    });

    // Create blocks recursively
    const createdBlocks: Block[] = [];

    for (let i = 0; i < dto.blocks.length; i++) {
      const blockInput = dto.blocks[i];
      const block = await this.createBlockRecursive(
        dto.page,
        blockInput,
        i,
        null,
      );
      createdBlocks.push(block);
    }

    return createdBlocks;
  }

  private async createBlockRecursive(
    page: string,
    input: BlockInput,
    sort: number,
    parentId: string | null,
  ): Promise<Block> {
    // Create the block
    const block = await this.prisma.block.create({
      data: {
        page,
        type: input.type,
        sort,
        data: input.data ?? Prisma.JsonNull,
        parentId,
      },
    });

    // Create children recursively
    const children: Block[] = [];
    if (input.children && input.children.length > 0) {
      for (let i = 0; i < input.children.length; i++) {
        const child = await this.createBlockRecursive(
          page,
          input.children[i],
          i,
          block.id,
        );
        children.push(child);
      }
    }

    return {
      ...block,
      children,
    } as Block;
  }

  async update(id: string, dto: UpdateBlockDto): Promise<Block> {
    // First check if block exists
    const existingBlock = await this.prisma.block.findUnique({
      where: { id },
    });

    if (!existingBlock) {
      throw new NotFoundException(`Block with ID "${id}" not found`);
    }

    const updateData: Prisma.BlockUpdateInput = {};

    if (dto.page !== undefined) {
      updateData.page = dto.page;
    }

    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }

    if (dto.sort !== undefined) {
      updateData.sort = dto.sort;
    }

    if (dto.data !== undefined) {
      updateData.data = dto.data ?? Prisma.JsonNull;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parent = { disconnect: true };
      } else {
        updateData.parent = { connect: { id: dto.parentId } };
      }
    }

    const block = await this.prisma.block.update({
      where: { id },
      data: updateData,
      include: childrenInclude,
    });

    return block as unknown as Block;
  }

  async remove(id: string): Promise<Block> {
    // First check if block exists and get it with children
    const existingBlock = await this.prisma.block.findUnique({
      where: { id },
      include: childrenInclude,
    });

    if (!existingBlock) {
      throw new NotFoundException(`Block with ID "${id}" not found`);
    }

    // Delete the block (children cascade via DB)
    await this.prisma.block.delete({
      where: { id },
    });

    return existingBlock as unknown as Block;
  }
}
