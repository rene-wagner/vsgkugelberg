import { Block as PrismaBlock, Prisma } from '@prisma/client';

export interface BlockInput {
  type: string;
  data?: Prisma.JsonValue;
  children?: BlockInput[];
}

export interface CreateBlocksDto {
  page: string;
  blocks: BlockInput[];
}

export interface UpdateBlockDto {
  page?: string;
  type?: string;
  sort?: number;
  data?: Prisma.JsonValue;
  parentId?: string | null;
}

// Block with recursive children - uses unknown for deep nesting compatibility
export interface Block extends PrismaBlock {
  children: Block[];
}

// Type for Prisma query results with nested children
export type BlockWithChildren = PrismaBlock & {
  children: BlockWithChildren[];
};
