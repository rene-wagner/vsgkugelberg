import { PrismaClient, Prisma } from '@prisma/client'
import { NotFoundException, ConflictException } from '@/errors/http-errors'
import { CreateCategoryDto, UpdateCategoryDto, Category } from '@/types/category.types'
import { SlugifyService } from '@/services/slugify.service'

export class CategoriesService {
  private readonly slugifyService: SlugifyService

  constructor(private readonly prisma: PrismaClient) {
    this.slugifyService = new SlugifyService(prisma)
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return categories as Category[]
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    })

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`)
    }

    return category as Category
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate unique slug from name
    const slug = await this.slugifyService.generateUniqueCategorySlug(
      createCategoryDto.name,
    )

    // Check if category with the same name already exists
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive',
        },
      },
    })

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      )
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
      },
    })

    return category as Category
  }

  async update(slug: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`)
    }

    // If name is being updated, check for conflicts and regenerate slug
    if (updateCategoryDto.name !== undefined) {
      const conflictingCategory = await this.prisma.category.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive',
          },
          id: {
            not: existingCategory.id,
          },
        },
      })

      if (conflictingCategory) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        )
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {}

    // If name is being updated, regenerate slug
    if (updateCategoryDto.name !== undefined) {
      updateData.name = updateCategoryDto.name
      updateData.slug = await this.slugifyService.generateUniqueCategorySlug(
        updateCategoryDto.name,
        existingCategory.id,
      )
    }

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description
    }

    try {
      const category = await this.prisma.category.update({
        where: { id: existingCategory.id },
        data: updateData,
      })

      return category as Category
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Category with slug "${slug}" not found`)
      }
      throw error
    }
  }

  async remove(slug: string): Promise<Category> {
    // First, find the category by slug
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existingCategory) {
      throw new NotFoundException(`Category with slug "${slug}" not found`)
    }

    try {
      const category = await this.prisma.category.delete({
        where: { id: existingCategory.id },
      })

      return category as Category
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Category with slug "${slug}" not found`)
      }
      throw error
    }
  }
}
