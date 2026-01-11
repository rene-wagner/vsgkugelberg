import { NotFoundException, BadRequestException } from '@/errors/http-errors';
import { CreateContactPersonDto, UpdateContactPersonDto, ContactPersonWithImage } from '@/types/contact-person.types';
import { PaginatedResponse } from '@/types/pagination.types';
import { Prisma, prisma } from '@/lib/prisma.lib';

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class ContactPersonsService {
  private async validateProfileImage(imageId: number): Promise<void> {
    const media = await prisma.media.findUnique({
      where: { id: imageId },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${imageId} not found`);
    }

    if (!ALLOWED_IMAGE_MIMETYPES.includes(media.mimetype)) {
      throw new BadRequestException('Profile image must be a JPEG, PNG, or WebP file');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ContactPersonWithImage>> {
    const skip = (page - 1) * limit;

    const [contactPersons, total] = await Promise.all([
      prisma.contactPerson.findMany({
        orderBy: { lastName: 'asc' },
        include: { profileImage: true },
        skip,
        take: limit,
      }),
      prisma.contactPerson.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: contactPersons,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<ContactPersonWithImage> {
    const contactPerson = await prisma.contactPerson.findUnique({
      where: { id },
      include: { profileImage: true },
    });

    if (!contactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    return contactPerson;
  }

  async create(createContactPersonDto: CreateContactPersonDto): Promise<ContactPersonWithImage> {
    // Validate profile image if provided
    if (createContactPersonDto.profileImageId !== undefined) {
      await this.validateProfileImage(createContactPersonDto.profileImageId);
    }

    return prisma.contactPerson.create({
      data: {
        firstName: createContactPersonDto.firstName,
        lastName: createContactPersonDto.lastName,
        type: createContactPersonDto.type,
        email: createContactPersonDto.email,
        address: createContactPersonDto.address,
        phone: createContactPersonDto.phone,
        profileImageId: createContactPersonDto.profileImageId,
      },
      include: { profileImage: true },
    });
  }

  async update(id: number, updateContactPersonDto: UpdateContactPersonDto): Promise<ContactPersonWithImage> {
    // First check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id },
    });

    if (!existingContactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    // Validate profile image if provided (not null)
    if (updateContactPersonDto.profileImageId !== undefined && updateContactPersonDto.profileImageId !== null) {
      await this.validateProfileImage(updateContactPersonDto.profileImageId);
    }

    const updateData: Prisma.ContactPersonUpdateInput = {};

    if (updateContactPersonDto.firstName !== undefined) {
      updateData.firstName = updateContactPersonDto.firstName;
    }

    if (updateContactPersonDto.lastName !== undefined) {
      updateData.lastName = updateContactPersonDto.lastName;
    }

    if (updateContactPersonDto.type !== undefined) {
      updateData.type = updateContactPersonDto.type;
    }

    if (updateContactPersonDto.email !== undefined) {
      updateData.email = updateContactPersonDto.email;
    }

    if (updateContactPersonDto.address !== undefined) {
      updateData.address = updateContactPersonDto.address;
    }

    if (updateContactPersonDto.phone !== undefined) {
      updateData.phone = updateContactPersonDto.phone;
    }

    // Handle profileImageId: can be set to a value, or explicitly set to null to remove
    if (updateContactPersonDto.profileImageId !== undefined) {
      updateData.profileImageId = updateContactPersonDto.profileImageId;
    }

    return prisma.contactPerson.update({
      where: { id },
      data: updateData,
      include: { profileImage: true },
    });
  }

  async remove(id: number): Promise<ContactPersonWithImage> {
    // First check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id },
    });

    if (!existingContactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    return prisma.contactPerson.delete({
      where: { id },
      include: { profileImage: true },
    });
  }
}
